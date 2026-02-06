import Bid from "../models/bid.model.js";
import Listing from "../models/listing.model.js";
import Transaction from "../models/transaction.model.js";
import Delivery from "../models/delivery.model.js";
import Certificate from "../models/certificate.model.js";
import mongoose from "mongoose";
import {
  createCheckoutSession,
  retrieveCheckoutSession,
  stripe,
} from "../services/stripeService.js";

// Utility function to validate ObjectId
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

//get all bids for a specific listing
export const getBidsForListing = async (req, res) => {
  try {
    //check whether user is authenticated or not
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { listingId } = req.params;

    // Validate ObjectId format
    if (!isValidObjectId(listingId)) {
      return res.status(400).json({ message: "Invalid listing ID format" });
    }

    // Check if the listing exists
    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    // Fetch bids for the specified listing and populate bidder details
    const bids = await Bid.find({ listing: listingId })
      .populate("bids.bidder", "name email addresses phone")
      .populate("seller", "name email addresses phone")
      .populate("listing")
      .sort({ "bids.amount": -1 }); // Sort by bid amount descending

    res.status(200).json({
      bids,
      totalBids: bids.length > 0 ? bids[0].bids.length : 0,
      highestBid: bids.length > 0 ? bids[0].highestBid : 0,
    });
  } catch (error) {
    console.error("Error fetching bids for listing:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//bid making controller
export const makeBid = async (req, res) => {
  try {
    const { listingId, amount } = req.body;

    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Try both possible property names for user ID
    const bidderId = req.user.id;

    if (!bidderId) {
      return res
        .status(401)
        .json({ message: "User ID not found in authentication" });
    }

    // Validate input
    if (!listingId || !amount) {
      return res
        .status(400)
        .json({ message: "Listing ID and bid amount are required" });
    }

    // Validate ObjectId format
    if (!isValidObjectId(listingId)) {
      return res.status(400).json({ message: "Invalid listing ID format" });
    }

    // Check if the listing exists and is still open
    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    if (listing.status !== "open") {
      return res
        .status(400)
        .json({ message: "This listing is no longer available for bidding" });
    }

    // Prevent sellers from bidding on their own listings (Fixed ObjectId comparison)
    if (listing.seller.toString() === bidderId.toString()) {
      return res
        .status(403)
        .json({ message: "Sellers cannot bid on their own listings" });
    }

    // Check if user has an approved certificate (for recyclers)
    if (req.user.userType === "recycler") {
      const approvedCertificate = await Certificate.findOne({
        uploadby: bidderId,
        status: "approved",
      });

      if (!approvedCertificate) {
        // Check if user has any certificates at all
        const anyCertificate = await Certificate.findOne({
          uploadby: bidderId,
        });

        if (!anyCertificate) {
          return res.status(403).json({
            message:
              "Please upload a valid certificate before placing bids. Visit the Certificates page to get started.",
            code: "NO_CERTIFICATE",
          });
        }

        // User has certificate but it's not approved
        const pendingCertificate = await Certificate.findOne({
          uploadby: bidderId,
          status: "pending",
        });

        if (pendingCertificate) {
          return res.status(403).json({
            message:
              "Your certificate is under review. Please wait for admin approval before placing bids.",
            code: "CERTIFICATE_PENDING",
          });
        }

        // Certificate was disapproved
        return res.status(403).json({
          message:
            "Your certificate was disapproved. Please upload a valid certificate to place bids.",
          code: "CERTIFICATE_DISAPPROVED",
        });
      }
    }

    // Validate bid amount
    if (amount <= 0) {
      return res
        .status(400)
        .json({ message: "Bid amount must be greater than zero" });
    }

    if (!Number.isFinite(amount)) {
      return res.status(400).json({ message: "Invalid bid amount format" });
    }

    // Calculate minimum bid: 50% of listing price
    const minimumBidAmount = listing.price / 2;

    // Validate bid amount against minimum (50% of listing price)
    if (amount < minimumBidAmount) {
      return res.status(400).json({
        message: `Bid must be at least $${minimumBidAmount.toFixed(
          2
        )} (50% of listing price)`,
        minimumBid: minimumBidAmount,
        listingPrice: listing.price,
      });
    }

    // Find existing bid document for the listing or create a new one
    let bidDoc = await Bid.findOne({ listing: listingId });
    if (!bidDoc) {
      bidDoc = new Bid({
        seller: listing.seller,
        listing: listingId,
        bids: [],
        minimumBidIncrement: 1, // Default increment
      });
    }

    // Check if auction is still open
    if (bidDoc.status !== "open") {
      return res
        .status(400)
        .json({ message: "Bidding is closed for this listing" });
    }

    // Check if user has already placed a bid (optional - you can allow multiple bids per user)
    const existingBidFromUser = bidDoc.bids.find(
      (bid) => bid.bidder.toString() === bidderId.toString()
    );
    if (existingBidFromUser) {
      return res.status(400).json({
        message:
          "You have already placed a bid on this listing. You can withdraw and place a new bid if needed.",
      });
    }

    // Add the new bid to the bids array
    const newBid = { amount, bidder: bidderId };

    bidDoc.bids.push(newBid);

    // Save the updated bid document (pre-save middleware will update highestBid)
    await bidDoc.save();

    // Populate the response with bidder details
    await bidDoc.populate("bids.bidder", "name email");

    res.status(200).json({
      message: "Bid placed successfully",
      bid: bidDoc,
      newHighestBid: bidDoc.highestBid,
      totalBids: bidDoc.bids.length,
    });
  } catch (error) {
    console.error("Error making a bid:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//once the auction is closed then only the buyer can be selected from the bids that is got accepted by the seller so use we will make the bidder as the buyer in the bid
export const selectBuyer = async (req, res) => {
  try {
    const { listingId, bidderId } = req.body;

    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const sellerId = req.user.id;

    // Validate input
    if (!listingId || !bidderId) {
      return res
        .status(400)
        .json({ message: "Listing ID and bidder ID are required" });
    }

    // Validate ObjectId formats
    if (!isValidObjectId(listingId) || !isValidObjectId(bidderId)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    // Find the bid document by listing ID
    const bidDoc = await Bid.findOne({ listing: listingId }).populate(
      "listing"
    );

    if (!bidDoc) {
      return res
        .status(404)
        .json({ message: "Bid document not found for this listing" });
    }

    // Verify seller authorization
    if (bidDoc.seller.toString() !== sellerId.toString()) {
      return res
        .status(403)
        .json({ message: "Forbidden: You are not the seller of this listing" });
    }

    // Check if auction is already closed
    if (bidDoc.status === "closed") {
      return res.status(400).json({ message: "Auction is already closed" });
    }

    // Check if there are any bids
    if (!bidDoc.bids || bidDoc.bids.length === 0) {
      return res
        .status(400)
        .json({ message: "No bids available to select from" });
    }

    // Check if the bidder exists in the bids array
    const selectedBid = bidDoc.bids.find(
      (bid) => bid.bidder.toString() === bidderId
    );
    if (!selectedBid) {
      return res.status(404).json({ message: "Bidder not found in the bids" });
    }

    // Update the buyer field and seller acceptance
    bidDoc.buyer = bidderId;
    bidDoc.sellerAccepted = true;

    // Update listing with buyer and final price
    const listing = await Listing.findById(listingId);
    if (listing) {
      listing.buyer = bidderId;
      listing.finalPrice = selectedBid.amount;
      
      // Check if buyer already accepted (unlikely but possible)
      if (bidDoc.buyerAccepted) {
        // Both accepted → Close bidding, but DON'T mark as paid yet
        bidDoc.status = "closed";
        bidDoc.closeReason = "buyer_selected";
        bidDoc.closedAt = new Date();
        
        listing.status = "closed";
        listing.status_update_by = sellerId;
      }
      
      await listing.save();
    }

    // Save the updated bid document
    await bidDoc.save();

    // DON'T create transaction/delivery/invoice here - wait for payment!

    // Populate the response with complete details
    await bidDoc.populate([
      { path: "buyer", select: "name email phone" },
      { path: "bids.bidder", select: "name email" },
    ]);

    res.status(200).json({
      message: bidDoc.status === "closed" 
        ? "Buyer selected! Awaiting payment from buyer."
        : "Buyer selected! Awaiting buyer confirmation.",
      bid: bidDoc,
      selectedBidAmount: selectedBid.amount,
      buyerDetails: bidDoc.buyer,
      awaitingPayment: bidDoc.status === "closed" && !bidDoc.isPaid,
    });
  } catch (error) {
    console.error("Error selecting buyer:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get highest bid for a specific listing
export const getHighestBid = async (req, res) => {
  try {
    const { listingId } = req.params;

    if (!isValidObjectId(listingId)) {
      return res.status(400).json({ message: "Invalid listing ID format" });
    }

    const bidDoc = await Bid.findOne({ listing: listingId })
      .populate("bids.bidder", "name")
      .sort({ highestBid: -1 });

    if (!bidDoc || bidDoc.bids.length === 0) {
      return res
        .status(404)
        .json({ message: "No bids found for this listing" });
    }

    // Find the bid with highest amount
    const highestBidDetails = bidDoc.bids.reduce((highest, current) =>
      current.amount > highest.amount ? current : highest
    );

    res.status(200).json({
      highestBid: bidDoc.highestBid,
      bidDetails: highestBidDetails,
      totalBids: bidDoc.bids.length,
      auctionStatus: bidDoc.status,
    });
  } catch (error) {
    console.error("Error fetching highest bid:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Withdraw a bid (if business logic allows)
export const withdrawBid = async (req, res) => {
  try {
    const { listingId } = req.body;

    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const bidderId = req.user.id;

    if (!isValidObjectId(listingId)) {
      return res.status(400).json({ message: "Invalid listing ID format" });
    }

    // Find the bid document
    const bidDoc = await Bid.findOne({ listing: listingId });
    if (!bidDoc) {
      return res
        .status(404)
        .json({ message: "No bids found for this listing" });
    }

    if (bidDoc.status !== "open") {
      return res
        .status(400)
        .json({ message: "Cannot withdraw bid from closed auction" });
    }

    // Find and remove the user's bid
    const bidIndex = bidDoc.bids.findIndex(
      (bid) => bid.bidder.toString() === bidderId.toString()
    );
    if (bidIndex === -1) {
      return res
        .status(404)
        .json({ message: "You have not placed a bid on this listing" });
    }

    const withdrawnBid = bidDoc.bids[bidIndex];
    bidDoc.bids.splice(bidIndex, 1);

    // Save the updated document (pre-save middleware will recalculate highestBid)
    await bidDoc.save();

    res.status(200).json({
      message: "Bid withdrawn successfully",
      withdrawnAmount: withdrawnBid.amount,
      remainingBids: bidDoc.bids.length,
      newHighestBid: bidDoc.highestBid,
    });
  } catch (error) {
    console.error("Error withdrawing bid:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Close auction manually (seller only)
export const closeAuction = async (req, res) => {
  try {
    const { bidId, reason } = req.body;

    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const sellerId = req.user.id;

    if (!isValidObjectId(bidId)) {
      return res.status(400).json({ message: "Invalid bid ID format" });
    }

    const bidDoc = await Bid.findById(bidId);
    if (!bidDoc) {
      return res.status(404).json({ message: "Bid document not found" });
    }

    if (bidDoc.seller.toString() !== sellerId.toString()) {
      return res
        .status(403)
        .json({ message: "Only the seller can close the auction" });
    }

    if (bidDoc.status === "closed") {
      return res.status(400).json({ message: "Auction is already closed" });
    }

    bidDoc.status = "closed";
    bidDoc.closeReason = reason || "seller_cancelled";
    bidDoc.closedAt = new Date();

    // Update listing status
    const listing = await Listing.findById(bidDoc.listing);
    if (listing) {
      listing.status = "closed";
      listing.status_update_by = sellerId;
      await listing.save();
    }

    await bidDoc.save();

    res.status(200).json({
      message: "Auction closed successfully",
      bid: bidDoc,
    });
  } catch (error) {
    console.error("Error closing auction:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get bid history for a user
export const getUserBidHistory = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    // Find all bids where user is a bidder
    const bidDocs = await Bid.find({
      "bids.bidder": userId,
    })
      .populate("listing")
      .populate("seller", "name email")
      .sort({ updatedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const userBids = [];
    bidDocs.forEach((bidDoc) => {
      const userBidsInThisListing = bidDoc.bids.filter(
        (bid) => bid.bidder.toString() === userId.toString()
      );
      userBidsInThisListing.forEach((bid) => {
        userBids.push({
          bidAmount: bid.amount,
          bidDate: bid.createdAt,
          listing: bidDoc.listing,
          seller: bidDoc.seller,
          auctionStatus: bidDoc.status,
          isWinning:
            bidDoc.buyer && bidDoc.buyer.toString() === userId.toString(),
          currentHighestBid: bidDoc.highestBid,
        });
      });
    });

    res.status(200).json({
      bids: userBids,
      totalBids: userBids.length,
      page: parseInt(page),
      totalPages: Math.ceil(userBids.length / limit),
    });
  } catch (error) {
    console.error("Error fetching user bid history:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// NEW: Buyer accepts the deal
export const buyerAcceptDeal = async (req, res) => {
  try {
    const { listingId } = req.params;
    const buyerId = req.user.id;

    const bidDoc = await Bid.findOne({ listing: listingId, buyer: buyerId })
      .populate("listing")
      .populate("seller", "name email")
      .populate("buyer", "name email");

    if (!bidDoc) {
      return res.status(404).json({ message: "You are not the selected buyer for this listing" });
    }

    if (bidDoc.status === "closed" && bidDoc.isPaid) {
      return res.status(400).json({ message: "Deal already completed" });
    }

    // Buyer accepts
    bidDoc.buyerAccepted = true;

    // If seller already accepted, close bidding
    if (bidDoc.sellerAccepted) {
      bidDoc.status = "closed";
      bidDoc.closeReason = "buyer_selected";
      bidDoc.closedAt = new Date();

      // Update listing status
      const listing = await Listing.findById(listingId);
      if (listing) {
        listing.status = "closed";
        await listing.save();
      }
    }

    await bidDoc.save();

    res.status(200).json({
      message: bidDoc.status === "closed"
        ? "Deal confirmed! Please proceed with payment."
        : "You accepted the deal. Waiting for seller confirmation.",
      bidDoc,
      awaitingPayment: bidDoc.status === "closed" && !bidDoc.isPaid,
    });
  } catch (error) {
    console.error("Error accepting deal:", error);
    res.status(500).json({ message: "Failed to accept deal" });
  }
};

// Get bid status (for frontend to check payment state)
export const getBidStatus = async (req, res) => {
  try {
    const { listingId } = req.params;
    const userId = req.user.id;

    const bidDoc = await Bid.findOne({ listing: listingId })
      .populate("buyer", "name email")
      .populate("seller", "name email")
      .select("-bids"); // Don't send all bid details

    if (!bidDoc) {
      return res.status(404).json({ message: "Bid not found" });
    }

    // Check if user is involved in this bid
    const isBuyer = bidDoc.buyer?._id.toString() === userId;
    const isSeller = bidDoc.seller._id.toString() === userId;

    if (!isBuyer && !isSeller) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Determine if buyer can proceed with payment workflow
    const isWinningBidder = isBuyer && bidDoc.sellerAccepted;
    const awaitingPayment = bidDoc.status === "closed" && !bidDoc.isPaid;
    const canPay = isWinningBidder && bidDoc.status === "closed" && !bidDoc.isPaid;

    res.status(200).json({
      status: bidDoc.status,
      buyerAccepted: bidDoc.buyerAccepted,
      sellerAccepted: bidDoc.sellerAccepted,
      isPaid: bidDoc.isPaid,
      invoiceNumber: bidDoc.invoiceNumber,
      awaitingPayment,
      canPay: isWinningBidder, // User is winning bidder if seller accepted them
      highestBid: bidDoc.highestBid,
    });
  } catch (error) {
    console.error("Error fetching bid status:", error);
    res.status(500).json({ message: "Failed to fetch bid status" });
  }
};

// NEW: Create Stripe Checkout Session (redirect to Stripe UI)
export const createStripeCheckoutSession = async (req, res) => {
  try {
    const { listingId } = req.params;
    const buyerId = req.user.id;

    const bidDoc = await Bid.findOne({ listing: listingId, buyer: buyerId })
      .populate("listing", "product_category brand model")
      .populate("buyer", "name email");

    if (!bidDoc) {
      return res.status(404).json({ message: "Bid not found" });
    }

    // Check if user is the selected buyer (winning bidder)
    if (!bidDoc.sellerAccepted) {
      return res.status(400).json({ 
        message: "You have not been selected as the winner yet." 
      });
    }

    if (bidDoc.isPaid) {
      return res.status(400).json({ message: "Payment already completed" });
    }

    // Buyer must have accepted before payment
    if (!bidDoc.buyerAccepted) {
      return res.status(400).json({ 
        message: "You must accept the deal first before making payment." 
      });
    }

    const amount = bidDoc.highestBid;
    const productName = `${bidDoc.listing.product_category} - ${bidDoc.listing.brand} ${bidDoc.listing.model}`;
    
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const successUrl = `${frontendUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}&listing_id=${listingId}`;
    const cancelUrl = `${frontendUrl}/recycler/listings`;

    // Import checkout session function
    const { createCheckoutSession } = await import("../services/stripeService.js");
    
    const session = await createCheckoutSession(
      amount,
      productName,
      {
        listingId: listingId,
        buyerId: buyerId,
        bidId: bidDoc._id.toString(),
      },
      successUrl,
      cancelUrl
    );

    res.status(200).json({
      success: true,
      sessionId: session.id,
      url: session.url, // Stripe Checkout URL to redirect to
    });
  } catch (error) {
    console.error("Error creating Stripe Checkout Session:", error);
    res.status(500).json({ 
      message: "Failed to create checkout session",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};

// NEW: Verify Stripe Checkout Session and process payment
export const verifyStripeCheckoutSession = async (req, res) => {
  try {
    const { listingId } = req.params;
    const { session_id } = req.body;
    const buyerId = req.user.id;

    if (!session_id) {
      return res.status(400).json({ message: "Session ID is required" });
    }

    // Import retrieve function
    const { retrieveCheckoutSession } = await import("../services/stripeService.js");
    
    // Retrieve the session from Stripe
    const session = await retrieveCheckoutSession(session_id);

    if (session.payment_status !== 'paid') {
      return res.status(400).json({ message: "Payment not completed" });
    }

    // Get the bid document - try different methods to find it
    
    // First try to find by listing and buyer
    let bidDoc = await Bid.findOne({ listing: listingId, buyer: buyerId })
      .populate("listing")
      .populate("buyer", "name email")
      .populate("seller", "name email");

    // If not found, try using session metadata bidId
    if (!bidDoc && session.metadata?.bidId) {
      bidDoc = await Bid.findById(session.metadata.bidId)
        .populate("listing")
        .populate("buyer", "name email")
        .populate("seller", "name email");
    }

    // If still not found, try finding by listing and seller accepted
    if (!bidDoc) {
      bidDoc = await Bid.findOne({ listing: listingId, sellerAccepted: true })
        .populate("listing")
        .populate("buyer", "name email")
        .populate("seller", "name email");
      
      // Verify the buyer matches
      if (bidDoc && bidDoc.buyer?._id.toString() !== buyerId) {
        return res.status(403).json({ message: "Unauthorized: Not the winning bidder" });
      }
    }

    if (!bidDoc) {
      return res.status(404).json({ message: "Bid not found" });
    }

    if (bidDoc.isPaid) {
      return res.status(200).json({ 
        success: true,
        message: "Payment already processed",
        alreadyPaid: true,
        transaction: bidDoc.transaction 
      });
    }

    // Mark as paid
    bidDoc.isPaid = true;
    bidDoc.paidAt = new Date();
    bidDoc.paymentIntentId = session.payment_intent;
    await bidDoc.save();

    // Create transaction
    const invoiceNumber = `INV-${Date.now()}`;
    const transaction = new Transaction({
      listing: bidDoc.listing._id,
      buyer: bidDoc.buyer._id,
      seller: bidDoc.seller._id,
      amount: bidDoc.highestBid,
      status: "completed",
      paymentMethod: "stripe_checkout",
      invoiceNumber,
      paidAt: new Date(),
    });
    await transaction.save();

    // Create delivery
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 7);
    const delivery = new Delivery({
      orderId: bidDoc.listing._id,
      sellerId: bidDoc.seller._id,
      buyerId: bidDoc.buyer._id,
      deliveryDate: deliveryDate,
      status_delivery: "pending",
      trackingNumber: `TRK-${Date.now()}`,
    });
    await delivery.save();

    // Send invoices
    try {
      const { sendInvoiceEmail, sendSellerInvoiceEmail } = await import("../services/mailVerficationservice.js");
      
      await sendInvoiceEmail(bidDoc.buyer.email, {
        invoiceNumber,
        listing: bidDoc.listing,
        transaction,
        buyerName: bidDoc.buyer.name,
      });

      await sendSellerInvoiceEmail(bidDoc.seller.email, {
        invoiceNumber,
        listing: bidDoc.listing,
        transaction,
        sellerName: bidDoc.seller.name,
        buyerName: bidDoc.buyer.name,
      });
    } catch (emailError) {
      console.error("Error sending invoice emails:", emailError);
      // Don't fail the request if email fails
    }

    res.status(200).json({
      success: true,
      message: "✅ Payment verified successfully! Invoices sent to both parties via email.",
      payment: {
        status: "completed",
        method: "stripe_checkout",
        paidAt: bidDoc.paidAt,
      },
      transaction: {
        id: transaction._id,
        invoiceNumber,
        amount: transaction.amount,
        status: transaction.status,
      },
      delivery: {
        id: delivery._id,
        trackingNumber: delivery.trackingNumber,
        expectedDate: delivery.deliveryDate,
        status: delivery.status_delivery,
      },
      notifications: {
        buyerInvoiceSent: true,
        sellerInvoiceSent: true,
        emailSentTo: [bidDoc.buyer.email, bidDoc.seller.email],
      },
    });
  } catch (error) {
    console.error("Error verifying Stripe Checkout:", error);
    res.status(500).json({ 
      message: "Failed to verify payment",
      error: process.env.NODE_ENV === "development" ? error.message : undefined 
    });
  }
};

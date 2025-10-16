import Bid from "../models/bid.model.js";
import Listing from "../models/listing.model.js";
import mongoose from "mongoose";

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
      .populate("bids.bidder", "name email address phone")
      .populate("seller", "name email address phone")
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
      console.log("req.user object:", req.user);
      return res
        .status(401)
        .json({ message: "User ID not found in authentication" });
    }

    console.log("Making bid - User ID:", bidderId);
    console.log("Listing ID:", listingId);
    console.log("Amount:", amount);

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

    // Validate bid amount
    if (amount <= 0) {
      return res
        .status(400)
        .json({ message: "Bid amount must be greater than zero" });
    }

    if (!Number.isFinite(amount)) {
      return res.status(400).json({ message: "Invalid bid amount format" });
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

    // Validate bid amount against current highest bid
    if (
      bidDoc.highestBid > 0 &&
      amount <= bidDoc.highestBid + bidDoc.minimumBidIncrement
    ) {
      return res.status(400).json({
        message: `Bid must be at least $${
          bidDoc.highestBid + bidDoc.minimumBidIncrement
        }`,
        minimumBid: bidDoc.highestBid + bidDoc.minimumBidIncrement,
        currentHighestBid: bidDoc.highestBid,
      });
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

    console.log("About to add bid - bidderId:", bidderId);
    console.log("BidderId type:", typeof bidderId);
    console.log("Amount:", amount);
    console.log("Amount type:", typeof amount);

    // Add the new bid to the bids array
    const newBid = { amount, bidder: bidderId };
    console.log("New bid object:", newBid);

    bidDoc.bids.push(newBid);

    console.log("Bid document before save:", JSON.stringify(bidDoc, null, 2));

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
    const { bidId, bidderId } = req.body;

    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const sellerId = req.user.id;
    const listingId = await Bid.findById(bidId).then((bid) => bid.listing);
    const listingStatus = await Listing.findById(listingId);
    const newStatus = "closed";
    listingStatus.status = newStatus;
    await listingStatus.save();

    // Validate input
    if (!bidId || !bidderId) {
      return res
        .status(400)
        .json({ message: "Bid ID and bidder ID are required" });
    }

    // Validate ObjectId formats
    if (!isValidObjectId(bidId) || !isValidObjectId(bidderId)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    // Find the bid document to ensure the seller is authorized
    const bidForAuth = await Bid.findById(bidId);
    if (!bidForAuth) {
      return res.status(404).json({ message: "Bid document not found" });
    }
    if (bidForAuth.seller.toString() !== sellerId.toString()) {
      return res
        .status(403)
        .json({ message: "Forbidden: You are not the seller of this listing" });
    }

    // Check if auction is already closed
    if (bidForAuth.status === "closed") {
      return res.status(400).json({ message: "Auction is already closed" });
    }

    // Find the bid document by its ID
    const bidDoc = await Bid.findById(bidId).populate("listing");
    if (!bidDoc) {
      return res.status(404).json({ message: "Bid document not found" });
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

    // Update the buyer field and close the auction
    bidDoc.buyer = bidderId;
    bidDoc.status = "closed";
    bidDoc.closeReason = "buyer_selected";
    bidDoc.closedAt = new Date();

    // Update the listing status as well
    const listing = await Listing.findById(bidDoc.listing._id);
    if (listing) {
      listing.status_update_by = sellerId;
      await listing.save();
    }

    // Save the updated bid document
    await bidDoc.save();

    // Populate the response with complete details
    await bidDoc.populate([
      { path: "buyer", select: "name email phone" },
      { path: "bids.bidder", select: "name email" },
    ]);

    res.status(200).json({
      message: "Buyer selected successfully",
      bid: bidDoc,
      selectedBidAmount: selectedBid.amount,
      buyerDetails: bidDoc.buyer,
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
      .populate("listing", "name description price status")
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

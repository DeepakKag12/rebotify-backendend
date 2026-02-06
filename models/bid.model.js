import mongoose from "mongoose";

const bidSchema = new mongoose.Schema(
  {
    bids: [
      {
        amount: {
          type: Number,
          required: true,
          min: [0.01, "Bid amount must be greater than zero"],
        },
        bidder: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Listing",
      required: true,
    },
    status: {
      type: String,
      enum: ["open", "closed"],
      default: "open",
    },
    buyerAccepted: {
      type: Boolean,
      default: false,
    },
    sellerAccepted: {
      type: Boolean,
      default: false,
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    invoiceNumber: {
      type: String,
    },
    paymentDate: {
      type: Date,
    },
    minimumBidIncrement: {
      type: Number,
      default: 1, // Minimum amount by which new bid should exceed current highest bid
    },
    highestBid: {
      type: Number,
      default: 0,
    },
    closeReason: {
      type: String,
      enum: ["buyer_selected", "auction_ended", "seller_cancelled", "payment_completed"],
    },
    closedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Add indexes for better performance
bidSchema.index({ listing: 1 });
bidSchema.index({ seller: 1 });
bidSchema.index({ status: 1 });

// Pre-save middleware to update highestBid
bidSchema.pre("save", function (next) {
  if (this.bids && this.bids.length > 0) {
    this.highestBid = Math.max(...this.bids.map((bid) => bid.amount));
  }
  next();
});

const Bid = mongoose.model("Bid", bidSchema);

export default Bid;

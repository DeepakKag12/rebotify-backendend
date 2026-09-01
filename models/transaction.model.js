import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Listing",
      required: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    transactionDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["completed", "pending", "cancelled"],
      default: "completed",
    },
    receiptNumber: {
      type: String,
      unique: true,
      default: function () {
        return `RBT-${Date.now()}-TEMP`;
      },
    },
    paymentMethod: {
      type: String,
      enum: ["stripe", "stripe_checkout", "upi", "card", "netbanking", "wallet", "cash"],
      default: "stripe",
    },
    paymentId: {
      type: String,
    },
    stripePaymentIntentId: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Generate receipt number
transactionSchema.pre("save", async function (next) {
  // Always generate a new receipt number or update if it's a temp one
  if (!this.receiptNumber || this.receiptNumber.includes("TEMP")) {
    const count = await mongoose.model("Transaction").countDocuments();
    this.receiptNumber = `RBT-${Date.now()}-${String(count + 1).padStart(
      6,
      "0"
    )}`;
  }
  next();
});

const Transaction = mongoose.model("Transaction", transactionSchema);

export default Transaction;

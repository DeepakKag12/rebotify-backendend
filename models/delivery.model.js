import mongoose from "mongoose";

const deliverySchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Listing",
      required: true,
    },
    deliveryDate: {
      type: Date,
      required: true,
    },
    sellerId:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    buyerId:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status_delivery: {
      type: String,
      enum: ["pending", "shipped", "outForDelivery", "Delivered", "canceled"],
      default: "pending",
    },
    trackingNumber: {
      type: String,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const Delivery = mongoose.model("Delivery", deliverySchema);
export default Delivery;

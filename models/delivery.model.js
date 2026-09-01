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
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    deliveryPartnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    status_delivery: {
      type: String,
      enum: ["pending", "shipped", "outForDelivery", "delivered"],
      default: "pending",
    },
    trackingNumber: {
      type: String,
    },
    statusHistory: [
      {
        status: {
          type: String,
          enum: ["pending", "shipped", "outForDelivery", "delivered"],
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
        notes: {
          type: String,
          default: "",
        },
        updatedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      },
    ],
    deliveryNotes: {
      type: String,
      default: "",
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

// Add initial status to history on creation
deliverySchema.pre("save", function (next) {
  if (this.isNew) {
    this.statusHistory.push({
      status: "pending",
      timestamp: new Date(),
      notes: "Delivery created",
    });
  }
  next();
});

const Delivery = mongoose.model("Delivery", deliverySchema);
export default Delivery;

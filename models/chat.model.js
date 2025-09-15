import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
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
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
    lastActivity: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      default: "active",
      enum: ["active", "closed"],
    },
  },
  { timestamps: true }
);

// Ensure unique chat per listing-buyer-seller combination
chatSchema.index({ listing: 1, seller: 1, buyer: 1 }, { unique: true });

const Chat = mongoose.model("Chat", chatSchema);
export default Chat;
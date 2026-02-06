import e from "express";
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    userType: {
      type: String,
      default: "user",
      enum: ["user", "admin", "recycler", "delivery"],
    },
    phone: {
      type: String,
      default: "",
    },
    addresses: [
      {
        address: {
          type: String,
          required: true,
          trim: true,
        },
      },
    ],
    lasLogin: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;

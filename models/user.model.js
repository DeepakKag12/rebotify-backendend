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
    address: {
      type: String,
      required: true,
      default: "",
    },
    location: {
      latitude: {
        type: Number,
        required: false, // Made optional to avoid validation issues
      },
      longitude: {
        type: Number,
        required: false, // Made optional to avoid validation issues
      },
    },
    lasLogin: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;

import e from "express";
import mongoose from "mongoose";

const listingSchema = new mongoose.Schema(
  {
    product_category: {
      type: String,
      // Optionally, add required: true if needed
    },
    brand: {
      type: String,
    },
    model: {
      type: String,
    },
    manufacture_year: {
      type: Number,
    },
    condition: {
      type: String,
    },
    description: {
      type: String,
    },
    accessories: {
      type: String,
    },
    battery: {
      type: String,
    },
    video_link: {
      type: String,
    },
    price: {
      type: Number,
    },
    price_type: {
      type: String,
    },
    delivery_options: {
      type: String,
    },
    name: {
      type: String,
    },
    email: {
      type: String,
    },
    phone: {
      type: String,
    },
    contact_preference: {
      type: String,
    },
    location: {
      type: String,
    },
    address: {
      type: String,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Optionally, if a buyer is selected:

    buyer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    image_paths: {
      type: [String], // storing multiple image file paths as an array
    },
    finalPrice: {
      type: Number,
    },
    status: {
      type: String,
      default: "open",
      enum: ["open",  "closed"],
    },

    status_update_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    created_at: {
      type: Date,
      default: Date.now, // automatically set to current date/time on creation
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields automatically
  }
);

const Listing = mongoose.model("Listing", listingSchema);
export default Listing;

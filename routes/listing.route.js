import {
  createListing,
  getAllStatusBasedListings,
  updateListingStatus,
  deleteListing,
  getListingsBySellerAndStatus,
  analyzeProductImagesEndpoint,
  getListingById,
  updateListing,
} from "../controllers/listing.controller.js";
import { authenticateToken } from "../middleware/authenticateToken.js";
import uploadImage from "../middleware/uploadImage.js";

import express from "express";
const router = express.Router();

// Specific routes first (before dynamic :id)
router.post(
  "/analyze-images",
  authenticateToken,
  uploadImage,
  analyzeProductImagesEndpoint
);
router.post("/create", authenticateToken, uploadImage, createListing);
router.get("/all", authenticateToken, getAllStatusBasedListings);
router.get("/seller", authenticateToken, getListingsBySellerAndStatus);

// Dynamic routes last
router.get("/:id", authenticateToken, getListingById);
router.put("/:id", authenticateToken, uploadImage, updateListing);
router.patch("/status/:id", authenticateToken, updateListingStatus);
router.delete("/:id", authenticateToken, deleteListing);

export default router;

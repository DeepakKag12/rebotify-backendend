import {
  createListing,
  getAllStatusBasedListings,
  updateListingStatus,
  deleteListing,
  getListingsBySellerAndStatus,
  analyzeProductImagesEndpoint,
} from "../controllers/listing.controller.js";
import { authenticateToken } from "../middleware/authenticateToken.js";
import uploadImage from "../middleware/uploadImage.js";

import express from "express";
const router = express.Router();

router.post(
  "/analyze-images",
  authenticateToken,
  uploadImage,
  analyzeProductImagesEndpoint
);
router.post("/create", authenticateToken, uploadImage, createListing);
router.get("/all", authenticateToken, getAllStatusBasedListings);
router.patch("/status/:id", authenticateToken, updateListingStatus);
router.delete("/:id", authenticateToken, deleteListing);
router.get("/seller", authenticateToken, getListingsBySellerAndStatus);
export default router;

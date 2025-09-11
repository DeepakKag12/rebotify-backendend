import {
  createListing,
  getAllStatusBasedListings,
  updateListingStatus,
  deleteListing,
  getListingsBySellerAndStatus,
  getListingDetailsForDelivery,
} from "../controllers/listing.controller.js";
import { authenticateToken } from "../middleware/authenticateToken.js";
import uploadImage from "../middleware/uploadImage.js";

import express from "express";
const router = express.Router();

//all listing routes here
router.post("/create", authenticateToken, uploadImage, createListing);
router.get("/all", authenticateToken, getAllStatusBasedListings);
router.patch("/status/:id", authenticateToken, updateListingStatus);
router.delete("/:id", authenticateToken, deleteListing);
router.get("/seller", authenticateToken, getListingsBySellerAndStatus);
router.get("/delivery/:id", authenticateToken, getListingDetailsForDelivery);
export default router;

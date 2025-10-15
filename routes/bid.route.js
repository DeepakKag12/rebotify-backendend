import express from "express";
import {
  getBidsForListing,
  makeBid,
  selectBuyer,
  getHighestBid,
  withdrawBid,
  closeAuction,
  getUserBidHistory,
} from "../controllers/bid.controller.js";
import { authenticateToken } from "../middleware/authenticateToken.js";

const router = express.Router();

// Get all bids for a specific listing
router.get("/listing/:listingId", authenticateToken, getBidsForListing);

// Get highest bid for a specific listing
router.get("/highest/:listingId", getHighestBid);

// Get user's bid history
router.get("/user/history", authenticateToken, getUserBidHistory);

// Make a bid on a listing
router.post("/make", authenticateToken, makeBid);

// Select buyer from bids (seller only)
router.post("/select-buyer", authenticateToken, selectBuyer);

// Withdraw a bid
router.post("/withdraw", authenticateToken, withdrawBid);

// Close auction manually (seller only)
router.post("/close", authenticateToken, closeAuction);

export default router;

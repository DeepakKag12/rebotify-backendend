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

// Specific routes first
router.get("/user/history", authenticateToken, getUserBidHistory);
router.post("/make", authenticateToken, makeBid);
router.post("/select-buyer", authenticateToken, selectBuyer);
router.post("/withdraw", authenticateToken, withdrawBid);
router.post("/close", authenticateToken, closeAuction);

// Dynamic routes last
router.get("/listing/:listingId", authenticateToken, getBidsForListing);
router.get("/highest/:listingId", getHighestBid);

export default router;

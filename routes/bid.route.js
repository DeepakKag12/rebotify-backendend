import express from "express";
import {
  getBidsForListing,
  makeBid,
  selectBuyer,
  getHighestBid,
  withdrawBid,
  closeAuction,
  getUserBidHistory,
  buyerAcceptDeal,
  getBidStatus,
  createStripeCheckoutSession,
  verifyStripeCheckoutSession,
} from "../controllers/bid.controller.js";
import { authenticateToken } from "../middleware/authenticateToken.js";

const router = express.Router();

router.get("/listing/:listingId", authenticateToken, getBidsForListing);
router.get("/highest/:listingId", getHighestBid);
router.get("/user/history", authenticateToken, getUserBidHistory);
router.get("/:listingId/status", authenticateToken, getBidStatus);
router.post("/make", authenticateToken, makeBid);
router.post("/select-buyer", authenticateToken, selectBuyer);
router.post("/withdraw", authenticateToken, withdrawBid);
router.post("/close", authenticateToken, closeAuction);
router.post("/:listingId/buyer-accept", authenticateToken, buyerAcceptDeal);

// Stripe Checkout Session routes (redirect-based payment)
router.post("/:listingId/stripe/create-checkout-session", authenticateToken, createStripeCheckoutSession);
router.post("/:listingId/stripe/verify-checkout", authenticateToken, verifyStripeCheckoutSession);

export default router;


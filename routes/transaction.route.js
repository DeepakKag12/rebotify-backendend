import express from "express";
import {
  getUserTransactions,
  getTransactionById,
} from "../controllers/transaction.controller.js";
import { authenticateToken } from "../middleware/authenticateToken.js";

const router = express.Router();

// Get user's transactions (sales and purchases)
router.get("/", authenticateToken, getUserTransactions);

// Get single transaction by ID
router.get("/:transactionId", authenticateToken, getTransactionById);

export default router;

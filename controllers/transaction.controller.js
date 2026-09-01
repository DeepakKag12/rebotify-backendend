import Transaction from "../models/transaction.model.js";
import Listing from "../models/listing.model.js";

// Get user transactions (sales and purchases)
export const getUserTransactions = async (req, res) => {
  try {
    const userId = req.user.id; // Changed from req.user.userId to req.user.id

    // Get sales (where user is seller)
    const sales = await Transaction.find({ seller: userId })
      .populate({
        path: "buyer",
        select: "name email phone",
      })
      .populate({
        path: "listing",
        select: "product_category brand model price image_paths",
      })
      .sort({ createdAt: -1 });

    // Get purchases (where user is buyer)
    const purchases = await Transaction.find({ buyer: userId })
      .populate({
        path: "seller",
        select: "name email phone",
      })
      .populate({
        path: "listing",
        select: "product_category brand model price image_paths",
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      sales,
      purchases,
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch transactions",
      error: error.message,
    });
  }
};

// Get single transaction by ID
export const getTransactionById = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const userId = req.user.id; // Changed from req.user.userId to req.user.id

    const transaction = await Transaction.findById(transactionId)
      .populate({
        path: "seller",
        select: "name email phone address",
      })
      .populate({
        path: "buyer",
        select: "name email phone address",
      })
      .populate({
        path: "listing",
        select: "product_category brand model price description image_paths",
      });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    // Verify user is part of this transaction
    if (
      transaction.seller._id.toString() !== userId &&
      transaction.buyer._id.toString() !== userId
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    res.status(200).json({
      success: true,
      transaction,
    });
  } catch (error) {
    console.error("Error fetching transaction:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch transaction",
      error: error.message,
    });
  }
};

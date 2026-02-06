import {
  getListingDetailsForDelivery,
  updateDeliveryStatus,
  getUserDeliveries,
  getDeliveryById,
} from "../controllers/delivery.controller.js";
import express from "express";
import { authenticateToken } from "../middleware/authenticateToken.js";
const router = express.Router();

router.get("/all", authenticateToken, getListingDetailsForDelivery);
router.get("/user", authenticateToken, getUserDeliveries);
router.get("/:deliveryId", authenticateToken, getDeliveryById);
router.patch("/:deliveryId", authenticateToken, updateDeliveryStatus);
export default router;

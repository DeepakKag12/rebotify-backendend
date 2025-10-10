import {getListingDetailsForDelivery} from "../controllers/delivery.controller.js";
import express from "express";
import { authenticateToken } from "../middleware/authenticateToken.js";
const router = express.Router();

router.get("/all", authenticateToken, getListingDetailsForDelivery);

export default router;
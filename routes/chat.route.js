import {
  createOrGetChat,
  getUserChats,
  getChatMessages,
} from "../controllers/chat.controller.js";
import { authenticateToken } from "../middleware/authenticateToken.js";
import express from "express";
const router = express.Router();

router.post("/", authenticateToken, createOrGetChat);
router.get("/", authenticateToken, getUserChats);
router.get("/:chatId/messages", authenticateToken, getChatMessages);

export default router;

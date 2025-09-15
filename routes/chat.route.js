import {
  createOrGetChat,
  getUserChats,
  getChatMessages,
} from "../controllers/chat.controller.js";
import { authenticateToken } from "../middleware/authenticateToken.js";
import express from "express";
const router = express.Router();

/**
 * @swagger
 * /api/chats:
 *   post:
 *     tags: [Chat]
 *     summary: Create or get existing chat for a listing
 *     description: Creates a new chat between buyer and seller for a specific listing, or returns existing chat
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - listingId
 *             properties:
 *               listingId:
 *                 type: string
 *                 description: ID of the listing to chat about
 *           example:
 *             listingId: "60f7b3b3b3b3b3b3b3b3b3b3"
 *     responses:
 *       200:
 *         description: Chat created or retrieved successfully
 *       400:
 *         description: Cannot chat with yourself or invalid listing
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Listing not found
 */
router.post("/", authenticateToken, createOrGetChat);

/**
 * @swagger
 * /api/chats:
 *   get:
 *     tags: [Chat]
 *     summary: Get user's chats
 *     description: Retrieves all active chats for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Chats retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/", authenticateToken, getUserChats);

/**
 * @swagger
 * /api/chats/{chatId}/messages:
 *   get:
 *     tags: [Chat]
 *     summary: Get chat messages
 *     description: Retrieves paginated messages for a specific chat
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: chatId
 *         in: path
 *         required: true
 *         description: ID of the chat
 *         schema:
 *           type: string
 *       - name: page
 *         in: query
 *         description: Page number (default 1)
 *         schema:
 *           type: integer
 *           minimum: 1
 *       - name: limit
 *         in: query
 *         description: Messages per page (default 50)
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *     responses:
 *       200:
 *         description: Messages retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Chat not found
 */
router.get("/:chatId/messages", authenticateToken, getChatMessages);

export default router;

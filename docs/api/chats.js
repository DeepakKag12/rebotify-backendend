/**
 * @swagger
 * /api/chats:
 *   post:
 *     tags: [Chat]
 *     summary: Create or get existing chat for a listing
 *     description: Creates a new chat between buyer and seller for a specific listing, or returns existing chat
 *     security:
 *       - BearerAuth: []
 *       - CookieAuth: []
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Chat created successfully"
 *                 chat:
 *                   $ref: '#/components/schemas/Chat'
 *       400:
 *         description: Cannot chat with yourself or invalid listing
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Listing not found
 */

/**
 * @swagger
 * /api/chats:
 *   get:
 *     tags: [Chat]
 *     summary: Get user's chats
 *     description: Retrieves all active chats for the authenticated user
 *     security:
 *       - BearerAuth: []
 *       - CookieAuth: []
 *     responses:
 *       200:
 *         description: Chats retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Chats retrieved successfully"
 *                 chats:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Chat'
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/chats/{chatId}/messages:
 *   get:
 *     tags: [Chat]
 *     summary: Get chat messages
 *     description: Retrieves paginated messages for a specific chat
 *     security:
 *       - BearerAuth: []
 *       - CookieAuth: []
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Messages retrieved successfully"
 *                 messages:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Message'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 50
 *                     hasMore:
 *                       type: boolean
 *                       example: false
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Chat not found
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Chat:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Chat unique identifier
 *           example: "64f5b8c2e4b0a1b2c3d4e5fa"
 *         listing:
 *           type: string
 *           description: Associated listing ID
 *           example: "64f5b8c2e4b0a1b2c3d4e5f7"
 *         seller:
 *           $ref: '#/components/schemas/User'
 *         buyer:
 *           $ref: '#/components/schemas/User'
 *         lastMessage:
 *           $ref: '#/components/schemas/Message'
 *         lastActivity:
 *           type: string
 *           format: date-time
 *           description: Last activity timestamp
 *         status:
 *           type: string
 *           enum: [active, closed]
 *           default: active
 *           description: Chat status
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     Message:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Message unique identifier
 *           example: "64f5b8c2e4b0a1b2c3d4e5fb"
 *         chat:
 *           type: string
 *           description: Chat ID
 *           example: "64f5b8c2e4b0a1b2c3d4e5fa"
 *         sender:
 *           $ref: '#/components/schemas/User'
 *         content:
 *           type: string
 *           description: Message content
 *           example: "Hello, is this item still available?"
 *         messageType:
 *           type: string
 *           enum: [text, image, system]
 *           default: text
 *           description: Type of message
 *         readBy:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               user:
 *                 type: string
 *                 description: User ID who read the message
 *               readAt:
 *                 type: string
 *                 format: date-time
 *                 description: When the message was read
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

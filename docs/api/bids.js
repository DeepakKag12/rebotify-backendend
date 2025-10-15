/**
 * @swagger
 * components:
 *   schemas:
 *     Bid:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique identifier for the bid document
 *         bids:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *                 description: Bid amount
 *               bidder:
 *                 type: string
 *                 description: Bidder's user ID
 *               createdAt:
 *                 type: string
 *                 format: date-time
 *                 description: When the bid was placed
 *         buyer:
 *           type: string
 *           description: Selected buyer's user ID
 *         seller:
 *           type: string
 *           description: Seller's user ID
 *         listing:
 *           type: string
 *           description: Listing ID
 *         status:
 *           type: string
 *           enum: [open, closed]
 *           description: Auction status
 *         minimumBidIncrement:
 *           type: number
 *           description: Minimum amount by which new bid should exceed current highest
 *         highestBid:
 *           type: number
 *           description: Current highest bid amount
 *         closeReason:
 *           type: string
 *           enum: [buyer_selected, auction_ended, seller_cancelled]
 *           description: Reason for closing the auction
 *         closedAt:
 *           type: string
 *           format: date-time
 *           description: When the auction was closed
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/bids/listing/{listingId}:
 *   get:
 *     summary: Get all bids for a specific listing
 *     tags: [Bids]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: listingId
 *         required: true
 *         schema:
 *           type: string
 *         description: The listing ID
 *     responses:
 *       200:
 *         description: Successfully retrieved bids
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 bids:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Bid'
 *                 totalBids:
 *                   type: number
 *                 highestBid:
 *                   type: number
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Listing not found
 */

/**
 * @swagger
 * /api/bids/highest/{listingId}:
 *   get:
 *     summary: Get highest bid for a specific listing
 *     tags: [Bids]
 *     parameters:
 *       - in: path
 *         name: listingId
 *         required: true
 *         schema:
 *           type: string
 *         description: The listing ID
 *     responses:
 *       200:
 *         description: Successfully retrieved highest bid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 highestBid:
 *                   type: number
 *                 bidDetails:
 *                   type: object
 *                 totalBids:
 *                   type: number
 *                 auctionStatus:
 *                   type: string
 *       404:
 *         description: No bids found
 */

/**
 * @swagger
 * /api/bids/make:
 *   post:
 *     summary: Place a bid on a listing
 *     tags: [Bids]
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
 *               - amount
 *             properties:
 *               listingId:
 *                 type: string
 *                 description: The listing ID to bid on
 *               amount:
 *                 type: number
 *                 description: Bid amount
 *     responses:
 *       200:
 *         description: Bid placed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 bid:
 *                   $ref: '#/components/schemas/Bid'
 *                 newHighestBid:
 *                   type: number
 *                 totalBids:
 *                   type: number
 *       400:
 *         description: Invalid bid amount or auction closed
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Sellers cannot bid on their own listings
 *       404:
 *         description: Listing not found
 */

/**
 * @swagger
 * /api/bids/select-buyer:
 *   post:
 *     summary: Select a buyer from bids (seller only)
 *     tags: [Bids]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bidId
 *               - bidderId
 *             properties:
 *               bidId:
 *                 type: string
 *                 description: The bid document ID
 *               bidderId:
 *                 type: string
 *                 description: The bidder to select as buyer
 *     responses:
 *       200:
 *         description: Buyer selected successfully
 *       400:
 *         description: Auction already closed or no bids available
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not the seller of this listing
 *       404:
 *         description: Bid or bidder not found
 */

/**
 * @swagger
 * /api/bids/withdraw:
 *   post:
 *     summary: Withdraw a bid
 *     tags: [Bids]
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
 *                 description: The listing ID
 *     responses:
 *       200:
 *         description: Bid withdrawn successfully
 *       400:
 *         description: Cannot withdraw from closed auction
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: No bid found or listing not found
 */

/**
 * @swagger
 * /api/bids/close:
 *   post:
 *     summary: Close auction manually (seller only)
 *     tags: [Bids]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bidId
 *             properties:
 *               bidId:
 *                 type: string
 *                 description: The bid document ID
 *               reason:
 *                 type: string
 *                 description: Reason for closing
 *     responses:
 *       200:
 *         description: Auction closed successfully
 *       400:
 *         description: Auction already closed
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Only seller can close auction
 *       404:
 *         description: Bid not found
 */

/**
 * @swagger
 * /api/bids/user/history:
 *   get:
 *     summary: Get user's bid history
 *     tags: [Bids]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Successfully retrieved bid history
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 bids:
 *                   type: array
 *                   items:
 *                     type: object
 *                 totalBids:
 *                   type: number
 *                 page:
 *                   type: number
 *                 totalPages:
 *                   type: number
 *       401:
 *         description: Unauthorized
 */

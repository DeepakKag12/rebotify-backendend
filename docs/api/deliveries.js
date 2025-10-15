/**
 * @swagger
 * /api/deliveries/all:
 *   get:
 *     tags: [Deliveries]
 *     summary: Get all delivery listings
 *     description: Retrieve all listings available for delivery with complete details
 *     security:
 *       - BearerAuth: []
 *       - CookieAuth: []
 *     responses:
 *       200:
 *         description: Delivery listings retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Delivery listings retrieved successfully"
 *                 listings:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Listing'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

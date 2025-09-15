/**
 * @swagger
 * /api/listings:
 *   post:
 *     tags: [Listings]
 *     summary: Create a new listing
 *     description: Create a new product listing
 *     security:
 *       - BearerAuth: []
 *       - CookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ListingCreate'
 *     responses:
 *       201:
 *         description: Listing created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Listing created successfully"
 *                 listing:
 *                   $ref: '#/components/schemas/Listing'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/listings:
 *   get:
 *     tags: [Listings]
 *     summary: Get all listings
 *     description: Retrieve all active listings with pagination
 *     parameters:
 *       - name: page
 *         in: query
 *         description: Page number
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - name: limit
 *         in: query
 *         description: Number of listings per page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *       - name: category
 *         in: query
 *         description: Filter by product category
 *         schema:
 *           type: string
 *       - name: location
 *         in: query
 *         description: Filter by location
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Listings retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedResponse'
 */

/**
 * @swagger
 * /api/listings/{id}:
 *   get:
 *     tags: [Listings]
 *     summary: Get listing by ID
 *     description: Retrieve a specific listing by its ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Listing ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Listing found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 listing:
 *                   $ref: '#/components/schemas/Listing'
 *       404:
 *         description: Listing not found
 */

/**
 * @swagger
 * /api/listings/{id}:
 *   put:
 *     tags: [Listings]
 *     summary: Update listing
 *     description: Update a listing (owner only)
 *     security:
 *       - BearerAuth: []
 *       - CookieAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Listing ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ListingCreate'
 *     responses:
 *       200:
 *         description: Listing updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not listing owner
 *       404:
 *         description: Listing not found
 */

/**
 * @swagger
 * /api/listings/{id}:
 *   delete:
 *     tags: [Listings]
 *     summary: Delete listing
 *     description: Delete a listing (owner only)
 *     security:
 *       - BearerAuth: []
 *       - CookieAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Listing ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Listing deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not listing owner
 *       404:
 *         description: Listing not found
 */

/**
 * @swagger
 * /api/listings/{id}/status:
 *   patch:
 *     tags: [Listings]
 *     summary: Update listing status
 *     description: Update the status of a listing
 *     security:
 *       - BearerAuth: []
 *       - CookieAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Listing ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ListingStatusUpdate'
 *     responses:
 *       200:
 *         description: Status updated successfully
 *       400:
 *         description: Invalid status
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Listing not found
 */

/**
 * @swagger
 * /api/listings/analyze-images:
 *   post:
 *     tags: [Listings]
 *     summary: AI-powered image analysis
 *     description: Upload product images for AI analysis and listing suggestions
 *     security:
 *       - BearerAuth: []
 *       - CookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Product images to analyze
 *     responses:
 *       200:
 *         description: Images analyzed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 analysis:
 *                   type: object
 *                   description: AI analysis results
 *                 suggestions:
 *                   type: object
 *                   description: Listing suggestions
 *       400:
 *         description: Invalid images
 *       401:
 *         description: Unauthorized
 */

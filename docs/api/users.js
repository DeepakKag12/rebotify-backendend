/**
 * @swagger
 * /api/users/signup:
 *   post:
 *     tags: [Authentication]
 *     summary: Register a new user
 *     description: Register a new user with automatic location detection and geocoding
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserSignup'
 *           examples:
 *             addressOnly:
 *               summary: Address only (auto-geocoding)
 *               value:
 *                 name: "John Doe"
 *                 email: "john@example.com"
 *                 password: "password123"
 *                 userType: "user"
 *                 address: "123 Main St, New York, NY 10001"
 *             gpsCoordinates:
 *               summary: GPS coordinates
 *               value:
 *                 name: "Jane Smith"
 *                 email: "jane@example.com"
 *                 password: "password123"
 *                 userType: "user"
 *                 latitude: 40.7128
 *                 longitude: -74.0060
 *                 useGPS: true
 *             mixed:
 *               summary: Address + coordinates
 *               value:
 *                 name: "Bob Johnson"
 *                 email: "bob@example.com"
 *                 password: "password123"
 *                 userType: "user"
 *                 address: "456 Broadway, New York, NY"
 *                 latitude: 40.7589
 *                 longitude: -73.9851
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User registered successfully"
 *                 locationInfo:
 *                   type: string
 *                   example: "Address geocoded successfully"
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Please provide all required fields"
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     tags: [Authentication]
 *     summary: User login
 *     description: Authenticate user and return JWT token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserLogin'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Invalid credentials
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     tags: [Users]
 *     summary: Get all users
 *     description: Retrieve a list of all users (Admin only)
 *     security:
 *       - BearerAuth: []
 *       - CookieAuth: []
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
 *         description: Number of users per page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedResponse'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     tags: [Users]
 *     summary: Get user by ID
 *     description: Retrieve a specific user by their ID
 *     security:
 *       - BearerAuth: []
 *       - CookieAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: User ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     tags: [Users]
 *     summary: Update user profile
 *     description: Update user information
 *     security:
 *       - BearerAuth: []
 *       - CookieAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: User ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserUpdate'
 *     responses:
 *       200:
 *         description: User updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */

/**
 * @swagger
 * /api/users/logout:
 *   post:
 *     tags: [Authentication]
 *     summary: User logout
 *     description: Log out user and clear authentication
 *     security:
 *       - BearerAuth: []
 *       - CookieAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Logout successful"
 */

/**
 * @swagger
 * /api/users/analytics/active-count:
 *   get:
 *     tags: [Analytics]
 *     summary: Get active user count
 *     description: Get the number of active users (Admin only)
 *     security:
 *       - BearerAuth: []
 *       - CookieAuth: []
 *     responses:
 *       200:
 *         description: Active user count retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 activeUsers:
 *                   type: number
 *                   example: 150
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */

/**
 * @swagger
 * /api/users/analytics/retention-rate:
 *   get:
 *     tags: [Analytics]
 *     summary: Get user retention rate
 *     description: Get user retention statistics (Admin only)
 *     security:
 *       - BearerAuth: []
 *       - CookieAuth: []
 *     responses:
 *       200:
 *         description: Retention rate retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 retentionRate:
 *                   type: number
 *                   example: 75.5
 *                 period:
 *                   type: string
 *                   example: "30 days"
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */

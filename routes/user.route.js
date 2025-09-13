import {
  signup,
  login,
  getAllUsers,
  getUserById,
  deleteUser,
  logout,
  getActiveUserCount,
  getUserRetentionRate,
  updateUserProfile,
  adminDeleteUser,
} from "../controllers/user.controller.js";
import { authenticateToken } from "../middleware/authenticateToken.js";
import express from "express";
const router = express.Router();

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
router.post("/signup", signup);

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
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Login successful"
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid credentials
 *       403:
 *         description: Account removed by admin
 *       500:
 *         description: Internal server error
 */
router.post("/login", login);

/**
 * @swagger
 * /api/users:
 *   get:
 *     tags: [Users]
 *     summary: Get all users
 *     description: Retrieve all users with pagination
 *     security:
 *       - BearerAuth: []
 *       - CookieAuth: []
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
 *         description: Number of users per page
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedResponse'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get("/", authenticateToken, getAllUsers);

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
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.get("/:id", authenticateToken, getUserById);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     tags: [Users]
 *     summary: Delete user
 *     description: Permanently delete a user
 *     security:
 *       - BearerAuth: []
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.delete("/:id", authenticateToken, deleteUser);

/**
 * @swagger
 * /api/users/logout:
 *   post:
 *     tags: [Authentication]
 *     summary: User logout
 *     description: Logout user (client-side token deletion)
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
 *                   example: "Logout successful on client side"
 */
router.post("/logout", authenticateToken, logout);

/**
 * @swagger
 * /api/users/active/count:
 *   get:
 *     tags: [Analytics]
 *     summary: Get active user count
 *     description: Get count of users active in the last 10 minutes
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
 *                 activeUserCount:
 *                   type: integer
 *                   example: 25
 */
router.get("/active/count", authenticateToken, getActiveUserCount);

/**
 * @swagger
 * /api/users/total/retention:
 *   get:
 *     tags: [Analytics]
 *     summary: Get user retention rate
 *     description: Get percentage of users retained in the last 30 days
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
 *                   type: string
 *                   example: "75.5%"
 */
router.get("/total/retention", authenticateToken, getUserRetentionRate);

/**
 * @swagger
 * /api/users/profile/{id}:
 *   put:
 *     tags: [Users]
 *     summary: Update user profile
 *     description: Update user profile with automatic location processing
 *     security:
 *       - BearerAuth: []
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserUpdate'
 *           examples:
 *             updateName:
 *               summary: Update name only
 *               value:
 *                 name: "John Updated Doe"
 *             updateAddress:
 *               summary: Update address (auto-geocode)
 *               value:
 *                 address: "789 New Street, New York, NY 10003"
 *             updateGPS:
 *               summary: Update with GPS
 *               value:
 *                 latitude: 40.7831
 *                 longitude: -73.9712
 *                 useGPS: true
 *             forceGeocode:
 *               summary: Force geocoding
 *               value:
 *                 address: "Central Park, New York, NY"
 *                 forceGeocode: true
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Profile updated successfully"
 *                 locationInfo:
 *                   type: string
 *                   example: "Address geocoded and location updated"
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.put("/profile/:id", authenticateToken, updateUserProfile);

/**
 * @swagger
 * /api/users/soft-delete/admin/{id}:
 *   delete:
 *     tags: [Users]
 *     summary: Admin soft delete user
 *     description: Soft delete a user (admin only) with reason
 *     security:
 *       - BearerAuth: []
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID to soft delete
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reason
 *             properties:
 *               reason:
 *                 type: string
 *                 example: "Violation of terms of service"
 *     responses:
 *       200:
 *         description: User removed successfully
 *       400:
 *         description: Reason required
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.delete("/soft-delete/admin/:id", authenticateToken, adminDeleteUser);

export default router;

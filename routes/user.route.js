import {
  signup,
  login,
  loginWithOTP,
  verifyOTP,
  getAllUsers,
  getUserById,
  deleteUser,
  logout,
  getActiveUserCount,
  getUserRetentionRate,
  updateUserProfile,
  adminDeleteUser,
  updateUserAddress,
} from "../controllers/user.controller.js";
import { authenticateToken } from "../middleware/authenticateToken.js";
import express from "express";
const router = express.Router();

// Public routes
router.post("/signup", signup);
router.post("/login", login);
router.post("/login-with-otp", loginWithOTP);
router.post("/verify-otp", verifyOTP);
router.post("/logout", logout);

// Protected routes - specific paths first
router.get("/", authenticateToken, getAllUsers);
router.get("/total/active", authenticateToken, getActiveUserCount);
router.get("/total/retention", authenticateToken, getUserRetentionRate);
router.put("/profile/:id", authenticateToken, updateUserProfile);
router.put("/address/:id", authenticateToken, updateUserAddress);
router.delete("/soft-delete/admin/:id", authenticateToken, adminDeleteUser);

// Dynamic routes last
router.get("/:id", authenticateToken, getUserById);
router.delete("/:id", authenticateToken, deleteUser);

export default router;

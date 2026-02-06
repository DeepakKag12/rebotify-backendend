import {
  signup,
  login,
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
  getAdminStats,
} from "../controllers/user.controller.js";
import { authenticateToken } from "../middleware/authenticateToken.js";
import express from "express";
const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/verify-otp", verifyOTP);
router.post("/logout", authenticateToken, logout);

// Specific routes MUST come before parameterized routes
router.get("/all", authenticateToken, getAllUsers);
router.get("/stats/admin", authenticateToken, getAdminStats);
router.get("/total/active", authenticateToken, getActiveUserCount);
router.get("/total/retention", authenticateToken, getUserRetentionRate);

// Parameterized routes come last
router.get("/:id", authenticateToken, getUserById);
router.delete("/:id", authenticateToken, deleteUser);
router.put("/profile/:id", authenticateToken, updateUserProfile);
router.put("/address/:id", authenticateToken, updateUserAddress);
router.delete("/soft-delete/admin/:id", authenticateToken, adminDeleteUser);

export default router;

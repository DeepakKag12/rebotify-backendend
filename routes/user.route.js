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

router.post("/signup", signup);
router.post("/login", login);
router.get("/", authenticateToken, getAllUsers);
router.delete("/:id", authenticateToken, deleteUser);
router.get("/total/retention", authenticateToken, getUserRetentionRate);
router.put("/profile/:id", authenticateToken, updateUserProfile);
router.delete("/soft-delete/admin/:id", authenticateToken, adminDeleteUser);

export default router;

import {
  uploadCertificate,
  getUserCertificates,
  getAllCertificates,
  deleteCertificate,
  updateCertificateStatus,
  updateCertificateDetails,
  getCertificateStats,
} from "../controllers/certificate.controller.js";
import { authenticateToken } from "../middleware/authenticateToken.js";
import { uploadCertificateFile } from "../middleware/uploadImage.js";
import express from "express";
const router = express.Router();

router.post(
  "/upload",
  authenticateToken,
  uploadCertificateFile,
  uploadCertificate
);

// Specific routes MUST come before parameterized routes
router.get("/", authenticateToken, getUserCertificates);
router.get("/all", authenticateToken, getAllCertificates);
router.get("/stats/admin", authenticateToken, getCertificateStats);

// Parameterized routes come last
router.delete("/:id", authenticateToken, deleteCertificate);
router.patch("/status/:id", authenticateToken, updateCertificateStatus);
router.patch("/details/:id", authenticateToken, updateCertificateDetails);

export default router;

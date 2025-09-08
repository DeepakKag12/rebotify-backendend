import {
  uploadCertificate,
  getUserCertificates,
  getAllCertificates,
  deleteCertificate,
  updateCertificateStatus,
  updateCertificateDetails,
} from "../controllers/certificate.controller.js";
import { authenticateToken } from "../middleware/authenticateToken.js";
import { uploadCertificateFile } from "../middleware/uploadImage.js";
import express from "express";
const router = express.Router();

//all certificate routes here
router.post(
  "/upload",
  authenticateToken,
  uploadCertificateFile,
  uploadCertificate
);
router.get("/user", authenticateToken, getUserCertificates);
router.get("/all", authenticateToken, getAllCertificates);
router.delete("/:id", authenticateToken, deleteCertificate);
router.patch("/status/:id", authenticateToken, updateCertificateStatus);
router.patch("/details/:id", authenticateToken, updateCertificateDetails);
export default router;

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

/**
 * @swagger
 * /api/certificates/upload:
 *   post:
 *     tags: [Certificates]
 *     summary: Upload certificate
 *     description: Upload a certificate file for recycler verification
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
 *               certificate:
 *                 type: string
 *                 format: binary
 *                 description: Certificate file to upload
 *               title:
 *                 type: string
 *                 example: "Recycling Certification 2024"
 *               description:
 *                 type: string
 *                 example: "Official recycling certification from EPA"
 *     responses:
 *       201:
 *         description: Certificate uploaded successfully
 *       400:
 *         description: Invalid file or missing data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post(
  "/upload",
  authenticateToken,
  uploadCertificateFile,
  uploadCertificate
);

/**
 * @swagger
 * /api/certificates/user:
 *   get:
 *     tags: [Certificates]
 *     summary: Get user certificates
 *     description: Get all certificates for the authenticated user
 *     security:
 *       - BearerAuth: []
 *       - CookieAuth: []
 *     responses:
 *       200:
 *         description: User certificates retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get("/user", authenticateToken, getUserCertificates);

/**
 * @swagger
 * /api/certificates/all:
 *   get:
 *     tags: [Certificates]
 *     summary: Get all certificates
 *     description: Get all certificates (admin only)
 *     security:
 *       - BearerAuth: []
 *       - CookieAuth: []
 *     responses:
 *       200:
 *         description: All certificates retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 *       500:
 *         description: Internal server error
 */
router.get("/all", authenticateToken, getAllCertificates);

/**
 * @swagger
 * /api/certificates/{id}:
 *   delete:
 *     tags: [Certificates]
 *     summary: Delete certificate
 *     description: Delete a certificate by ID
 *     security:
 *       - BearerAuth: []
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Certificate ID
 *     responses:
 *       200:
 *         description: Certificate deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Certificate not found
 *       500:
 *         description: Internal server error
 */
router.delete("/:id", authenticateToken, deleteCertificate);

/**
 * @swagger
 * /api/certificates/status/{id}:
 *   patch:
 *     tags: [Certificates]
 *     summary: Update certificate status
 *     description: Update the status of a certificate (admin only)
 *     security:
 *       - BearerAuth: []
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Certificate ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: ["pending", "approved", "rejected"]
 *                 example: "approved"
 *     responses:
 *       200:
 *         description: Certificate status updated successfully
 *       400:
 *         description: Invalid status
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Certificate not found
 *       500:
 *         description: Internal server error
 */
router.patch("/status/:id", authenticateToken, updateCertificateStatus);

/**
 * @swagger
 * /api/certificates/details/{id}:
 *   patch:
 *     tags: [Certificates]
 *     summary: Update certificate details
 *     description: Update certificate title and description
 *     security:
 *       - BearerAuth: []
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Certificate ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Updated Certificate Title"
 *               description:
 *                 type: string
 *                 example: "Updated description"
 *     responses:
 *       200:
 *         description: Certificate details updated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Certificate not found
 *       500:
 *         description: Internal server error
 */
router.patch("/details/:id", authenticateToken, updateCertificateDetails);

export default router;

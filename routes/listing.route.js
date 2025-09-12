import {
  createListing,
  getAllStatusBasedListings,
  updateListingStatus,
  deleteListing,
  getListingsBySellerAndStatus,
  getListingDetailsForDelivery,
  analyzeProductImagesEndpoint,
} from "../controllers/listing.controller.js";
import { authenticateToken } from "../middleware/authenticateToken.js";
import uploadImage from "../middleware/uploadImage.js";

import express from "express";
const router = express.Router();

/**
 * @swagger
 * /api/listings/analyze-images:
 *   post:
 *     summary: AI-powered product image analysis
 *     description: Upload product images and get AI-generated listing details including category, brand, condition, and price estimates
 *     tags: [Listings, AI Analysis]
 *     security:
 *       - BearerAuth: []
 *       - CookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [images]
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 minItems: 1
 *                 maxItems: 5
 *                 description: Product images (1-5 images, JPEG/PNG, max 10MB each)
 *           encoding:
 *             images:
 *               contentType: image/jpeg, image/png
 *     responses:
 *       200:
 *         description: AI analysis completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Product analysis completed successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     analysis:
 *                       type: object
 *                       properties:
 *                         product_category:
 *                           type: string
 *                           example: "smartphone"
 *                         brand:
 *                           type: string
 *                           example: "Apple"
 *                         model:
 *                           type: string
 *                           example: "iPhone 13"
 *                         condition:
 *                           type: string
 *                           enum: [excellent, good, fair, poor]
 *                           example: "good"
 *                         description:
 *                           type: string
 *                           example: "Apple iPhone 13 in good condition with minimal wear on the back"
 *                         estimated_price_range:
 *                           type: object
 *                           properties:
 *                             min:
 *                               type: number
 *                               example: 450
 *                             max:
 *                               type: number
 *                               example: 550
 *                             currency:
 *                               type: string
 *                               example: "USD"
 *                         confidence_scores:
 *                           type: object
 *                           properties:
 *                             brand:
 *                               type: number
 *                               example: 0.95
 *                             model:
 *                               type: number
 *                               example: 0.87
 *                             condition:
 *                               type: number
 *                               example: 0.82
 *                             overall:
 *                               type: number
 *                               example: 0.88
 *                     suggested_form_data:
 *                       type: object
 *                       description: Pre-filled form data ready for listing creation
 *                       properties:
 *                         product_category:
 *                           type: string
 *                           example: "smartphone"
 *                         brand:
 *                           type: string
 *                           example: "Apple"
 *                         model:
 *                           type: string
 *                           example: "iPhone 13"
 *                         condition:
 *                           type: string
 *                           example: "good"
 *                         description:
 *                           type: string
 *                           example: "Apple iPhone 13 in good condition..."
 *                         price:
 *                           type: number
 *                           example: 450
 *                     image_paths:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["uploads/image1.jpg", "uploads/image2.jpg"]
 *                     processing_info:
 *                       type: object
 *                       properties:
 *                         images_analyzed:
 *                           type: number
 *                           example: 3
 *                         confidence_level:
 *                           type: number
 *                           example: 0.88
 *                         quality_rating:
 *                           type: string
 *                           enum: [high, medium, low]
 *                           example: "high"
 *                     user_guidance:
 *                       type: object
 *                       properties:
 *                         confidence_message:
 *                           type: string
 *                           example: "High confidence analysis - the AI is very confident about these details."
 *                         next_steps:
 *                           type: array
 *                           items:
 *                             type: string
 *                           example: ["Review the pre-filled information", "Add any additional details"]
 *                         pricing_guidance:
 *                           type: string
 *                           example: "AI suggests USD 450 - 550 based on visible condition"
 *       400:
 *         description: Bad request - Invalid images or missing files
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "No images provided for analysis"
 *       401:
 *         description: Unauthorized - Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       413:
 *         description: Payload too large - Image files too big
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: AI service error or internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "AI analysis service temporarily unavailable"
 *                 fallback_data:
 *                   type: object
 *                   properties:
 *                     suggested_form_data:
 *                       type: object
 *                       properties:
 *                         description:
 *                           type: string
 *                           example: "Please fill in product details manually"
 */
router.post(
  "/analyze-images",
  authenticateToken,
  uploadImage,
  analyzeProductImagesEndpoint
);

//all listing routes here
router.post("/create", authenticateToken, uploadImage, createListing);
router.get("/all", authenticateToken, getAllStatusBasedListings);
router.patch("/status/:id", authenticateToken, updateListingStatus);
router.delete("/:id", authenticateToken, deleteListing);
router.get("/seller", authenticateToken, getListingsBySellerAndStatus);
router.get("/delivery/:id", authenticateToken, getListingDetailsForDelivery);
export default router;

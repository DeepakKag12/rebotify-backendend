import Listing from "../models/listing.model.js";
import {
  analyzeProductImages,
  detectProductCategory,
  validateAndEnhanceAnalysis,
} from "../services/claudeService.js";
import fs from "fs/promises";
import Delivery from "../models/delivery.model.js";
// AI-powered image analysis endpoint
export const analyzeProductImagesEndpoint = async (req, res) => {
  try {
    console.log("🚀 Starting AI image analysis...");

    // Check authentication
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required for AI analysis",
      });
    }

    // Check if files were uploaded
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message:
          "No images provided for analysis. Please upload 1-5 product images.",
      });
    }

    // Limit to 5 images for optimal processing
    const maxImages = 5;
    if (req.files.length > maxImages) {
      return res.status(400).json({
        success: false,
        message: `Too many images. Maximum ${maxImages} images allowed for AI analysis.`,
      });
    }

    // Extract image buffers from multer memory storage
    const imageBuffers = req.files.map((file) => file.buffer);
    console.log(`📸 Processing ${imageBuffers.length} images in memory`);

    // Step 1: Quick category detection for optimized analysis
    console.log("🔍 Detecting product category...");
    const categoryHint = await detectProductCategory(imageBuffers[0]); // Use first image for category detection
    console.log(`📱 Detected category hint: ${categoryHint || "unknown"}`);

    // If not electronics, return error (no cleanup needed with memory storage)
    if (!categoryHint) {
      return res.status(400).json({
        success: false,
        error: "invalid_product_type",
        message: "No electronic products detected in the uploaded images.",
        suggested_action:
          "Please upload clear images of electronic products only.",
        examples:
          "Valid products: smartphones, laptops, tablets, headphones, gaming consoles, cameras, etc.",
      });
    }

    // Step 2: Comprehensive AI analysis
    console.log("🤖 Running comprehensive AI analysis...");
    const analysisResult = await analyzeProductImages(imageBuffers, categoryHint);

    // Check if AI analysis returned an API error (403/401) - allow manual entry
    if (analysisResult.api_error) {
      console.log("⚠️ AI service unavailable, allowing manual entry");
      return res.status(200).json({
        success: true,
        ai_available: false,
        message: "AI analysis unavailable. Please fill in product details manually.",
        data: {
          analysis: analysisResult.fallback_data,
          suggested_form_data: {
            product_category: "",
            brand: "",
            model: "",
            manufacture_year: new Date().getFullYear(),
            condition: "good",
            description: "",
            accessories: "",
            battery: "",
            price: "",
            price_type: "negotiable",
          },
          image_paths: [],
          confidence_score: 0,
        },
      });
    }

    // Check if AI analysis returned an error
    if (analysisResult.error === "not_electronics") {
      return res.status(400).json({
        success: false,
        error: "invalid_product_type",
        message:
          analysisResult.message ||
          "No electronic products detected in the uploaded images.",
        suggested_action:
          analysisResult.suggested_action ||
          "Please upload clear images of electronic products only.",
        examples:
          "Valid products: smartphones, laptops, tablets, headphones, gaming consoles, cameras, etc.",
      });
    }

    // Step 3: Validate and enhance results
    const enhancedResult = validateAndEnhanceAnalysis(analysisResult);

    // Step 4: Prepare response for frontend
    const response = {
      success: true,
      message: enhancedResult.error
        ? "AI analysis encountered issues, fallback data provided"
        : "Product analysis completed successfully",
      data: {
        // AI Analysis Results
        analysis: enhancedResult,

        // Form Pre-fill Data (formatted for your existing form structure)
        suggested_form_data: {
          product_category: enhancedResult.product_category,
          brand: enhancedResult.brand,
          model: enhancedResult.model,
          manufacture_year: enhancedResult.manufacture_year,
          condition: enhancedResult.condition,
          description: enhancedResult.description,
          accessories: Array.isArray(enhancedResult.accessories)
            ? enhancedResult.accessories.join(", ")
            : enhancedResult.accessories || "",
          battery: enhancedResult.battery,
          price: enhancedResult.estimated_price_range?.min || "",
          price_type: "negotiable", // Default since AI estimates are ranges
          color: enhancedResult.color,
          storage: enhancedResult.storage,
          visible_damage: enhancedResult.visible_damage,
        },

        // Metadata
        image_paths: [],
        processing_info: {
          images_analyzed: imageBuffers.length,
          category_detected: categoryHint,
          confidence_level: enhancedResult.confidence_scores?.overall || 0,
          quality_rating: enhancedResult.analysis_quality?.high_confidence
            ? "high"
            : enhancedResult.analysis_quality?.needs_review
            ? "low"
            : "medium",
          recommended_action:
            enhancedResult.analysis_quality?.recommended_action ||
            "Review suggestions",
        },

        // User Guidance
        user_guidance: {
          confidence_message: getConfidenceMessage(
            enhancedResult.confidence_scores?.overall || 0
          ),
          next_steps: getNextStepsRecommendations(enhancedResult),
          pricing_guidance: getPricingGuidance(
            enhancedResult.estimated_price_range
          ),
          image_quality_feedback: enhancedResult.image_quality_feedback || null,
        },
      },
    };

    console.log("✅ AI analysis completed successfully");
    res.status(200).json(response);
  } catch (error) {
    console.error("❌ Error in AI image analysis:", error);

    // Provide helpful error response
    res.status(500).json({
      success: false,
      message: "AI analysis service temporarily unavailable",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
      fallback_data: {
        suggested_form_data: {
          description:
            "Please fill in product details manually - AI analysis unavailable",
        },
        user_guidance: {
          confidence_message:
            "AI analysis failed. Please provide detailed product information.",
          next_steps: [
            "Fill in all product details manually",
            "Ensure images are clear and well-lit for future AI analysis",
            "Include multiple angles of your product",
          ],
        },
      },
    });
  }
};

// Helper function to generate confidence messages
function getConfidenceMessage(confidence) {
  if (confidence > 0.8) {
    return "High confidence analysis - the AI is very confident about these details.";
  } else if (confidence > 0.6) {
    return "Medium confidence analysis - please review the suggested details.";
  } else {
    return "Low confidence analysis - please verify and complete the details manually.";
  }
}

// Helper function to get next steps recommendations
function getNextStepsRecommendations(analysis) {
  const recommendations = [];

  if (analysis.confidence_scores?.overall > 0.8) {
    recommendations.push(
      "Review the pre-filled information and make any necessary adjustments"
    );
    recommendations.push("Add any additional details not captured by AI");
  } else {
    recommendations.push("Carefully review all suggested information");
    recommendations.push("Verify product model and specifications");
    recommendations.push("Add detailed condition description");
  }

  if (analysis.recommended_improvements?.length > 0) {
    recommendations.push(...analysis.recommended_improvements);
  }

  return recommendations;
}

// Helper function to provide pricing guidance
function getPricingGuidance(priceRange) {
  if (!priceRange || !priceRange.min || !priceRange.max) {
    return "AI couldn't estimate pricing. Research similar items for competitive pricing.";
  }

  const { min, max, currency = "USD" } = priceRange;

  if (min === max) {
    return `AI suggests approximately ${currency} ${min} based on visible condition.`;
  }

  return `AI suggests ${currency} ${min} - ${max} based on visible condition and market comparison.`;
}

//create a random tracking number based on time and date and rebot
function createTrackingNumber() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const randomSegment = Math.random()
    .toString(36)
    .substring(2, 6)
    .toUpperCase();
  return `REBOT-${timestamp}-${randomSegment}`;
}
// Create a new listing
export const createListing = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized " });
    }

    // Debug: Log the received data
    console.log("Received req.body:", req.body);
    console.log("Received req.files:", req.files);

    const {
      productCategory, // Changed from "product-category": productCategory
      brand,
      model,
      manufacture_year: manufactureYear, // Changed from "manufacture-year": manufactureYear
      condition,
      description,
      accessories,
      battery,
      video_link: videoLink, // Changed from "video-link": videoLink
      price,
      price_type: priceType, // Changed from "price-type": priceType
      delivery,
      name,
      email,
      phone,
      contact_preference: contactPreference, // Changed from "contact-preference": contactPreference
      location,
      address,
    } = req.body;
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format." });
    }

    // Validate phone number format (accepts various international formats)
    // This regex allows for different formats including:
    // - International format: +1234567890, +1 234 567 890
    // - US format: (123) 456-7890, 123-456-7890
    // - Simple digits: 1234567890
    const phoneRegex =
      /^(\+\d{1,3}[\s.-]?)?\(?\d{1,4}\)?[\s.-]?\d{1,4}[\s.-]?\d{1,9}$/;
    if (phone && !phoneRegex.test(phone)) {
      return res.status(400).json({ error: "Invalid phone number format." });
    }
    // Process uploaded files: get the filenames with their folder path
    const imagePaths =
      req.files && Array.isArray(req.files)
        ? req.files.map((file) => `uploads/${file.filename}`)
        : [];

    // Convert checkbox array fields to comma-separated strings
    const accessoriesStr = Array.isArray(accessories)
      ? accessories.join(", ")
      : accessories || "";
    const deliveryOptionsStr = Array.isArray(delivery)
      ? delivery.join(", ")
      : delivery || "";

    // Basic validation for required fields
    const requiredFields = {
      productCategory,
      brand,
      model,
      condition,
      description,
      price,
      name,
      email,
      phone,
      location,
    };

    const missingFields = Object.entries(requiredFields)
      .filter(([key, value]) => !value)
      .map(([key]) => key);

    if (missingFields.length > 0) {
      console.log("Missing fields:", missingFields);
      return res.status(400).json({
        error: "Missing required fields",
        missingFields: missingFields,
        receivedData: Object.keys(req.body),
      });
    }

    // Create a new Listing document using the Mongoose model
    const newListing = new Listing({
      product_category: productCategory,
      brand,
      model,
      manufacture_year: manufactureYear || null,
      condition,
      description,
      accessories: accessoriesStr,
      battery: battery || "",
      video_link: videoLink || "",
      price,
      price_type: priceType || "fixed",
      delivery_options: deliveryOptionsStr,
      seller: req.user.id,
      image_paths: imagePaths,
      name,
      email,
      phone,
      contact_preference: contactPreference || "phone",
      location,
      address: address || "",
      status: "open", // Default status is open
    });

    await newListing.save();
    res
      .status(201)
      .json({ message: "Listing created successfully", newListing });
  } catch (error) {
    console.log("Error in createListing:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//get all listings with status from the query with pagination
export const getAllStatusBasedListings = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    //we can get the status from the params useing query
    const status = req.query.status;

    const listings = await Listing.find({ status: status })
      .skip(skip)
      .limit(limit)
      .exec();

    const totalListings = await Listing.countDocuments({
      status: status,
    }).exec();
    const totalPages = Math.ceil(totalListings / limit);

    res.status(200).json({
      page,
      totalPages,
      totalListings,
      listings,
    });
  } catch (error) {
    console.log("Error in getAllOpenListings:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//Update listing status by id
export const updateListingStatus = async (req, res) => {
  try {
    const ListingId = req.params.id;
    const { status } = req.body;
    const userId = req.user.id;
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized " });
    }
    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }
    const ValidatedStatuses = ["open", "closed"];
    if (!ValidatedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }
    const listing = await Listing.findById(ListingId);
    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    const lastUpdatedBy = listing.status_update_by;
    const lastStatus = listing.status;
    if (status === "closed") {
      //trackNumber
      const trackingNumber = createTrackingNumber();
      listing.tracking_number = trackingNumber;
      // Create a new Delivery document when the listing is closed
      const newDelivery = new Delivery({
        orderId: listing._id,
        deliveryDate: new Date(), // Set to current date, can be updated later
        status_delivery: "pending", // Initial status
        sellerId: listing.seller,
        buyerId: listing.buyer,
        trackingNumber: trackingNumber,
      });
      await newDelivery.save();
    }
    listing.status = status;
    await listing.save();
    res
      .status(200)
      .json({ message: "Listing status updated successfully", listing });
  } catch (error) {
    console.log("Error in updateListingStatus:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
//delete the listing
export const deleteListing = async (req, res) => {
  try {
    const ListingId = req.params.id;
    const listing = await Listing.findByIdAndDelete(ListingId);
    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }
    res.status(200).json({ message: "Listing deleted successfully" });
  } catch (error) {
    console.log("Error in deleteListing:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//get listing by seller id and different status with pagination
export const getListingsBySellerAndStatus = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const status = "open";
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized " });
    }
    const sellerId = req.user.id;
    const listings = await Listing.find({ seller: sellerId, status: status })
      .skip(skip)
      .limit(limit)
      .exec();

    const totalListings = await Listing.countDocuments({
      seller: sellerId,
      status: status,
    }).exec();
    const totalPages = Math.ceil(totalListings / limit);
    res.status(200).json({
      page,
      totalPages,
      totalListings,
      listings,
    });
  } catch (error) {
    console.log("Error in getListingsBySellerAndStatus:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get single listing by ID
export const getListingById = async (req, res) => {
  try {
    const listingId = req.params.id;

    const listing = await Listing.findById(listingId).exec();

    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    res.status(200).json({
      success: true,
      listing,
    });
  } catch (error) {
    console.log("Error in getListingById:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update listing by ID
export const updateListing = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const listingId = req.params.id;
    const listing = await Listing.findById(listingId);

    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    // Check if user owns this listing
    if (listing.seller.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this listing" });
    }

    const {
      productCategory,
      brand,
      model,
      manufacture_year: manufactureYear,
      condition,
      description,
      accessories,
      battery,
      video_link: videoLink,
      price,
      price_type: priceType,
      delivery,
      name,
      email,
      phone,
      contact_preference: contactPreference,
      location,
      address,
    } = req.body;

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format." });
    }

    // Validate phone number format
    const phoneRegex =
      /^(\+\d{1,3}[\s.-]?)?\(?\d{1,4}\)?[\s.-]?\d{1,4}[\s.-]?\d{1,9}$/;
    if (phone && !phoneRegex.test(phone)) {
      return res.status(400).json({ error: "Invalid phone number format." });
    }

    // Process new uploaded files if any
    let imagePaths = listing.image_paths; // Keep existing images by default
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      // If new images are uploaded, replace old ones
      imagePaths = req.files.map((file) => `uploads/${file.filename}`);

      // Optional: Delete old image files from filesystem
      // This requires fs module and proper error handling
    }

    // Convert arrays to comma-separated strings
    const accessoriesStr = Array.isArray(accessories)
      ? accessories.join(", ")
      : accessories || listing.accessories;
    const deliveryOptionsStr = Array.isArray(delivery)
      ? delivery.join(", ")
      : delivery || listing.delivery_options;

    // Update listing fields
    listing.product_category = productCategory || listing.product_category;
    listing.brand = brand || listing.brand;
    listing.model = model || listing.model;
    listing.manufacture_year = manufactureYear || listing.manufacture_year;
    listing.condition = condition || listing.condition;
    listing.description = description || listing.description;
    listing.accessories = accessoriesStr;
    listing.battery = battery !== undefined ? battery : listing.battery;
    listing.video_link =
      videoLink !== undefined ? videoLink : listing.video_link;
    listing.price = price || listing.price;
    listing.price_type = priceType || listing.price_type;
    listing.delivery_options = deliveryOptionsStr;
    listing.image_paths = imagePaths;
    listing.name = name || listing.name;
    listing.email = email || listing.email;
    listing.phone = phone || listing.phone;
    listing.contact_preference =
      contactPreference || listing.contact_preference;
    listing.location = location || listing.location;
    listing.address = address || listing.address;

    await listing.save();

    res.status(200).json({
      message: "Listing updated successfully",
      listing,
    });
  } catch (error) {
    console.log("Error in updateListing:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

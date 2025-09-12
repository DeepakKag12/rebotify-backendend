import Listing from "../models/listing.model.js";
import {
  analyzeProductImages,
  detectProductCategory,
  validateAndEnhanceAnalysis,
} from "../services/claudeService.js";

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

    // Process uploaded files: get the filenames with their folder path
    const imagePaths = req.files.map((file) => `uploads/${file.filename}`);
    console.log(`📸 Processing ${imagePaths.length} images:`, imagePaths);

    // Step 1: Quick category detection for optimized analysis
    console.log("🔍 Detecting product category...");
    const categoryHint = await detectProductCategory(imagePaths);
    console.log(`📱 Detected category hint: ${categoryHint || "unknown"}`);

    // Step 2: Comprehensive AI analysis
    console.log("🤖 Running comprehensive AI analysis...");
    const analysisResult = await analyzeProductImages(imagePaths, categoryHint);

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
        image_paths: imagePaths,
        processing_info: {
          images_analyzed: imagePaths.length,
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
// Create a new listing
export const createListing = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized " });
    }
    const {
      "product-category": productCategory,
      brand,
      model,
      "manufacture-year": manufactureYear,
      condition,
      description,
      accessories,
      battery,
      "video-link": videoLink,
      price,
      "price-type": priceType,
      delivery,
      name,
      email,
      phone,
      "contact-preference": contactPreference,
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
    if (
      !productCategory ||
      !brand ||
      !model ||
      !condition ||
      !description ||
      !price ||
      !name ||
      !email ||
      !phone ||
      !location
    ) {
      return res.status(400).json({ error: "Missing required fields." });
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

    const listengs = await Listing.find({ status: status })
      .skip(skip)
      .limit(limit)
      .exec();

    const totalListings = await Listing.countDocuments({
      status: "open",
    }).exec();
    const totalPages = Math.ceil(totalListings / limit);

    res.status(200).json({
      page,
      totalPages,
      totalListings,
      listengs,
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
    const ValidatedStatuses = ["open", "pending", "closed"];
    if (!ValidatedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }
    const listing = await Listing.findById(ListingId);
    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    const lastUpdatedBy = listing.status_update_by;
    const lastStatus = listing.status;
    //if last status is pending and how the new one is closed then what we will do is we can make the the guy who make the status pending as the buyer
    if (lastUpdatedBy && lastStatus === "pending" && status === "closed") {
      listing.buyer = lastUpdatedBy;
    }
    listing.status_update_by = userId;

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
    const status = req.query.status;
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

//Once the listing is closed we have the address of the buyer as well as the seller so we can show the address of both the buyer and the seller to the delivery guy
export const getListingDetailsForDelivery = async (req, res) => {
  try {
    //first we need to get all the listing with close status
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized " });
    }
    const deliveryGuyId = req.user.id;
    //find all the listing with closed status
    const listings = await Listing.find({ status: "closed" })
      .populate("seller", "name email phone address") //populate seller details
      .populate("buyer", "name email phone address") //populate buyer details
      .skip(skip)
      .limit(limit)
      .exec();

    const totalListings = await Listing.countDocuments({
      status: "closed",
    }).exec();
    const totalPages = Math.ceil(totalListings / limit);
    res.status(200).json({
      page,
      totalPages,
      totalListings,
      listings,
    });
  } catch (error) {
    console.log("Error in getListingDetailsForDelivery:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

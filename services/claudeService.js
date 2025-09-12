import Anthropic from "@anthropic-ai/sdk";
import fs from "fs/promises";
import path from "path";
import sharp from "sharp";

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

// Comprehensive product analysis prompt
const PRODUCT_ANALYSIS_PROMPT = `
You are an expert product analyzer for an electronics marketplace. Analyze the provided product images and extract detailed information.

Please analyze these images and return a JSON object with the following structure:

{
  "product_category": "smartphone|laptop|tablet|smartwatch|headphones|gaming_console|camera|other_electronics",
  "brand": "Apple|Samsung|Sony|Dell|HP|Nintendo|etc",
  "model": "specific model name if identifiable",
  "manufacture_year": estimated_year_as_number_or_null,
  "condition": "excellent|good|fair|poor",
  "description": "detailed description of the product condition and features visible",
  "accessories": ["list", "of", "visible", "accessories"],
  "battery": "percentage_if_visible|good|fair|poor|unknown",
  "color": "primary color of the device",
  "storage": "storage capacity if visible (e.g., 128GB, 256GB)",
  "screen_size": "screen size if identifiable",
  "connectivity": ["wifi", "bluetooth", "cellular", "etc"],
  "visible_damage": "description of any scratches, cracks, or damage",
  "completeness": "all_accessories|missing_some|device_only",
  "estimated_price_range": {
    "min": estimated_minimum_price_usd,
    "max": estimated_maximum_price_usd,
    "currency": "USD"
  },
  "key_features": ["list", "of", "notable", "features", "visible"],
  "market_appeal": "high|medium|low",
  "recommended_improvements": ["suggestions", "for", "better", "listing"],
  "confidence_scores": {
    "brand": 0.0_to_1.0,
    "model": 0.0_to_1.0,
    "condition": 0.0_to_1.0,
    "price_estimate": 0.0_to_1.0,
    "overall": 0.0_to_1.0
  },
  "image_quality_feedback": {
    "rating": "excellent|good|fair|poor",
    "suggestions": ["list", "of", "photo", "improvement", "tips"]
  }
}

ANALYSIS GUIDELINES:
1. **Product Category**: Be specific - distinguish between smartphones, tablets, laptops, etc.
2. **Brand & Model**: Look for logos, model numbers, distinctive design features
3. **Condition Assessment**: 
   - Excellent: Like new, no visible wear
   - Good: Minor wear, fully functional appearance
   - Fair: Noticeable wear but still presentable
   - Poor: Significant damage or heavy wear
4. **Price Estimation**: Base on visible condition, brand reputation, and apparent age
5. **Accessories**: Only list what's clearly visible in the images
6. **Damage Assessment**: Be thorough but fair - mention scratches, cracks, discoloration
7. **Confidence Scoring**: Rate how certain you are about each assessment
8. **Market Appeal**: Consider brand desirability, condition, and completeness

IMPORTANT:
- Only include information you can clearly observe in the images
- Use "unknown" or null for uncertain information
- Be conservative with price estimates for damaged items
- Provide actionable feedback for improving the listing
- Focus on details that buyers care about most

Return ONLY the JSON object, no additional text.
`;

// Optimized prompts for specific product categories
const CATEGORY_SPECIFIC_PROMPTS = {
  smartphone: `
Additional focus for smartphones:
- Check for carrier logos or unlocked status indicators
- Look for charging port type (Lightning, USB-C, Micro-USB)
- Assess screen condition carefully (cracks, dead pixels, brightness)
- Note if original box/documentation is visible
- Check for case/screen protector
- Look for water damage indicators if visible
`,

  laptop: `
Additional focus for laptops:
- Check keyboard condition and key wear
- Look for port types and availability
- Assess hinge condition and screen angle
- Note any stickers or customizations
- Check for original charger and cables
- Look for signs of overheating or fan issues
`,

  gaming_console: `
Additional focus for gaming consoles:
- Check for controller quantity and condition
- Look for cables and power adapters
- Note any game discs or cartridges visible
- Assess ventilation areas for dust/damage
- Check for custom modifications
- Look for original packaging
`,
};

/**
 * Optimize image for Claude API analysis
 * @param {string} imagePath - Path to the image file
 * @returns {Object} - Optimized image data for API
 */
async function optimizeImageForAnalysis(imagePath) {
  try {
    // Get image info
    const imageBuffer = await fs.readFile(imagePath);
    const imageInfo = await sharp(imageBuffer).metadata();

    // Optimize image if needed (Claude has size limits)
    let optimizedBuffer = imageBuffer;

    // If image is too large, resize it while maintaining quality
    if (imageInfo.width > 1920 || imageInfo.height > 1920) {
      optimizedBuffer = await sharp(imageBuffer)
        .resize(1920, 1920, {
          fit: "inside",
          withoutEnlargement: true,
        })
        .jpeg({ quality: 85 })
        .toBuffer();
    }

    // Determine media type
    let mediaType = "image/jpeg";
    if (imagePath.toLowerCase().endsWith(".png")) {
      mediaType = "image/png";
    } else if (imagePath.toLowerCase().endsWith(".webp")) {
      mediaType = "image/webp";
    }

    return {
      type: "image",
      source: {
        type: "base64",
        media_type: mediaType,
        data: optimizedBuffer.toString("base64"),
      },
    };
  } catch (error) {
    console.error("Error optimizing image:", error);
    throw new Error(`Failed to process image: ${imagePath}`);
  }
}

/**
 * Analyze product images using Claude AI
 * @param {Array} imagePaths - Array of image file paths
 * @param {string} categoryHint - Optional category hint to improve analysis
 * @returns {Object} - Analyzed product data
 */
export async function analyzeProductImages(imagePaths, categoryHint = null) {
  try {
    if (!process.env.CLAUDE_API_KEY) {
      throw new Error("Claude API key not configured");
    }

    if (!imagePaths || imagePaths.length === 0) {
      throw new Error("No images provided for analysis");
    }

    // Limit to 5 images to manage API costs and processing time
    const limitedPaths = imagePaths.slice(0, 5);

    // Process all images
    const imagePromises = limitedPaths.map((imagePath) => {
      const fullPath = path.join(process.cwd(), imagePath);
      return optimizeImageForAnalysis(fullPath);
    });

    const imageData = await Promise.all(imagePromises);

    // Prepare the prompt with category-specific instructions if provided
    let enhancedPrompt = PRODUCT_ANALYSIS_PROMPT;
    if (categoryHint && CATEGORY_SPECIFIC_PROMPTS[categoryHint]) {
      enhancedPrompt += "\n\n" + CATEGORY_SPECIFIC_PROMPTS[categoryHint];
    }

    // Prepare message content
    const messageContent = [
      {
        type: "text",
        text: enhancedPrompt,
      },
      ...imageData,
    ];

    console.log(
      `🤖 Analyzing ${imageData.length} product images with Claude AI...`
    );

    // Call Claude API
    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022", // Latest model with vision
      max_tokens: 2000,
      messages: [
        {
          role: "user",
          content: messageContent,
        },
      ],
      temperature: 0.3, // Lower temperature for more consistent analysis
    });

    // Parse the response
    const analysisText = response.content[0].text;
    console.log("🔍 Raw Claude response:", analysisText);

    // Clean and parse JSON response
    const cleanedResponse = analysisText
      .replace(/```json\n?|\n?```/g, "")
      .trim();
    const analysisResult = JSON.parse(cleanedResponse);

    // Add metadata
    analysisResult.analysis_metadata = {
      analyzed_at: new Date().toISOString(),
      images_count: imageData.length,
      model_used: "claude-3-5-sonnet-20241022",
      processing_time: Date.now(),
    };

    console.log("✅ Product analysis completed successfully");
    return analysisResult;
  } catch (error) {
    console.error("❌ Error analyzing product images:", error);

    // Return a fallback response structure
    return {
      error: true,
      message: error.message,
      fallback_data: {
        product_category: "unknown",
        brand: "unknown",
        model: "unknown",
        condition: "unknown",
        description: "AI analysis failed. Please fill in details manually.",
        confidence_scores: {
          overall: 0.0,
        },
        recommended_improvements: [
          "AI analysis unavailable - please provide detailed description",
          "Ensure images are clear and well-lit",
          "Include multiple angles of the product",
        ],
      },
    };
  }
}

/**
 * Quick category detection for routing to specialized analysis
 * @param {Array} imagePaths - Array of image file paths
 * @returns {string} - Detected category hint
 */
export async function detectProductCategory(imagePaths) {
  try {
    if (!imagePaths || imagePaths.length === 0) return null;

    // Use only the first image for quick category detection
    const firstImagePath = path.join(process.cwd(), imagePaths[0]);
    const imageData = await optimizeImageForAnalysis(firstImagePath);

    const categoryPrompt = `
Analyze this image and return ONLY the product category from this list:
smartphone, laptop, tablet, smartwatch, headphones, gaming_console, camera, other_electronics

Return just the category name, nothing else.
`;

    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 50,
      messages: [
        {
          role: "user",
          content: [{ type: "text", text: categoryPrompt }, imageData],
        },
      ],
      temperature: 0.1,
    });

    return response.content[0].text.trim().toLowerCase();
  } catch (error) {
    console.error("Error detecting category:", error);
    return null;
  }
}

/**
 * Validate and enhance AI analysis results
 * @param {Object} analysisResult - Raw AI analysis
 * @returns {Object} - Validated and enhanced result
 */
export function validateAndEnhanceAnalysis(analysisResult) {
  if (analysisResult.error) {
    return analysisResult;
  }

  // Ensure required fields have defaults
  const enhanced = {
    product_category: analysisResult.product_category || "other_electronics",
    brand: analysisResult.brand || "Unknown",
    model: analysisResult.model || "Unknown Model",
    manufacture_year: analysisResult.manufacture_year || null,
    condition: analysisResult.condition || "fair",
    description:
      analysisResult.description || "Product details extracted from images",
    accessories: Array.isArray(analysisResult.accessories)
      ? analysisResult.accessories
      : [],
    battery: analysisResult.battery || "unknown",
    color: analysisResult.color || "Unknown",
    storage: analysisResult.storage || "Unknown",
    visible_damage: analysisResult.visible_damage || "None visible",
    estimated_price_range: analysisResult.estimated_price_range || {
      min: 0,
      max: 0,
      currency: "USD",
    },
    confidence_scores: analysisResult.confidence_scores || { overall: 0.5 },
    ...analysisResult,
  };

  // Add quality indicators
  enhanced.analysis_quality = {
    high_confidence: enhanced.confidence_scores.overall > 0.8,
    needs_review: enhanced.confidence_scores.overall < 0.6,
    recommended_action:
      enhanced.confidence_scores.overall > 0.8
        ? "Auto-populate form"
        : "Show suggestions for review",
  };

  return enhanced;
}

export default {
  analyzeProductImages,
  detectProductCategory,
  validateAndEnhanceAnalysis,
};

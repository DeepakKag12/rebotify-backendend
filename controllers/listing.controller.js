import Listing from "../models/listing.model.js";
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

//

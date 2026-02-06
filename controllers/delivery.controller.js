import Delivery from "../models/delivery.model.js";
import Listing from "../models/listing.model.js";
import User from "../models/user.model.js";

//get listing details for delivery based useing (which is entire delivery model cause in there only those listings are there which are closed)
export const getListingDetailsForDelivery = async (req, res) => {
  try {
    //check wether user is authenticated or not
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const DeliveryData = await Delivery.find()
      .populate("sellerId", "name email addresses phone")
      .populate("buyerId", "name email addresses phone")
      .populate({
        path: "orderId",
        select: "product_category brand model price image_paths",
      })
      .sort({ createdAt: -1 });
    res.status(200).json({ DeliveryData });
  } catch (error) {
    console.error("Error fetching listing details for delivery:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//get user's deliveries (as buyer or seller)
export const getUserDeliveries = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = req.user.id; // Changed from req.user.userId to req.user.id

    // Get deliveries where user is either buyer or seller
    const deliveries = await Delivery.find({
      $or: [{ buyerId: userId }, { sellerId: userId }],
    })
      .populate("sellerId", "name email addresses phone")
      .populate("buyerId", "name email addresses phone")
      .populate({
        path: "orderId",
        select: "product_category brand model price image_paths description",
      })
      .sort({ createdAt: -1 });

    // Separate into sales and purchases
    const sales = deliveries.filter(
      (delivery) => delivery.sellerId._id.toString() === userId
    );
    const purchases = deliveries.filter(
      (delivery) => delivery.buyerId._id.toString() === userId
    );

    res.status(200).json({
      success: true,
      deliveries,
      sales,
      purchases,
    });
  } catch (error) {
    console.error("Error fetching user deliveries:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
//update delivery status by delivery partner
export const updateDeliveryStatus = async (req, res) => {
  try {
    //check wether user is authenticated or not
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const { deliveryId } = req.params;
    const { status, notes } = req.body;

    // Validate status
    const validStatuses = ["pending", "shipped", "outForDelivery", "delivered"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    // Find the delivery by ID
    const delivery = await Delivery.findById(deliveryId);
    if (!delivery) {
      return res.status(404).json({ message: "Delivery not found" });
    }

    // Update the status
    delivery.status_delivery = status;

    // Add to status history
    delivery.statusHistory.push({
      status: status,
      timestamp: new Date(),
      notes: notes || `Status updated to ${status}`,
      updatedBy: req.user.id,
    });

    // Assign delivery partner if not already assigned
    if (!delivery.deliveryPartnerId) {
      delivery.deliveryPartnerId = req.user.id;
    }

    await delivery.save();

    // Populate the response
    await delivery.populate([
      { path: "sellerId", select: "name email address phone" },
      { path: "buyerId", select: "name email address phone" },
      {
        path: "orderId",
        select: "product_category brand model price image_paths description",
      },
      { path: "deliveryPartnerId", select: "name email phone" },
    ]);

    res.status(200).json({
      success: true,
      message: "Delivery status updated successfully",
      delivery,
    });
  } catch (error) {
    console.error("Error updating delivery status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get single delivery by ID
export const getDeliveryById = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { deliveryId } = req.params;

    const delivery = await Delivery.findById(deliveryId)
      .populate("sellerId", "name email addresses phone")
      .populate("buyerId", "name email addresses phone")
      .populate({
        path: "orderId",
        select: "product_category brand model price image_paths description",
      })
      .populate("deliveryPartnerId", "name email phone")
      .populate("statusHistory.updatedBy", "name");

    if (!delivery) {
      return res.status(404).json({
        success: false,
        message: "Delivery not found",
      });
    }

    res.status(200).json({
      success: true,
      delivery,
    });
  } catch (error) {
    console.error("Error fetching delivery:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

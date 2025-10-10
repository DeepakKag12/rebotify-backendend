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
        .populate("sellerId", "name email address phone")
        .populate("buyerId", "name email address phone");

    res.status(200).json({ DeliveryData });
  } catch (error) {
    console.error("Error fetching listing details for delivery:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

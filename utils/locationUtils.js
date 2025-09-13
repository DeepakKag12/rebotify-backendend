import geocodingService from "../services/geocodingService.js";

/**
 * Get coordinates from address
 * @param {string} address - User's address
 * @returns {Promise<Object>} Location data with coordinates
 */
export const getCoordinatesFromAddress = async (address) => {
  const result = {
    address: address?.trim() || "",
    location: {
      latitude: null,
      longitude: null,
      updatedAt: new Date(),
    },
    error: null,
  };

  // If no address provided, return early
  if (!result.address) {
    result.error = "Address is required";
    return result;
  }

  // Try to geocode the address
  try {
    const geocodeResult = await geocodingService.geocodeAddress(result.address);

    if (geocodeResult) {
      result.location.latitude = geocodeResult.latitude;
      result.location.longitude = geocodeResult.longitude;
    } else {
      result.error = "Could not determine location from address";
    }
  } catch (error) {
    console.error("Error getting coordinates from address:", error);
    result.error = "Failed to process address";
  }

  return result;
};

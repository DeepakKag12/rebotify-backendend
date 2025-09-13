import fetch from "node-fetch";

class GeocodingService {
  /**
   * Convert address to coordinates using free Nominatim service
   * @param {string} address - The address to geocode
   * @returns {Promise<{latitude: number, longitude: number} | null>}
   */
  async geocodeAddress(address) {
    try {
      if (
        !address ||
        typeof address !== "string" ||
        address.trim().length === 0
      ) {
        return null;
      }

      const encodedAddress = encodeURIComponent(address.trim());
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1`;

      const response = await fetch(url, {
        headers: {
          "User-Agent": "Rebot-Backend/1.0", // Required by Nominatim
        },
      });
      const data = await response.json();

      if (data && data.length > 0) {
        const result = data[0];
        return {
          latitude: parseFloat(result.lat),
          longitude: parseFloat(result.lon),
        };
      }

      return null;
    } catch (error) {
      console.error("Error geocoding address:", error);
      return null;
    }
  }
}

export default new GeocodingService();

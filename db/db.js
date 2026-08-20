import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config(); // Load environment variables from .env file

let isConnected = false; // Track connection status

const connectDB = async () => {
  if (isConnected) {
    console.log("Using existing MongoDB connection");
    return;
  }

  try {
    const mongoUri = process.env.MONGO_URL || process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error(
        "MongoDB URI is not defined. Set MONGO_URL or MONGODB_URI."
      );
    }

    let mongoHost = "unknown-host";
    try {
      mongoHost = new URL(mongoUri).hostname;
    } catch {
      // Keep host as unknown if URI parsing fails.
    }

    console.log(`Attempting MongoDB connection to ${mongoHost}`);

    await mongoose.connect(mongoUri, {
      bufferCommands: false, // Disable mongoose buffering
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      family: 4, // Use IPv4, skip trying IPv6
    });

    isConnected = true;
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error?.message || error);
    if (error?.code) {
      console.error("MongoDB error code:", error.code);
    }
    throw error; // Don't exit process in serverless environment
  }
};

export { connectDB };

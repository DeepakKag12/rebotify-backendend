import express from "express";
import cors from "cors";

//db connection
import { connectDB } from "../db/db.js";

//import routes
import userRoutes from "../routes/user.route.js";
import listingRoutes from "../routes/listing.route.js";
import certificateRoutes from "../routes/certificate.route.js";
import chatRoutes from "../routes/chat.route.js";
import deliveryRoutes from "../routes/delivery.route.js";
import bidRoutes from "../routes/bid.route.js";
import transactionRoutes from "../routes/transaction.route.js";

// Import Swagger configuration and Scalar API Reference
import { specs } from "../swagger.js";
import { apiReference } from "@scalar/express-api-reference";

//middleware
import cookieParser from "cookie-parser";

const app = express();

// All allowed origins (both production and local dev)
const allowedOrigins = [
  "https://rebootify.aadi01.me",
  "https://www.rebootify.aadi01.me",
  "https://rebot-frontend.vercel.app",
  "https://rebotify-frontend.vercel.app",
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3005",
  "http://localhost:5173",
  "http://localhost:5174",
];

// Configure CORS - allow all origins for both production and local dev
const corsOptions = {
  origin: allowedOrigins,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Note: Image uploads are now handled by Cloudinary (cloud storage)
// No local file storage needed for Vercel serverless deployment

// Database connection - connect once and cache
let isConnected = false;

const ensureDBConnection = async () => {
  if (isConnected) {
    return;
  }
  try {
    await connectDB();
    isConnected = true;
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Database connection error:", error);
    throw error;
  }
};

// Database connection middleware
app.use(async (req, res, next) => {
  try {
    await ensureDBConnection();
    next();
  } catch (error) {
    console.error("Database connection error:", error);
    res.status(500).json({ error: "Database connection failed" });
  }
});

// API Documentation
app.use(
  "/ref",
  apiReference({
    spec: {
      content: specs,
    },
    metaData: {
      title: "Rebot Backend API Documentation",
    },
    configuration: {
      theme: "default",
    },
  })
);

// Legacy redirect for old Swagger path
app.get("/api-docs", (req, res) => {
  res.redirect("/ref");
});

// Also redirect /reference to new /ref path
app.get("/reference", (req, res) => {
  res.redirect("/ref");
});

// Provide API documentation as JSON endpoint
app.get("/api-docs.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(specs);
});

//routes
app.use("/api/users", userRoutes);
app.use("/api/listings", listingRoutes);
app.use("/api/certificates", certificateRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/deliveries", deliveryRoutes);
app.use("/api/bids", bidRoutes);
app.use("/api/transactions", transactionRoutes);

// Root endpoint with API documentation links
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to Rebot Backend API",
    documentation: {
      scalar_api: `${process.env.BASE_URL}/ref`,
    },
    version: "1.0.0",
    status: "active",
  });
});

// IMPORTANT: Export the Express app for Vercel serverless
export default app;

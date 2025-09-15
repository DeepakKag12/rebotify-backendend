import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";

//db connection
import connectDB from "./db/db.js";

//import routes
import userRoutes from "./routes/user.route.js";
import listingRoutes from "./routes/listing.route.js";
import certificateRoutes from "./routes/certificate.route.js";
import chatRoutes from "./routes/chat.route.js";

// Import Socket handlers
import {
  authenticateSocket,
  handleConnection,
} from "./socket/socketHandlers.js";

// Import Swagger configuration and Scalar API Reference
import { specs } from "./swagger.js";
import { apiReference } from "@scalar/express-api-reference";

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const PORT = process.env.PORT || 3001;

//middleware
import cookieParser from "cookie-parser";
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Socket.IO middleware and connection handling
io.use(authenticateSocket);
io.on("connection", handleConnection(io));

app.use(
  "/ref",
  apiReference({
    spec: {
      content: specs,
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

// Root endpoint with API documentation links
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to Rebot Backend API",
    documentation: {
      scalar_api: `http://localhost:${PORT}/ref`,
      legacy_swagger: `http://localhost:${PORT}/api-docs`,
      json_spec: `http://localhost:${PORT}/api-docs.json`,
    },
    api_endpoints: {
      users: `http://localhost:${PORT}/api/users`,
      listings: `http://localhost:${PORT}/api/listings`,
      certificates: `http://localhost:${PORT}/api/certificates`,
      chats: `http://localhost:${PORT}/api/chats`,
    },
    ai_features: {
      image_analysis: `http://localhost:${PORT}/api/listings/analyze-images`,
      description:
        "Upload product images to get AI-powered listing suggestions",
    },
    version: "1.0.0",
    status: "active",
    features: [
      "JWT Authentication",
      "File Upload Support",
      "AI-Powered Product Analysis",
      "Clean API Documentation (Scalar)",
      "Real-time Listing Management",
      "Real-time Chat System",
    ],
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(
    `📚 API Documentation available at: http://localhost:${PORT}/ref`
  );
  console.log(
    `📖 Legacy Swagger UI available at: http://localhost:${PORT}/api-docs`
  );
  console.log(
    `AI Image Analysis available at: http://localhost:${PORT}/api/listings/analyze-images`
  );
  console.log(`🚀 Socket.IO server ready for real-time chat`);
  connectDB();
});

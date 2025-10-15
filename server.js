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
import deliveryRoutes from "./routes/delivery.route.js";
import bidRoutes from "./routes/bid.route.js";
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
    origin:
      process.env.NODE_ENV === "production"
        ? ["https://rebootify.aadi01.me", "https://www.rebootify.aadi01.me"]
        : [
            "http://localhost:3000",
            "http://localhost:3001",
            "http://localhost:3005",
          ],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const PORT = process.env.PORT || 3001;

//middleware
import cookieParser from "cookie-parser";

// Configure CORS based on environment
const corsOptions = {
  origin:
    process.env.NODE_ENV === "production"
      ? ["https://rebootify.aadi01.me", "https://www.rebootify.aadi01.me"]
      : [
          "http://localhost:3000",
          "http://localhost:3001",
          "http://localhost:3005",
        ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
};

app.use(cors(corsOptions));
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
app.use("/api/deliveries", deliveryRoutes);
app.use("/api/bids", bidRoutes);
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

server.listen(PORT, () => {
  console.log(`Server is running on :${PORT}`);
  console.log(` API Documentation available at: ${process.env.BASE_URL}/ref`);
  console.log(
    `Legacy Swagger UI available at: ${process.env.BASE_URL}/api-docs`
  );

  connectDB();
});

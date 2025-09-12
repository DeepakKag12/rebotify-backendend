import express from "express";

//db connection
import connectDB from "./db/db.js";

//import routes
import userRoutes from "./routes/user.route.js";
import listingRoutes from "./routes/listing.route.js";
import certificateRoutes from "./routes/certificate.route.js";

// Import Swagger configuration
import { specs, swaggerUi } from "./swagger.js";

const app = express();
const PORT = process.env.PORT || 3001;

//middleware
import cookieParser from "cookie-parser";
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Swagger UI setup - This creates the beautiful API documentation interface
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(specs, {
    explorer: true,
    customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui .info .title { color: #2d5d7b; font-size: 32px; }
    .swagger-ui .info .description { font-size: 16px; line-height: 1.6; }
    .swagger-ui .scheme-container { background: #f8f9fa; padding: 20px; border-radius: 8px; }
    .swagger-ui .opblock.opblock-post { border-color: #28a745; }
    .swagger-ui .opblock.opblock-get { border-color: #007bff; }
    .swagger-ui .opblock.opblock-put { border-color: #ffc107; }
    .swagger-ui .opblock.opblock-patch { border-color: #fd7e14; }
    .swagger-ui .opblock.opblock-delete { border-color: #dc3545; }
  `,
    customSiteTitle: "Rebot API Documentation",
    customfavIcon: "/favicon.ico",
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      docExpansion: "none",
      filter: true,
      showExtensions: true,
      showCommonExtensions: true,
      defaultModelsExpandDepth: 2,
      defaultModelExpandDepth: 2,
    },
  })
);

// Redirect root API docs path to Swagger UI
app.get("/api-docs", (req, res) => {
  res.redirect("/api-docs/");
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

// Root endpoint with API documentation links
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to Rebot Backend API",
    documentation: {
      swagger_ui: `http://localhost:${PORT}/api-docs`,
      json_spec: `http://localhost:${PORT}/api-docs.json`,
    },
    api_endpoints: {
      users: `http://localhost:${PORT}/api/users`,
      listings: `http://localhost:${PORT}/api/listings`,
      certificates: `http://localhost:${PORT}/api/certificates`,
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
      "Interactive API Documentation",
      "Real-time Listing Management",
    ],
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(
    `📚 API Documentation available at: http://localhost:${PORT}/api-docs`
  );
  console.log(
    `AI Image Analysis available at: http://localhost:${PORT}/api/listings/analyze-images`
  );
  connectDB();
});

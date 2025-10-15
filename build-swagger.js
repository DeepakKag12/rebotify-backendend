// Build script to generate swagger specification for production
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import swaggerJSDoc from 'swagger-jsdoc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Generate server URLs based on environment
const generateServers = () => {
  return [
    {
      url: "http://localhost:3005",
      description: "Development server",
    },
    {
      url: "https://rebootify.aadi01.me",
      description: "Production server",
    },
  ];
};

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Rebot Backend API",
      version: "1.0.0",
      description:
        "A comprehensive API for the Rebot platform - connecting users for buying, selling, and recycling electronic devices.",
      contact: {
        name: "Rebot Development Team",
        email: "dev@rebot.com",
      },
      license: {
        name: "MIT",
        url: "https://opensource.org/licenses/MIT",
      },
    },
    servers: generateServers(),
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "JWT Authorization header using the Bearer scheme.",
        },
        CookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "token",
          description: "JWT token stored in httpOnly cookie",
        },
      },
      schemas: {
        // User Schemas
        User: {
          type: "object",
          required: ["name", "email", "password", "address"],
          properties: {
            _id: {
              type: "string",
              description: "User unique identifier",
              example: "64f5b8c2e4b0a1b2c3d4e5f6",
            },
            name: {
              type: "string",
              description: "Full name of the user",
              example: "John Doe",
            },
            email: {
              type: "string",
              format: "email",
              description: "User email address",
              example: "john.doe@example.com",
            },
            password: {
              type: "string",
              format: "password",
              description: "User password (hashed)",
              example: "$2b$10$...",
            },
            userType: {
              type: "string",
              enum: ["user", "admin", "recycler", "delivery"],
              default: "user",
              description: "Type of user account",
              example: "user",
            },
            address: {
              type: "string",
              description: "User address",
              example: "123 Main St, City, State, ZIP",
            },
            location: {
              type: "object",
              properties: {
                latitude: {
                  type: "number",
                  description: "Latitude coordinate (optional)",
                  example: 40.7128,
                },
                longitude: {
                  type: "number",
                  description: "Longitude coordinate (optional)",
                  example: -74.006,
                },
              },
            },
            lasLogin: {
              type: "string",
              format: "date-time",
              description: "Last login timestamp",
              example: "2023-12-01T10:30:00Z",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Account creation timestamp",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "Last update timestamp",
            },
          },
        },
        UserSignup: {
          type: "object",
          required: ["name", "email", "password", "userType", "address"],
          properties: {
            name: {
              type: "string",
              description: "Full name of the user",
              example: "John Doe",
            },
            email: {
              type: "string",
              format: "email",
              description: "User email address",
              example: "john.doe@example.com",
            },
            password: {
              type: "string",
              format: "password",
              minLength: 6,
              description: "User password (minimum 6 characters)",
              example: "password123",
            },
            userType: {
              type: "string",
              enum: ["user", "admin", "recycler", "delivery"],
              default: "user",
              description: "Type of user account",
              example: "user",
            },
            address: {
              type: "string",
              description:
                "User address (will be automatically converted to coordinates)",
              example: "Times Square, New York, NY",
            },
          },
        },
        UserLogin: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: {
              type: "string",
              format: "email",
              description: "User email address",
              example: "john.doe@example.com",
            },
            password: {
              type: "string",
              format: "password",
              description: "User password",
              example: "password123",
            },
          },
        },
        UserUpdate: {
          type: "object",
          properties: {
            name: {
              type: "string",
              description: "Full name of the user",
              example: "John Updated Doe",
            },
            address: {
              type: "string",
              description:
                "User address (will be automatically converted to coordinates)",
              example: "Central Park, New York, NY",
            },
          },
        },
        // Response Schemas
        ApiResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              description: "Indicates if the request was successful",
              example: true,
            },
            message: {
              type: "string",
              description: "Response message",
              example: "Operation completed successfully",
            },
            data: {
              type: "object",
              description: "Response data",
            },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              description: "Indicates if the request was successful",
              example: false,
            },
            message: {
              type: "string",
              description: "Error message",
              example: "An error occurred",
            },
            error: {
              type: "object",
              description: "Error details",
            },
          },
        },
        AuthResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              description: "Indicates if authentication was successful",
              example: true,
            },
            message: {
              type: "string",
              description: "Authentication message",
              example: "Login successful",
            },
            user: {
              $ref: "#/components/schemas/User",
            },
            token: {
              type: "string",
              description: "JWT token for authentication",
              example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            },
          },
        },
        PaginatedResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              description: "Indicates if the request was successful",
              example: true,
            },
            data: {
              type: "array",
              items: {
                type: "object",
              },
              description: "Array of response data",
            },
            pagination: {
              type: "object",
              properties: {
                page: {
                  type: "number",
                  description: "Current page number",
                  example: 1,
                },
                limit: {
                  type: "number",
                  description: "Number of items per page",
                  example: 10,
                },
                total: {
                  type: "number",
                  description: "Total number of items",
                  example: 100,
                },
                pages: {
                  type: "number",
                  description: "Total number of pages",
                  example: 10,
                },
              },
            },
          },
        },
      },
    },
    security: [
      {
        BearerAuth: [],
      },
      {
        CookieAuth: [],
      },
    ],
    tags: [
      {
        name: "Authentication",
        description: "User authentication and authorization endpoints",
      },
      {
        name: "Users",
        description: "User management operations",
      },
      {
        name: "Listings",
        description: "Product listing management",
      },
      {
        name: "Chats",
        description: "Real-time chat system for buyers and sellers",
      },
      {
        name: "Certificates",
        description: "Certificate management for recyclers",
      },
      {
        name: "Bids",
        description: "Auction bidding system for product listings",
      },
      {
        name: "Deliveries",
        description: "Delivery management and tracking",
      },
      {
        name: "Analytics",
        description: "Platform analytics and statistics",
      },
    ],
  },
  // Use explicit file paths
  apis: [
    path.join(__dirname, "docs/api/users.js"),
    path.join(__dirname, "docs/api/listings.js"),
    path.join(__dirname, "docs/api/certificates.js"),
    path.join(__dirname, "docs/api/chats.js"),
    path.join(__dirname, "docs/api/bids.js"),
    path.join(__dirname, "docs/api/deliveries.js"),
  ],
};

// Generate the swagger specification
const specs = swaggerJSDoc(options);

// Write the specification to a JSON file
const outputPath = path.join(__dirname, 'swagger-spec.json');
fs.writeFileSync(outputPath, JSON.stringify(specs, null, 2));

console.log(`✅ Swagger specification generated successfully!`);
console.log(`📄 Output: ${outputPath}`);
console.log(`📊 Paths found: ${Object.keys(specs.paths || {}).length}`);
console.log(`🏷️  Tags: ${specs.tags.map(t => t.name).join(', ')}`);
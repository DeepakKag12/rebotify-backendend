import swaggerJSDoc from "swagger-jsdoc";

// Generate server URLs based on environment
const generateServers = () => {
  const servers = [
    {
      url: "http://localhost:3005",
      description: "Development server",
    },
  ];

  // Add production server if in production environment
  if (process.env.NODE_ENV === "production") {
    servers.push({
      url: "https://rebootify.aadi01.me",
      description: "Production server",
    });
  }

  return servers;
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
        // Listing Schemas
        Listing: {
          type: "object",
          required: ["seller"],
          properties: {
            _id: {
              type: "string",
              description: "Listing unique identifier",
              example: "64f5b8c2e4b0a1b2c3d4e5f7",
            },
            product_category: {
              type: "string",
              description: "Category of the product",
              example: "Smartphone",
            },
            brand: {
              type: "string",
              description: "Brand of the product",
              example: "Apple",
            },
            model: {
              type: "string",
              description: "Model of the product",
              example: "iPhone 13",
            },
            manufacture_year: {
              type: "number",
              description: "Year of manufacture",
              example: 2021,
            },
            condition: {
              type: "string",
              description: "Condition of the product",
              example: "Good",
            },
            description: {
              type: "string",
              description: "Detailed description of the product",
              example: "Excellent condition iPhone 13 with minimal wear",
            },
            accessories: {
              type: "string",
              description: "Included accessories",
              example: "Charger, Case, Screen Protector",
            },
            battery: {
              type: "string",
              description: "Battery condition/health",
              example: "85%",
            },
            video_link: {
              type: "string",
              format: "uri",
              description: "Link to product video",
              example: "https://youtube.com/watch?v=...",
            },
            price: {
              type: "number",
              description: "Price of the product",
              example: 500.0,
            },
            price_type: {
              type: "string",
              description: "Type of pricing",
              example: "fixed",
            },
            delivery_options: {
              type: "string",
              description: "Available delivery options",
              example: "pickup, delivery",
            },
            name: {
              type: "string",
              description: "Contact name",
              example: "John Doe",
            },
            email: {
              type: "string",
              format: "email",
              description: "Contact email",
              example: "john.doe@example.com",
            },
            phone: {
              type: "string",
              description: "Contact phone number",
              example: "+1234567890",
            },
            contact_preference: {
              type: "string",
              description: "Preferred contact method",
              example: "email",
            },
            location: {
              type: "string",
              description: "Location of the product",
              example: "New York, NY",
            },
            address: {
              type: "string",
              description: "Address for pickup/delivery",
              example: "123 Main St, New York, NY",
            },
            seller: {
              type: "string",
              description: "Seller user ID",
              example: "64f5b8c2e4b0a1b2c3d4e5f6",
            },
            buyer: {
              type: "string",
              description: "Buyer user ID (if assigned)",
              example: "64f5b8c2e4b0a1b2c3d4e5f8",
            },
            image_paths: {
              type: "array",
              items: {
                type: "string",
              },
              description: "Array of image file paths",
              example: ["/uploads/image1.jpg", "/uploads/image2.jpg"],
            },
            status: {
              type: "string",
              enum: ["open", "pending", "closed", "delivered"],
              default: "open",
              description: "Current status of the listing",
              example: "open",
            },
            status_update_by: {
              type: "string",
              description: "User ID who last updated the status",
              example: "64f5b8c2e4b0a1b2c3d4e5f6",
            },
            created_at: {
              type: "string",
              format: "date-time",
              description: "Listing creation timestamp",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "System creation timestamp",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "Last update timestamp",
            },
          },
        },
        ListingCreate: {
          type: "object",
          properties: {
            product_category: {
              type: "string",
              description: "Category of the product",
              example: "Smartphone",
            },
            brand: {
              type: "string",
              description: "Brand of the product",
              example: "Apple",
            },
            model: {
              type: "string",
              description: "Model of the product",
              example: "iPhone 13",
            },
            manufacture_year: {
              type: "number",
              description: "Year of manufacture",
              example: 2021,
            },
            condition: {
              type: "string",
              description: "Condition of the product",
              example: "Good",
            },
            description: {
              type: "string",
              description: "Detailed description of the product",
              example: "Excellent condition iPhone 13 with minimal wear",
            },
            accessories: {
              type: "string",
              description: "Included accessories",
              example: "Charger, Case, Screen Protector",
            },
            battery: {
              type: "string",
              description: "Battery condition/health",
              example: "85%",
            },
            video_link: {
              type: "string",
              format: "uri",
              description: "Link to product video",
              example: "https://youtube.com/watch?v=...",
            },
            price: {
              type: "number",
              description: "Price of the product",
              example: 500.0,
            },
            price_type: {
              type: "string",
              description: "Type of pricing",
              example: "fixed",
            },
            delivery_options: {
              type: "string",
              description: "Available delivery options",
              example: "pickup, delivery",
            },
            name: {
              type: "string",
              description: "Contact name",
              example: "John Doe",
            },
            email: {
              type: "string",
              format: "email",
              description: "Contact email",
              example: "john.doe@example.com",
            },
            phone: {
              type: "string",
              description: "Contact phone number",
              example: "+1234567890",
            },
            contact_preference: {
              type: "string",
              description: "Preferred contact method",
              example: "email",
            },
            location: {
              type: "string",
              description: "Location of the product",
              example: "New York, NY",
            },
            address: {
              type: "string",
              description: "Address for pickup/delivery",
              example: "123 Main St, New York, NY",
            },
          },
        },
        ListingStatusUpdate: {
          type: "object",
          required: ["status"],
          properties: {
            status: {
              type: "string",
              enum: ["open", "pending", "closed", "delivered"],
              description: "New status for the listing",
              example: "pending",
            },
            buyer: {
              type: "string",
              description: "Buyer user ID (required when status is pending)",
              example: "64f5b8c2e4b0a1b2c3d4e5f8",
            },
          },
        },
        // Certificate Schemas
        Certificate: {
          type: "object",
          required: [
            "uploadby",
            "documentType",
            "certificateNumber",
            "issuingAuthority",
            "validityPeriod",
            "uploadDocument",
          ],
          properties: {
            _id: {
              type: "string",
              description: "Certificate unique identifier",
              example: "64f5b8c2e4b0a1b2c3d4e5f9",
            },
            uploadby: {
              type: "string",
              description: "User ID who uploaded the certificate",
              example: "64f5b8c2e4b0a1b2c3d4e5f6",
            },
            documentType: {
              type: "string",
              description: "Type of certificate document",
              example: "Recycler License",
            },
            certificateNumber: {
              type: "string",
              pattern: "^CERT-\\d{4}-\\d{5}$",
              description: "Certificate number in format CERT-YYYY-XXXXX",
              example: "CERT-2023-12345",
            },
            issuingAuthority: {
              type: "string",
              description: "Authority that issued the certificate",
              example: "Environmental Protection Agency",
            },
            validityPeriod: {
              type: "object",
              required: ["start", "end"],
              properties: {
                start: {
                  type: "string",
                  format: "date",
                  description: "Certificate validity start date",
                  example: "2023-01-01",
                },
                end: {
                  type: "string",
                  format: "date",
                  description: "Certificate validity end date",
                  example: "2024-01-01",
                },
              },
            },
            uploadDocument: {
              type: "string",
              description: "Path to uploaded certificate document",
              example: "/uploads/cert-12345.pdf",
            },
            status: {
              type: "string",
              enum: ["pending", "approved", "disapproved"],
              default: "pending",
              description: "Certificate approval status",
              example: "pending",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Certificate upload timestamp",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "Last update timestamp",
            },
          },
        },
        CertificateUpload: {
          type: "object",
          required: [
            "documentType",
            "certificateNumber",
            "issuingAuthority",
            "validityPeriod",
          ],
          properties: {
            documentType: {
              type: "string",
              description: "Type of certificate document",
              example: "Recycler License",
            },
            certificateNumber: {
              type: "string",
              pattern: "^CERT-\\d{4}-\\d{5}$",
              description: "Certificate number in format CERT-YYYY-XXXXX",
              example: "CERT-2023-12345",
            },
            issuingAuthority: {
              type: "string",
              description: "Authority that issued the certificate",
              example: "Environmental Protection Agency",
            },
            validityPeriod: {
              type: "object",
              required: ["start", "end"],
              properties: {
                start: {
                  type: "string",
                  format: "date",
                  description: "Certificate validity start date",
                  example: "2023-01-01",
                },
                end: {
                  type: "string",
                  format: "date",
                  description: "Certificate validity end date",
                  example: "2024-01-01",
                },
              },
            },
          },
        },
        CertificateStatusUpdate: {
          type: "object",
          required: ["status"],
          properties: {
            status: {
              type: "string",
              enum: ["pending", "approved", "disapproved"],
              description: "New approval status for the certificate",
              example: "approved",
            },
          },
        },
        CertificateDetailsUpdate: {
          type: "object",
          properties: {
            documentType: {
              type: "string",
              description: "Type of certificate document",
              example: "Updated Recycler License",
            },
            certificateNumber: {
              type: "string",
              pattern: "^CERT-\\d{4}-\\d{5}$",
              description: "Certificate number in format CERT-YYYY-XXXXX",
              example: "CERT-2023-54321",
            },
            issuingAuthority: {
              type: "string",
              description: "Authority that issued the certificate",
              example: "Updated Environmental Protection Agency",
            },
            validityPeriod: {
              type: "object",
              properties: {
                start: {
                  type: "string",
                  format: "date",
                  description: "Certificate validity start date",
                  example: "2023-06-01",
                },
                end: {
                  type: "string",
                  format: "date",
                  description: "Certificate validity end date",
                  example: "2024-06-01",
                },
              },
            },
          },
        },
        // Chat Schemas
        Chat: {
          type: "object",
          required: ["participants"],
          properties: {
            _id: {
              type: "string",
              description: "Chat unique identifier",
              example: "64f5b8c2e4b0a1b2c3d4e5fa",
            },
            participants: {
              type: "array",
              items: {
                type: "string",
              },
              description: "Array of participant user IDs",
              example: ["64f5b8c2e4b0a1b2c3d4e5f6", "64f5b8c2e4b0a1b2c3d4e5f8"],
            },
            lastMessage: {
              type: "string",
              description: "ID of the last message in this chat",
              example: "64f5b8c2e4b0a1b2c3d4e5fb",
            },
            lastMessageAt: {
              type: "string",
              format: "date-time",
              description: "Timestamp of the last message",
              example: "2023-12-01T10:30:00Z",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Chat creation timestamp",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "Last update timestamp",
            },
          },
        },
        Message: {
          type: "object",
          required: ["chatId", "sender", "content"],
          properties: {
            _id: {
              type: "string",
              description: "Message unique identifier",
              example: "64f5b8c2e4b0a1b2c3d4e5fc",
            },
            chatId: {
              type: "string",
              description: "ID of the chat this message belongs to",
              example: "64f5b8c2e4b0a1b2c3d4e5fa",
            },
            sender: {
              type: "string",
              description: "ID of the user who sent the message",
              example: "64f5b8c2e4b0a1b2c3d4e5f6",
            },
            content: {
              type: "string",
              description: "Message content",
              example: "Hello, is this item still available?",
            },
            messageType: {
              type: "string",
              enum: ["text", "image", "file"],
              default: "text",
              description: "Type of message",
              example: "text",
            },
            readBy: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  user: {
                    type: "string",
                    description: "User ID who read the message",
                  },
                  readAt: {
                    type: "string",
                    format: "date-time",
                    description: "When the message was read",
                  },
                },
              },
              description: "Array of users who have read this message",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Message creation timestamp",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "Last update timestamp",
            },
          },
        },
        ChatCreate: {
          type: "object",
          required: ["participants"],
          properties: {
            participants: {
              type: "array",
              items: {
                type: "string",
              },
              minItems: 2,
              maxItems: 2,
              description: "Array of participant user IDs (exactly 2 users)",
              example: ["64f5b8c2e4b0a1b2c3d4e5f6", "64f5b8c2e4b0a1b2c3d4e5f8"],
            },
          },
        },
        MessageCreate: {
          type: "object",
          required: ["content"],
          properties: {
            content: {
              type: "string",
              description: "Message content",
              example: "Hello, is this item still available?",
            },
            messageType: {
              type: "string",
              enum: ["text", "image", "file"],
              default: "text",
              description: "Type of message",
              example: "text",
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
  // Use explicit file paths for better compatibility with Vercel
  apis: [
    "./docs/api/users.js",
    "./docs/api/listings.js",
    "./docs/api/certificates.js",
    "./docs/api/chats.js",
    "./docs/api/bids.js",
    "./docs/api/deliveries.js",
  ],
};

const specs = swaggerJSDoc(options);

export { specs };

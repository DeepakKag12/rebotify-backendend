import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import swaggerJSDoc from "swagger-jsdoc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Try to load pre-built swagger specification for production
let specs;
try {
  const specPath = path.join(__dirname, 'swagger-spec.json');
  const specContent = fs.readFileSync(specPath, 'utf8');
  specs = JSON.parse(specContent);
  
  // Update server URLs based on current environment
  specs.servers = specs.servers.filter(server => {
    if (process.env.NODE_ENV === 'production') {
      return server.url.includes('rebootify.aadi01.me');
    } else {
      return server.url.includes('localhost');
    }
  });
  
  console.log('✅ Loaded pre-built swagger specification with', Object.keys(specs.paths || {}).length, 'paths');
} catch (error) {
  console.error('❌ Failed to load pre-built swagger specification, falling back to dynamic generation');
  
  // Fallback to dynamic generation for development
  const generateServers = () => {
    const servers = [
      {
        url: "http://localhost:3005",
        description: "Development server",
      },
    ];

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
          // Minimal schemas for fallback
          ApiResponse: {
            type: "object",
            properties: {
              success: {
                type: "boolean",
              },
              message: {
                type: "string",
              },
              data: {
                type: "object",
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
    apis: [
      "./docs/api/users.js",
      "./docs/api/listings.js",
      "./docs/api/certificates.js",
      "./docs/api/chats.js",
      "./docs/api/bids.js",
      "./docs/api/deliveries.js",
    ],
  };

  specs = swaggerJSDoc(options);
}

export { specs };

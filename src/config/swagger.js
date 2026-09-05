const swaggerJsdoc = require("swagger-jsdoc");

const env = require("./env");

const options = {
  definition: {
    openapi: "3.0.3",

    info: {
      title: "FarmDirect API",
      version: "1.0.0",
      description:
        "API documentation for the FarmDirect agricultural digital marketplace."
    },

    servers: [
      {
        url: `http://localhost:${env.PORT}`,
        description: "Local development server"
      }
    ],

    tags: [
      {
        name: "Health",
        description: "API health and system status"
      },
      {
        name: "Authentication",
        description: "Registration, login and authenticated user operations"
      },
      {
        name: "Admin",
        description: "Administrative user onboarding and management"
      },
      {
        name: "Profiles",
        description: "Farmer, buyer, FPO, logistics and government profiles"
      },
      {
        name: "Products",
        description: "Marketplace product operations"
      },
      {
        name: "Inventory",
        description: "Inventory and stock management"
      },
      {
        name: "Orders",
        description: "Consumer and marketplace order operations"
      },
      {
        name: "Payments",
        description: "Payment operations"
      },
      {
        name: "Logistics",
        description: "Shipment and logistics operations"
      },
      {
        name: "AI",
        description: "Demand forecasting and AI-related operations"
      },
      {
        name: "Dashboard",
        description: "Dashboard and analytics operations"
      }
    ],

    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter your JWT access token."
        }
      },

      schemas: {
        AdminCreateUserRequest: {
          type: "object",

          required: [
            "firstName",
            "lastName",
            "email",
            "phone",
            "password",
            "roleId"
          ],

          properties: {
            firstName: {
              type: "string",
              example: "Suresh"
            },

            lastName: {
              type: "string",
              example: "Kulkarni"
            },

            email: {
              type: "string",
              format: "email",
              example: "suresh.fpo@example.com"
            },

            phone: {
              type: "string",
              example: "9876543214"
            },

            password: {
              type: "string",
              format: "password",
              example: "FpoUser@123"
            },

            roleId: {
              type: "string",
              format: "object-id",
              description:
                "Role ID. Admin onboarding currently supports BULK_BUYER, FPO, LOGISTICS and GOVERNMENT_OFFICER.",
              example: "6a9ab48d2aed80625001ec90"
            }
          }
        },
        RegisterRequest: {
          type: "object",
          required: [
            "firstName",
            "lastName",
            "email",
            "phone",
            "password",
            "roleId"
          ],
          properties: {
            firstName: {
              type: "string",
              minLength: 2,
              maxLength: 50,
              example: "Ramesh"
            },

            lastName: {
              type: "string",
              minLength: 1,
              maxLength: 50,
              example: "Patil"
            },

            email: {
              type: "string",
              format: "email",
              example: "ramesh@example.com"
            },

            phone: {
              type: "string",
              pattern: "^[6-9][0-9]{9}$",
              example: "9876543210"
            },

            password: {
              type: "string",
              format: "password",
              minLength: 8,
              maxLength: 72,
              example: "Farmer@12345"
            },

            roleId: {
              type: "string",
              format: "object-id",
              description: "MongoDB ObjectId of the FARMER or CONSUMER role.",
              example: "6a9ab48d2aed80625001ec88"
            }
          }
        },

        LoginRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: {
              type: "string",
              format: "email",
              example: "ramesh@example.com"
            },

            password: {
              type: "string",
              format: "password",
              example: "Farmer@12345"
            }
          }
        },

        User: {
          type: "object",
          properties: {
            id: {
              type: "string",
              format: "object-id"
            },

            firstName: {
              type: "string",
              example: "Ramesh"
            },

            lastName: {
              type: "string",
              example: "Patil"
            },

            email: {
              type: "string",
              format: "email"
            },

            phone: {
              type: "string"
            },

            roleId: {
              type: "string",
              format: "object-id"
            },

            role: {
              type: "string",
              example: "FARMER"
            },

            status: {
              type: "string",
              example: "ACTIVE"
            }
          }
        },

        AuthResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: true
            },

            message: {
              type: "string",
              example: "Login successful"
            },

            data: {
              type: "object",
              properties: {
                user: {
                  $ref: "#/components/schemas/User"
                },

                token: {
                  type: "string",
                  description: "JWT access token"
                }
              }
            }
          }
        }
      }
    }
  },

  apis: ["./src/app.js", "./src/routes/*.js", "./src/controllers/*.js"]
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;

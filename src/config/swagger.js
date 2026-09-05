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
        description: "Role-specific profile creation, retrieval and management"
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
      /*
      |--------------------------------------------------------------------------
      | Security
      |--------------------------------------------------------------------------
      */

      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter your JWT access token."
        }
      },

      /*
      |--------------------------------------------------------------------------
      | Reusable Schemas
      |--------------------------------------------------------------------------
      */

      schemas: {
        /*
        |--------------------------------------------------------------------------
        | AUTH SCHEMAS
        |--------------------------------------------------------------------------
        */

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
              minLength: 2,
              maxLength: 50,
              example: "Suresh"
            },

            lastName: {
              type: "string",
              minLength: 1,
              maxLength: 50,
              example: "Kulkarni"
            },

            email: {
              type: "string",
              format: "email",
              example: "suresh.fpo@example.com"
            },

            phone: {
              type: "string",
              pattern: "^[6-9][0-9]{9}$",
              example: "9876543214"
            },

            password: {
              type: "string",
              format: "password",
              minLength: 8,
              maxLength: 72,
              example: "FpoUser@123"
            },

            roleId: {
              type: "string",
              format: "object-id",
              description:
                "Role ID. Admin onboarding supports BULK_BUYER, FPO, LOGISTICS and GOVERNMENT_OFFICER.",
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
              format: "object-id",
              example: "66c8f3a1234567890abcdef1"
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
              format: "email",
              example: "ramesh@example.com"
            },

            phone: {
              type: "string",
              example: "9876543210"
            },

            roleId: {
              type: "string",
              format: "object-id",
              example: "6a9ab48d2aed80625001ec88"
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
                  description: "JWT access token",
                  example: "eyJhbGciOiJIUzI1NiIs..."
                }
              }
            }
          }
        },

        /*
        |--------------------------------------------------------------------------
        | COMMON PROFILE SCHEMAS
        |--------------------------------------------------------------------------
        */

        GeoPoint: {
          type: "object",

          required: ["type", "coordinates"],

          properties: {
            type: {
              type: "string",
              enum: ["Point"],
              example: "Point"
            },

            coordinates: {
              type: "array",
              minItems: 2,
              maxItems: 2,
              description:
                "GeoJSON coordinates in [longitude, latitude] format.",

              items: {
                type: "number"
              },

              example: [73.7, 18.6]
            }
          }
        },

        Address: {
          type: "object",

          required: ["addressLine1", "district", "state", "pincode"],

          properties: {
            addressLine1: {
              type: "string",
              maxLength: 200,
              example: "123 Main Road"
            },

            addressLine2: {
              type: "string",
              maxLength: 200,
              example: "Near Gram Panchayat"
            },

            village: {
              type: "string",
              maxLength: 100,
              example: "Wakad"
            },

            city: {
              type: "string",
              maxLength: 100,
              example: "Pune"
            },

            district: {
              type: "string",
              maxLength: 100,
              example: "Pune"
            },

            state: {
              type: "string",
              maxLength: 100,
              example: "Maharashtra"
            },

            pincode: {
              type: "string",
              pattern: "^[1-9][0-9]{5}$",
              example: "411057"
            }
          }
        },

        Verification: {
          type: "object",

          properties: {
            status: {
              type: "string",

              enum: ["PENDING", "VERIFIED", "REJECTED"],

              example: "PENDING"
            },

            verifiedBy: {
              type: "string",
              format: "object-id",
              nullable: true,
              example: "66c8f3a1234567890abcdef1"
            },

            verifiedAt: {
              type: "string",
              format: "date-time",
              nullable: true
            },

            rejectionReason: {
              type: "string",
              nullable: true,
              maxLength: 500,
              example: null
            }
          }
        },

        /*
        |--------------------------------------------------------------------------
        | FARMER PROFILE
        |--------------------------------------------------------------------------
        */

        FarmerLocation: {
          type: "object",

          required: ["district", "state", "pincode"],

          properties: {
            village: {
              type: "string",
              maxLength: 100,
              example: "Wakad"
            },

            city: {
              type: "string",
              maxLength: 100,
              example: "Pune"
            },

            district: {
              type: "string",
              maxLength: 100,
              example: "Pune"
            },

            state: {
              type: "string",
              maxLength: 100,
              example: "Maharashtra"
            },

            pincode: {
              type: "string",
              pattern: "^[1-9][0-9]{5}$",
              example: "411057"
            },

            coordinates: {
              $ref: "#/components/schemas/GeoPoint"
            }
          }
        },

        FarmerProfileCreateRequest: {
          type: "object",

          required: ["farmDetails", "location"],

          properties: {
            farmDetails: {
              type: "object",

              required: ["totalLandArea", "landUnit", "ownershipType"],

              properties: {
                totalLandArea: {
                  type: "number",
                  minimum: 0,
                  example: 4.5
                },

                landUnit: {
                  type: "string",
                  enum: ["ACRE", "HECTARE"],
                  example: "ACRE"
                },

                ownershipType: {
                  type: "string",
                  enum: ["OWNED", "LEASED", "SHARED"],
                  example: "OWNED"
                }
              }
            },

            location: {
              $ref: "#/components/schemas/FarmerLocation"
            },

            bankDetails: {
              type: "object",

              properties: {
                accountHolderName: {
                  type: "string",
                  maxLength: 100,
                  example: "Ramesh Patil"
                },

                accountNumber: {
                  type: "string",
                  example: "1234567890"
                },

                ifsc: {
                  type: "string",
                  example: "SBIN0001234"
                }
              }
            }
          }
        },

        FarmerProfile: {
          type: "object",

          properties: {
            id: {
              type: "string",
              format: "object-id",
              example: "66c8f3a1234567890abcdef2"
            },

            userId: {
              type: "string",
              format: "object-id",
              example: "66c8f3a1234567890abcdef1"
            },

            farmerCode: {
              type: "string",
              example: "FARM-000001"
            },

            farmDetails: {
              type: "object",

              properties: {
                totalLandArea: {
                  type: "number",
                  example: 4.5
                },

                landUnit: {
                  type: "string",
                  enum: ["ACRE", "HECTARE"],
                  example: "ACRE"
                },

                ownershipType: {
                  type: "string",
                  enum: ["OWNED", "LEASED", "SHARED"],
                  example: "OWNED"
                }
              }
            },

            location: {
              $ref: "#/components/schemas/FarmerLocation"
            },

            verification: {
              $ref: "#/components/schemas/Verification"
            },

            bankDetails: {
              type: "object",

              properties: {
                accountHolderName: {
                  type: "string",
                  example: "Ramesh Patil"
                },

                accountNumber: {
                  type: "string",
                  example: "1234567890"
                },

                ifsc: {
                  type: "string",
                  example: "SBIN0001234"
                }
              }
            },

            createdAt: {
              type: "string",
              format: "date-time"
            },

            updatedAt: {
              type: "string",
              format: "date-time"
            }
          }
        },

        /*
        |--------------------------------------------------------------------------
        | BUYER PROFILE
        |--------------------------------------------------------------------------
        */

        BuyerProfileCreateRequest: {
          type: "object",

          required: [
            "businessName",
            "businessType",
            "contactPerson",
            "businessAddress"
          ],

          properties: {
            businessName: {
              type: "string",
              maxLength: 150,
              example: "Fresh Foods Restaurant"
            },

            businessType: {
              type: "string",

              enum: [
                "HOTEL",
                "RESTAURANT",
                "RETAILER",
                "WHOLESALER",
                "PROCESSOR",
                "CATERER",
                "INSTITUTION",
                "OTHER"
              ],

              example: "RESTAURANT"
            },

            businessRegistrationNumber: {
              type: "string",
              maxLength: 100,
              example: "REG-123456"
            },

            gstNumber: {
              type: "string",
              example: "27ABCDE1234F1Z5"
            },

            contactPerson: {
              type: "object",

              required: ["name", "phone"],

              properties: {
                name: {
                  type: "string",
                  maxLength: 100,
                  example: "Ramesh Patil"
                },

                phone: {
                  type: "string",
                  pattern: "^[6-9][0-9]{9}$",
                  example: "9876543210"
                }
              }
            },

            businessAddress: {
              $ref: "#/components/schemas/Address"
            }
          }
        },

        BuyerProfile: {
          type: "object",

          properties: {
            id: {
              type: "string",
              format: "object-id",
              example: "66c8f3a1234567890abcdef2"
            },

            userId: {
              type: "string",
              format: "object-id",
              example: "66c8f3a1234567890abcdef1"
            },

            businessName: {
              type: "string",
              example: "Fresh Foods Restaurant"
            },

            businessType: {
              type: "string",

              enum: [
                "HOTEL",
                "RESTAURANT",
                "RETAILER",
                "WHOLESALER",
                "PROCESSOR",
                "CATERER",
                "INSTITUTION",
                "OTHER"
              ],

              example: "RESTAURANT"
            },

            businessRegistrationNumber: {
              type: "string",
              example: "REG-123456"
            },

            gstNumber: {
              type: "string",
              example: "27ABCDE1234F1Z5"
            },

            contactPerson: {
              type: "object",

              properties: {
                name: {
                  type: "string",
                  example: "Ramesh Patil"
                },

                phone: {
                  type: "string",
                  example: "9876543210"
                }
              }
            },

            businessAddress: {
              $ref: "#/components/schemas/Address"
            },

            verification: {
              $ref: "#/components/schemas/Verification"
            },

            createdAt: {
              type: "string",
              format: "date-time"
            },

            updatedAt: {
              type: "string",
              format: "date-time"
            }
          }
        },

        /*
        |--------------------------------------------------------------------------
        | FPO PROFILE
        |--------------------------------------------------------------------------
        */

        FpoProfileCreateRequest: {
          type: "object",

          required: [
            "userId",
            "organizationName",
            "registrationNumber",
            "registrationType",
            "contactDetails",
            "address"
          ],

          properties: {
            userId: {
              type: "string",
              format: "object-id",
              description:
                "Existing User ID. The target user must have the FPO role.",
              example: "66c8f3a1234567890abcdef1"
            },

            organizationName: {
              type: "string",
              maxLength: 200,
              example: "Pune Farmers Producer Organization"
            },

            registrationNumber: {
              type: "string",
              maxLength: 100,
              example: "FPO-REG-12345"
            },

            registrationType: {
              type: "string",
              maxLength: 50,
              example: "FPO"
            },

            contactDetails: {
              type: "object",

              required: ["phone", "email"],

              properties: {
                phone: {
                  type: "string",
                  pattern: "^[6-9][0-9]{9}$",
                  example: "9876543210"
                },

                email: {
                  type: "string",
                  format: "email",
                  example: "fpo@example.com"
                }
              }
            },

            address: {
              type: "object",

              required: ["district", "state", "pincode"],

              properties: {
                village: {
                  type: "string",
                  maxLength: 100,
                  example: "Wakad"
                },

                district: {
                  type: "string",
                  maxLength: 100,
                  example: "Pune"
                },

                state: {
                  type: "string",
                  maxLength: 100,
                  example: "Maharashtra"
                },

                pincode: {
                  type: "string",
                  pattern: "^[1-9][0-9]{5}$",
                  example: "411057"
                }
              }
            }
          }
        },

        FpoProfile: {
          type: "object",

          properties: {
            id: {
              type: "string",
              format: "object-id",
              example: "66c8f3a1234567890abcdef2"
            },

            userId: {
              type: "string",
              format: "object-id",
              example: "66c8f3a1234567890abcdef1"
            },

            fpoCode: {
              type: "string",
              example: "FPO-000001"
            },

            organizationName: {
              type: "string",
              example: "Pune Farmers Producer Organization"
            },

            registrationNumber: {
              type: "string",
              example: "FPO-REG-12345"
            },

            registrationType: {
              type: "string",
              example: "FPO"
            },

            contactDetails: {
              type: "object",

              properties: {
                phone: {
                  type: "string",
                  example: "9876543210"
                },

                email: {
                  type: "string",
                  format: "email",
                  example: "fpo@example.com"
                }
              }
            },

            address: {
              type: "object",

              properties: {
                village: {
                  type: "string",
                  example: "Wakad"
                },

                district: {
                  type: "string",
                  example: "Pune"
                },

                state: {
                  type: "string",
                  example: "Maharashtra"
                },

                pincode: {
                  type: "string",
                  example: "411057"
                }
              }
            },

            verification: {
              $ref: "#/components/schemas/Verification"
            },

            createdAt: {
              type: "string",
              format: "date-time"
            },

            updatedAt: {
              type: "string",
              format: "date-time"
            }
          }
        },

        /*
        |--------------------------------------------------------------------------
        | LOGISTICS PROFILE
        |--------------------------------------------------------------------------
        */

        LogisticsProfileCreateRequest: {
          type: "object",

          required: [
            "userId",
            "partnerType",
            "companyName",
            "contactNumber",
            "serviceAreas"
          ],

          properties: {
            userId: {
              type: "string",
              format: "object-id",
              description:
                "Existing User ID. The target user must have the LOGISTICS role.",
              example: "66c8f3a1234567890abcdef1"
            },

            partnerType: {
              type: "string",
              maxLength: 50,
              example: "LOGISTICS_PARTNER"
            },

            companyName: {
              type: "string",
              maxLength: 150,
              example: "ABC Logistics"
            },

            contactNumber: {
              type: "string",
              pattern: "^[6-9][0-9]{9}$",
              example: "9876543210"
            },

            serviceAreas: {
              type: "array",
              minItems: 1,

              items: {
                type: "string"
              },

              example: ["Pune", "Mumbai", "Nashik"]
            }
          }
        },

        LogisticsProfile: {
          type: "object",

          properties: {
            id: {
              type: "string",
              format: "object-id",
              example: "66c8f3a1234567890abcdef2"
            },

            userId: {
              type: "string",
              format: "object-id",
              example: "66c8f3a1234567890abcdef1"
            },

            partnerType: {
              type: "string",
              example: "LOGISTICS_PARTNER"
            },

            companyName: {
              type: "string",
              example: "ABC Logistics"
            },

            contactNumber: {
              type: "string",
              example: "9876543210"
            },

            serviceAreas: {
              type: "array",

              items: {
                type: "string"
              },

              example: ["Pune", "Mumbai", "Nashik"]
            },

            verification: {
              $ref: "#/components/schemas/Verification"
            },

            createdAt: {
              type: "string",
              format: "date-time"
            },

            updatedAt: {
              type: "string",
              format: "date-time"
            }
          }
        },

        /*
        |--------------------------------------------------------------------------
        | GOVERNMENT PROFILE
        |--------------------------------------------------------------------------
        */

        GovernmentProfileCreateRequest: {
          type: "object",

          required: ["userId", "department", "designation", "jurisdiction"],

          properties: {
            userId: {
              type: "string",
              format: "object-id",
              description:
                "Existing User ID. The target user must have the GOVERNMENT_OFFICER role.",
              example: "66c8f3a1234567890abcdef1"
            },

            department: {
              type: "string",
              maxLength: 150,
              example: "Agriculture Department"
            },

            designation: {
              type: "string",
              maxLength: 150,
              example: "District Agriculture Officer"
            },

            jurisdiction: {
              type: "object",

              required: ["state", "district"],

              properties: {
                state: {
                  type: "string",
                  maxLength: 100,
                  example: "Maharashtra"
                },

                district: {
                  type: "string",
                  maxLength: 100,
                  example: "Pune"
                }
              }
            }
          }
        },

        GovernmentProfile: {
          type: "object",

          properties: {
            id: {
              type: "string",
              format: "object-id",
              example: "66c8f3a1234567890abcdef2"
            },

            userId: {
              type: "string",
              format: "object-id",
              example: "66c8f3a1234567890abcdef1"
            },

            department: {
              type: "string",
              example: "Agriculture Department"
            },

            designation: {
              type: "string",
              example: "District Agriculture Officer"
            },

            officerCode: {
              type: "string",
              example: "OFF-000001"
            },

            jurisdiction: {
              type: "object",

              properties: {
                state: {
                  type: "string",
                  example: "Maharashtra"
                },

                district: {
                  type: "string",
                  example: "Pune"
                }
              }
            },

            verification: {
              $ref: "#/components/schemas/Verification"
            },

            createdAt: {
              type: "string",
              format: "date-time"
            },

            updatedAt: {
              type: "string",
              format: "date-time"
            }
          }
        },

        /*
        |--------------------------------------------------------------------------
        | GENERIC PROFILE RESPONSE
        |--------------------------------------------------------------------------
        */

        ProfileResponse: {
          type: "object",

          properties: {
            success: {
              type: "boolean",
              example: true
            },

            message: {
              type: "string",
              example: "Profile retrieved successfully"
            },

            data: {
              type: "object"
            }
          }
        }
      }
    }
  },

  /*
  |--------------------------------------------------------------------------
  | Swagger Documentation Sources
  |--------------------------------------------------------------------------
  */

  apis: ["./src/app.js", "./src/routes/*.js", "./src/controllers/*.js"]
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;

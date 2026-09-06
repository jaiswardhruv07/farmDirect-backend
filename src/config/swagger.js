const swaggerJsdoc = require("swagger-jsdoc");

const env = require("./env");

const options = {
  definition: {
    openapi: "3.0.3",

    info: {
      title: "FarmDirect API",
      version: "1.8.0",
      description:
        "API documentation for the FarmDirect agricultural digital marketplace."
    },

    servers: [
      {
        url: `http://34.180.55.18`,
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
        description: "AI and machine learning related operations"
      },
      {
        name: "Forecast",
        description: "Demand forecasting and forecast retrieval operations"
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
        | PRODUCT SCHEMAS
        |--------------------------------------------------------------------------
        */

        ProductApproval: {
          type: "object",

          description: "Administrative approval information for a product.",

          properties: {
            status: {
              type: "string",
              enum: ["PENDING", "APPROVED", "REJECTED"],
              example: "PENDING"
            },

            reviewedBy: {
              type: "string",
              format: "object-id",
              nullable: true,
              description: "User ID of the Admin who reviewed the product.",
              example: null
            },

            reviewedAt: {
              type: "string",
              format: "date-time",
              nullable: true,
              example: null
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
        | PRODUCT CREATE
        |--------------------------------------------------------------------------
        */

        ProductCreateRequest: {
          type: "object",

          required: [
            "name",
            "category",
            "unit",
            "pricePerUnit",
            "minimumOrderQuantity",
            "qualityGrade"
          ],

          description:
            "Product submitted by a Farmer or FPO. Seller identity and approval status are assigned by the backend.",

          properties: {
            name: {
              type: "string",
              minLength: 2,
              maxLength: 150,
              example: "Fresh Tomatoes"
            },

            category: {
              type: "string",
              enum: ["VEGETABLE", "FRUIT", "GRAIN", "PULSE", "SPICE", "OTHER"],
              example: "VEGETABLE"
            },

            variety: {
              type: "string",
              maxLength: 100,
              nullable: true,
              example: "Hybrid Tomato"
            },

            description: {
              type: "string",
              maxLength: 1000,
              nullable: true,
              example: "Fresh farm-grown hybrid tomatoes."
            },

            unit: {
              type: "string",
              enum: ["KG", "QUINTAL", "TON", "PIECE"],
              example: "KG"
            },

            pricePerUnit: {
              type: "number",
              minimum: 0,
              example: 35
            },

            minimumOrderQuantity: {
              type: "number",
              exclusiveMinimum: 0,
              example: 5
            },

            images: {
              type: "array",
              maxItems: 10,

              items: {
                type: "string",
                format: "uri"
              },

              example: ["https://example.com/tomato.jpg"]
            },

            qualityGrade: {
              type: "string",
              enum: ["A", "B", "C"],
              example: "A"
            },

            organic: {
              type: "boolean",
              default: false,
              example: true
            },

            harvestDate: {
              type: "string",
              format: "date",
              nullable: true,
              example: "2026-09-01"
            }
          }
        },

        /*
        |--------------------------------------------------------------------------
        | PRODUCT UPDATE
        |--------------------------------------------------------------------------
        */

        ProductUpdateRequest: {
          type: "object",

          description:
            "Fields that a Farmer or FPO can update for their own product. Seller and approval fields cannot be modified by the seller.",

          properties: {
            name: {
              type: "string",
              minLength: 2,
              maxLength: 150,
              example: "Fresh Hybrid Tomatoes"
            },

            category: {
              type: "string",
              enum: ["VEGETABLE", "FRUIT", "GRAIN", "PULSE", "SPICE", "OTHER"],
              example: "VEGETABLE"
            },

            variety: {
              type: "string",
              maxLength: 100,
              nullable: true,
              example: "Hybrid"
            },

            description: {
              type: "string",
              maxLength: 1000,
              nullable: true,
              example: "Freshly harvested farm-grown tomatoes."
            },

            unit: {
              type: "string",
              enum: ["KG", "QUINTAL", "TON", "PIECE"],
              example: "KG"
            },

            pricePerUnit: {
              type: "number",
              minimum: 0,
              example: 38
            },

            minimumOrderQuantity: {
              type: "number",
              exclusiveMinimum: 0,
              example: 5
            },

            images: {
              type: "array",
              maxItems: 10,

              items: {
                type: "string",
                format: "uri"
              },

              example: ["https://example.com/tomato-updated.jpg"]
            },

            qualityGrade: {
              type: "string",
              enum: ["A", "B", "C"],
              example: "A"
            },

            organic: {
              type: "boolean",
              example: true
            },

            harvestDate: {
              type: "string",
              format: "date",
              nullable: true,
              example: "2026-09-02"
            }
          }
        },

        /*
        |--------------------------------------------------------------------------
        | ADMIN PRODUCT CREATE
        |--------------------------------------------------------------------------
        */

        AdminProductCreateRequest: {
          type: "object",

          required: [
            "sellerType",
            "sellerId",
            "name",
            "category",
            "unit",
            "pricePerUnit",
            "minimumOrderQuantity",
            "qualityGrade"
          ],

          description:
            "Admin creates a product on behalf of an existing Farmer or FPO. The product is automatically approved and active.",

          properties: {
            sellerType: {
              type: "string",
              enum: ["FARMER", "FPO"],
              description: "Type of the actual produce seller.",
              example: "FARMER"
            },

            sellerId: {
              type: "string",
              format: "object-id",
              description:
                "FarmerProfile or FpoProfile ID depending on sellerType.",
              example: "66c8f3a1234567890abcdef2"
            },

            name: {
              type: "string",
              minLength: 2,
              maxLength: 150,
              example: "Fresh Tomatoes"
            },

            category: {
              type: "string",
              enum: ["VEGETABLE", "FRUIT", "GRAIN", "PULSE", "SPICE", "OTHER"],
              example: "VEGETABLE"
            },

            variety: {
              type: "string",
              maxLength: 100,
              nullable: true,
              example: "Hybrid Tomato"
            },

            description: {
              type: "string",
              maxLength: 1000,
              nullable: true,
              example: "Fresh farm-grown hybrid tomatoes."
            },

            unit: {
              type: "string",
              enum: ["KG", "QUINTAL", "TON", "PIECE"],
              example: "KG"
            },

            pricePerUnit: {
              type: "number",
              minimum: 0,
              example: 35
            },

            minimumOrderQuantity: {
              type: "number",
              exclusiveMinimum: 0,
              example: 5
            },

            images: {
              type: "array",
              maxItems: 10,

              items: {
                type: "string",
                format: "uri"
              },

              example: ["https://example.com/tomato.jpg"]
            },

            qualityGrade: {
              type: "string",
              enum: ["A", "B", "C"],
              example: "A"
            },

            organic: {
              type: "boolean",
              default: false,
              example: true
            },

            harvestDate: {
              type: "string",
              format: "date",
              nullable: true,
              example: "2026-09-01"
            }
          }
        },

        /*
        |--------------------------------------------------------------------------
        | ADMIN PRODUCT UPDATE
        |--------------------------------------------------------------------------
        */

        AdminProductUpdateRequest: {
          type: "object",

          description:
            "Admin can update product details, reassign the actual seller, or change the operational status.",

          properties: {
            sellerType: {
              type: "string",
              enum: ["FARMER", "FPO"],
              example: "FPO"
            },

            sellerId: {
              type: "string",
              format: "object-id",
              description:
                "FarmerProfile or FpoProfile ID depending on sellerType.",
              example: "66c8f3a1234567890abcdef3"
            },

            name: {
              type: "string",
              minLength: 2,
              maxLength: 150,
              example: "Fresh Tomatoes"
            },

            category: {
              type: "string",
              enum: ["VEGETABLE", "FRUIT", "GRAIN", "PULSE", "SPICE", "OTHER"],
              example: "VEGETABLE"
            },

            variety: {
              type: "string",
              maxLength: 100,
              nullable: true,
              example: "Hybrid"
            },

            description: {
              type: "string",
              maxLength: 1000,
              nullable: true,
              example: "Fresh farm-grown tomatoes."
            },

            unit: {
              type: "string",
              enum: ["KG", "QUINTAL", "TON", "PIECE"],
              example: "KG"
            },

            pricePerUnit: {
              type: "number",
              minimum: 0,
              example: 40
            },

            minimumOrderQuantity: {
              type: "number",
              exclusiveMinimum: 0,
              example: 10
            },

            images: {
              type: "array",
              maxItems: 10,

              items: {
                type: "string",
                format: "uri"
              }
            },

            qualityGrade: {
              type: "string",
              enum: ["A", "B", "C"],
              example: "A"
            },

            organic: {
              type: "boolean",
              example: true
            },

            harvestDate: {
              type: "string",
              format: "date",
              nullable: true,
              example: "2026-09-02"
            },

            status: {
              type: "string",
              enum: ["ACTIVE", "INACTIVE"],
              description:
                "Operational marketplace status. Approval fields cannot be modified directly.",
              example: "INACTIVE"
            }
          }
        },

        /*
        |--------------------------------------------------------------------------
        | PRODUCT REJECTION
        |--------------------------------------------------------------------------
        */

        ProductRejectRequest: {
          type: "object",

          required: ["rejectionReason"],

          properties: {
            rejectionReason: {
              type: "string",
              minLength: 1,
              maxLength: 500,
              example:
                "Product information is incomplete. Please provide the correct quality grade and harvest details."
            }
          }
        },

        /*
        |--------------------------------------------------------------------------
        | PRODUCT RESPONSE
        |--------------------------------------------------------------------------
        */

        Product: {
          type: "object",

          properties: {
            id: {
              type: "string",
              format: "object-id",
              example: "66c8f3a1234567890abcdef4"
            },

            sellerType: {
              type: "string",
              enum: ["FARMER", "FPO"],
              example: "FARMER"
            },

            sellerId: {
              type: "string",
              format: "object-id",
              description: "FarmerProfile or FpoProfile ID.",
              example: "66c8f3a1234567890abcdef2"
            },

            name: {
              type: "string",
              example: "Fresh Tomatoes"
            },

            category: {
              type: "string",
              enum: ["VEGETABLE", "FRUIT", "GRAIN", "PULSE", "SPICE", "OTHER"],
              example: "VEGETABLE"
            },

            variety: {
              type: "string",
              nullable: true,
              example: "Hybrid Tomato"
            },

            description: {
              type: "string",
              nullable: true,
              example: "Fresh farm-grown hybrid tomatoes."
            },

            unit: {
              type: "string",
              enum: ["KG", "QUINTAL", "TON", "PIECE"],
              example: "KG"
            },

            pricePerUnit: {
              type: "number",
              format: "double",
              example: 35
            },

            minimumOrderQuantity: {
              type: "number",
              example: 5
            },

            images: {
              type: "array",

              items: {
                type: "string",
                format: "uri"
              },

              example: ["https://example.com/tomato.jpg"]
            },

            qualityGrade: {
              type: "string",
              enum: ["A", "B", "C"],
              example: "A"
            },

            organic: {
              type: "boolean",
              example: true
            },

            harvestDate: {
              type: "string",
              format: "date-time",
              nullable: true
            },

            status: {
              type: "string",
              enum: ["PENDING_APPROVAL", "ACTIVE", "REJECTED", "INACTIVE"],
              example: "ACTIVE"
            },

            approval: {
              $ref: "#/components/schemas/ProductApproval"
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
        },
        /*
        |--------------------------------------------------------------------------
        | ORDER SCHEMAS
        |--------------------------------------------------------------------------
        */

        CreateOrderItemRequest: {
          type: "object",

          required: ["productId", "quantity"],

          properties: {
            productId: {
              type: "string",
              format: "object-id",
              description: "MongoDB ObjectId of the product.",
              example: "64f123456789abcdef123456"
            },

            quantity: {
              type: "number",
              format: "double",
              exclusiveMinimum: 0,
              description: "Quantity to purchase.",
              example: 20
            }
          }
        },

        OrderDeliveryAddress: {
          type: "object",

          required: ["addressLine1", "district", "state", "pincode"],

          properties: {
            addressLine1: {
              type: "string",
              maxLength: 200,
              example: "Village Road, House No. 12"
            },

            addressLine2: {
              type: "string",
              nullable: true,
              maxLength: 200,
              example: "Near Primary School"
            },

            village: {
              type: "string",
              nullable: true,
              maxLength: 100,
              example: "Wakad"
            },

            city: {
              type: "string",
              nullable: true,
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
              example: "411001"
            }
          }
        },

        CreateOrderRequest: {
          type: "object",

          required: ["items", "deliveryAddress"],

          description:
            "Create an order using active marketplace products. Buyer identity, seller information, prices, totals and status are controlled by the backend.",

          properties: {
            items: {
              type: "array",
              minItems: 1,

              items: {
                $ref: "#/components/schemas/CreateOrderItemRequest"
              }
            },

            deliveryAddress: {
              $ref: "#/components/schemas/OrderDeliveryAddress"
            }
          }
        },

        CancelOrderRequest: {
          type: "object",

          properties: {
            reason: {
              type: "string",
              nullable: true,
              maxLength: 500,
              example: "Ordered by mistake"
            }
          }
        },

        AdminOrderStatusUpdateRequest: {
          type: "object",

          required: ["status"],

          description:
            "Update an order to the next valid operational status. The backend validates the status transition.",

          properties: {
            status: {
              type: "string",

              enum: [
                "CONFIRMED",
                "PROCESSING",
                "READY_FOR_DISPATCH",
                "SHIPPED",
                "DELIVERED",
                "FAILED"
              ],

              example: "CONFIRMED"
            }
          }
        },

        OrderItem: {
          type: "object",

          required: [
            "productId",
            "sellerType",
            "sellerId",
            "productName",
            "unit",
            "quantity",
            "pricePerUnit",
            "subtotal"
          ],

          properties: {
            productId: {
              type: "string",
              format: "object-id",
              example: "64f123456789abcdef123456"
            },

            sellerType: {
              type: "string",
              enum: ["FARMER", "FPO"],
              example: "FARMER"
            },

            sellerId: {
              type: "string",
              format: "object-id",
              description:
                "FarmerProfile or FpoProfile ID depending on sellerType.",
              example: "64f987654321abcdef987654"
            },

            productName: {
              type: "string",
              example: "Fresh Tomatoes"
            },

            unit: {
              type: "string",
              enum: ["KG", "QUINTAL", "TON", "PIECE"],
              example: "KG"
            },

            quantity: {
              type: "number",
              format: "double",
              example: 20
            },

            pricePerUnit: {
              type: "number",
              format: "double",
              example: 35.5
            },

            subtotal: {
              type: "number",
              format: "double",
              example: 710
            }
          }
        },

        OrderCancellation: {
          type: "object",
          nullable: true,

          properties: {
            cancelledBy: {
              type: "string",
              format: "object-id",
              nullable: true,
              example: "64f111111111111111111111"
            },

            cancelledAt: {
              type: "string",
              format: "date-time",
              nullable: true,
              example: "2026-09-05T10:30:00.000Z"
            },

            reason: {
              type: "string",
              nullable: true,
              maxLength: 500,
              example: "Ordered by mistake"
            }
          }
        },

        Order: {
          type: "object",

          properties: {
            _id: {
              type: "string",
              format: "object-id",
              example: "64fa123456789abcdef12345"
            },

            orderNumber: {
              type: "string",
              description: "Human-readable unique order number.",
              example: "FD-20260905-A1B2C3"
            },

            buyerId: {
              type: "string",
              format: "object-id",
              description: "ID of the user who placed the order.",
              example: "64fb123456789abcdef12345"
            },

            buyerType: {
              type: "string",
              enum: ["CONSUMER", "BULK_BUYER"],
              example: "CONSUMER"
            },

            items: {
              type: "array",
              minItems: 1,

              items: {
                $ref: "#/components/schemas/OrderItem"
              }
            },

            deliveryAddress: {
              $ref: "#/components/schemas/OrderDeliveryAddress"
            },

            totalAmount: {
              type: "number",
              format: "double",
              minimum: 0,
              example: 1420
            },

            currency: {
              type: "string",
              enum: ["INR"],
              example: "INR"
            },

            status: {
              type: "string",

              enum: [
                "PENDING",
                "CONFIRMED",
                "PROCESSING",
                "READY_FOR_DISPATCH",
                "SHIPPED",
                "DELIVERED",
                "CANCELLED",
                "FAILED"
              ],

              example: "PENDING"
            },

            paymentStatus: {
              type: "string",

              enum: [
                "PENDING",
                "PAID",
                "FAILED",
                "REFUNDED",
                "PARTIALLY_REFUNDED"
              ],

              example: "PENDING"
            },

            cancellation: {
              $ref: "#/components/schemas/OrderCancellation"
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
        | INVENTORY SCHEMAS
        |--------------------------------------------------------------------------
        */

        InventoryCreateRequest: {
          type: "object",

          required: ["productId", "totalStock"],

          description:
            "Create inventory for an active product owned by the authenticated Farmer or FPO. Seller identity, unit, reserved stock and lastUpdatedBy are assigned by the backend.",

          properties: {
            productId: {
              type: "string",
              format: "object-id",
              description: "Product ID for which inventory is being created.",
              example: "66c8f3a1234567890abcdef4"
            },

            totalStock: {
              type: "number",
              minimum: 0,
              example: 500
            },

            lowStockThreshold: {
              type: "number",
              minimum: 0,
              default: 0,
              example: 50
            }
          }
        },

        InventoryUpdateRequest: {
          type: "object",

          minProperties: 1,

          description:
            "Update inventory configuration. Reserved stock cannot be modified directly.",

          properties: {
            totalStock: {
              type: "number",
              minimum: 0,
              example: 700
            },

            lowStockThreshold: {
              type: "number",
              minimum: 0,
              example: 100
            }
          }
        },

        StockAdjustmentRequest: {
          type: "object",

          required: ["operation", "quantity"],

          description:
            "Manually add or remove physical stock. Reserved stock is not modified by this operation.",

          properties: {
            operation: {
              type: "string",
              enum: ["ADD", "REMOVE"],
              example: "ADD"
            },

            quantity: {
              type: "number",
              exclusiveMinimum: 0,
              example: 100
            }
          }
        },

        AdminInventoryCreateRequest: {
          type: "object",

          required: ["productId", "totalStock"],

          description:
            "Admin creates inventory for an active Farmer or FPO product.",

          properties: {
            productId: {
              type: "string",
              format: "object-id",
              description: "Product ID belonging to a Farmer or FPO.",
              example: "66c8f3a1234567890abcdef4"
            },

            totalStock: {
              type: "number",
              minimum: 0,
              example: 1000
            },

            lowStockThreshold: {
              type: "number",
              minimum: 0,
              default: 0,
              example: 100
            }
          }
        },

        AdminInventoryUpdateRequest: {
          type: "object",

          minProperties: 1,

          description:
            "Admin can update total stock or the low-stock threshold. Reserved stock cannot be modified directly.",

          properties: {
            totalStock: {
              type: "number",
              minimum: 0,
              example: 900
            },

            lowStockThreshold: {
              type: "number",
              minimum: 0,
              example: 100
            }
          }
        },

        AdminStockAdjustmentRequest: {
          type: "object",

          required: ["operation", "quantity"],

          description:
            "Admin can manually add or remove physical stock. Reserved stock is not modified by this operation.",

          properties: {
            operation: {
              type: "string",
              enum: ["ADD", "REMOVE"],
              example: "REMOVE"
            },

            quantity: {
              type: "number",
              exclusiveMinimum: 0,
              example: 50
            }
          }
        },

        Inventory: {
          type: "object",

          properties: {
            id: {
              type: "string",
              format: "object-id",
              example: "66c8f3a1234567890abcdef5"
            },

            productId: {
              type: "string",
              format: "object-id",
              description: "Associated Product ID.",
              example: "66c8f3a1234567890abcdef4"
            },

            unit: {
              type: "string",
              enum: ["KG", "QUINTAL", "TON", "PIECE"],
              description:
                "Inventory unit inherited from the associated product.",
              example: "KG"
            },

            totalStock: {
              type: "number",
              minimum: 0,
              example: 500
            },

            reservedStock: {
              type: "number",
              minimum: 0,
              example: 100
            },

            availableStock: {
              type: "number",
              minimum: 0,
              readOnly: true,
              description: "Calculated as totalStock minus reservedStock.",
              example: 400
            },

            lowStockThreshold: {
              type: "number",
              minimum: 0,
              example: 50
            },

            isLowStock: {
              type: "boolean",
              readOnly: true,
              description:
                "Calculated as availableStock less than or equal to lowStockThreshold.",
              example: false
            },

            lastUpdatedBy: {
              type: "string",
              format: "object-id",
              description:
                "User ID that performed the latest inventory update.",
              example: "66c8f3a1234567890abcdef1"
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
| DASHBOARD SCHEMAS
|--------------------------------------------------------------------------
*/

        DashboardRecentOrder: {
          type: "object",

          properties: {
            orderNumber: {
              type: "string",
              example: "FD-20260905-000001"
            },

            buyerId: {
              type: "string",
              format: "object-id",
              example: "64fb123456789abcdef12345"
            },

            buyerType: {
              type: "string",
              enum: ["CONSUMER", "BULK_BUYER"],
              example: "CONSUMER"
            },

            itemCount: {
              type: "integer",
              minimum: 0,
              example: 2
            },

            totalAmount: {
              type: "number",
              format: "double",
              minimum: 0,
              example: 1420
            },

            status: {
              type: "string",
              enum: [
                "PENDING",
                "CONFIRMED",
                "PROCESSING",
                "READY_FOR_DISPATCH",
                "SHIPPED",
                "DELIVERED",
                "CANCELLED",
                "FAILED"
              ],
              example: "PROCESSING"
            },

            createdAt: {
              type: "string",
              format: "date-time"
            }
          }
        },

        DashboardOrderStatusCounts: {
          type: "object",

          properties: {
            pending: {
              type: "integer",
              example: 3
            },

            confirmed: {
              type: "integer",
              example: 2
            },

            processing: {
              type: "integer",
              example: 1
            },

            readyForDispatch: {
              type: "integer",
              example: 1
            },

            shipped: {
              type: "integer",
              example: 2
            },

            delivered: {
              type: "integer",
              example: 15
            },

            cancelled: {
              type: "integer",
              example: 1
            },

            failed: {
              type: "integer",
              example: 0
            }
          }
        },

        DashboardInventorySummary: {
          type: "object",

          properties: {
            totalItems: {
              type: "integer",
              example: 12
            },

            availableStock: {
              type: "number",
              format: "double",
              minimum: 0,
              example: 1250
            },

            lowStockItems: {
              type: "integer",
              example: 3
            }
          }
        },

        DashboardProductsSummary: {
          type: "object",

          properties: {
            active: {
              type: "integer",
              example: 15
            },

            pendingApproval: {
              type: "integer",
              example: 3
            },

            rejected: {
              type: "integer",
              example: 1
            },

            inactive: {
              type: "integer",
              example: 2
            }
          }
        },

        DashboardSales: {
          type: "object",

          properties: {
            totalSales: {
              type: "number",
              format: "double",
              minimum: 0,
              example: 125000
            }
          }
        },

        DashboardConsumer: {
          type: "object",

          properties: {
            summary: {
              type: "object",

              properties: {
                totalOrders: {
                  type: "integer",
                  example: 20
                },

                activeOrders: {
                  type: "integer",
                  example: 3
                },

                completedOrders: {
                  type: "integer",
                  example: 15
                },

                totalSpent: {
                  type: "number",
                  format: "double",
                  example: 45250
                }
              }
            },

            orders: {
              $ref: "#/components/schemas/DashboardOrderStatusCounts"
            },

            recentOrders: {
              type: "array",

              items: {
                $ref: "#/components/schemas/DashboardRecentOrder"
              }
            }
          }
        },

        DashboardBulkBuyer: {
          type: "object",

          properties: {
            summary: {
              type: "object",

              properties: {
                totalOrders: {
                  type: "integer",
                  example: 35
                },

                activeOrders: {
                  type: "integer",
                  example: 7
                },

                completedOrders: {
                  type: "integer",
                  example: 25
                },

                pendingOrders: {
                  type: "integer",
                  example: 3
                },

                totalProcurement: {
                  type: "number",
                  format: "double",
                  example: 12500
                },

                totalSpending: {
                  type: "number",
                  format: "double",
                  example: 850000
                }
              }
            },

            orders: {
              $ref: "#/components/schemas/DashboardOrderStatusCounts"
            },

            recentOrders: {
              type: "array",

              items: {
                $ref: "#/components/schemas/DashboardRecentOrder"
              }
            },

            procurement: {
              type: "object",

              properties: {
                totalQuantity: {
                  type: "number",
                  format: "double",
                  example: 12500
                },

                totalAmount: {
                  type: "number",
                  format: "double",
                  example: 850000
                }
              }
            }
          }
        },

        DashboardFarmer: {
          type: "object",

          properties: {
            summary: {
              type: "object",

              properties: {
                totalProducts: {
                  type: "integer",
                  example: 12
                },

                activeProducts: {
                  type: "integer",
                  example: 8
                },

                pendingProducts: {
                  type: "integer",
                  example: 2
                },

                availableStock: {
                  type: "number",
                  format: "double",
                  example: 1500
                },

                lowStockItems: {
                  type: "integer",
                  example: 2
                },

                pendingOrders: {
                  type: "integer",
                  example: 3
                },

                processingOrders: {
                  type: "integer",
                  example: 2
                },

                completedOrders: {
                  type: "integer",
                  example: 25
                },

                totalSales: {
                  type: "number",
                  format: "double",
                  example: 175000
                }
              }
            },

            products: {
              $ref: "#/components/schemas/DashboardProductsSummary"
            },

            inventory: {
              $ref: "#/components/schemas/DashboardInventorySummary"
            },

            orders: {
              $ref: "#/components/schemas/DashboardOrderStatusCounts"
            },

            recentOrders: {
              type: "array",

              items: {
                $ref: "#/components/schemas/DashboardRecentOrder"
              }
            },

            sales: {
              $ref: "#/components/schemas/DashboardSales"
            }
          }
        },

        DashboardFpo: {
          type: "object",

          properties: {
            summary: {
              type: "object",

              properties: {
                totalMembers: {
                  type: "integer",
                  example: 120
                },

                activeMembers: {
                  type: "integer",
                  example: 120
                },

                totalProducts: {
                  type: "integer",
                  example: 30
                },

                activeProducts: {
                  type: "integer",
                  example: 24
                },

                availableStock: {
                  type: "number",
                  format: "double",
                  example: 8500
                },

                lowStockItems: {
                  type: "integer",
                  example: 4
                },

                totalOrders: {
                  type: "integer",
                  example: 150
                },

                completedOrders: {
                  type: "integer",
                  example: 120
                },

                totalSales: {
                  type: "number",
                  format: "double",
                  example: 1250000
                }
              }
            },

            members: {
              type: "object",

              properties: {
                total: {
                  type: "integer",
                  example: 120
                },

                active: {
                  type: "integer",
                  example: 120
                }
              }
            },

            products: {
              type: "object",

              properties: {
                active: {
                  type: "integer",
                  example: 24
                },

                pendingApproval: {
                  type: "integer",
                  example: 4
                },

                inactive: {
                  type: "integer",
                  example: 2
                }
              }
            },

            inventory: {
              $ref: "#/components/schemas/DashboardInventorySummary"
            },

            orders: {
              $ref: "#/components/schemas/DashboardOrderStatusCounts"
            },

            recentOrders: {
              type: "array",

              items: {
                $ref: "#/components/schemas/DashboardRecentOrder"
              }
            },

            sales: {
              $ref: "#/components/schemas/DashboardSales"
            }
          }
        },

        DashboardGovernment: {
          type: "object",

          properties: {
            summary: {
              type: "object",

              properties: {
                totalFarmers: {
                  type: "integer",
                  example: 1500
                },

                totalFpos: {
                  type: "integer",
                  example: 45
                },

                totalProducts: {
                  type: "integer",
                  example: 3500
                },

                activeProducts: {
                  type: "integer",
                  example: 2900
                },

                totalOrders: {
                  type: "integer",
                  example: 12000
                },

                completedOrders: {
                  type: "integer",
                  example: 10500
                },

                marketplaceVolume: {
                  type: "number",
                  format: "double",
                  example: 45000000
                }
              }
            },

            farmers: {
              type: "object",

              properties: {
                total: {
                  type: "integer",
                  example: 1500
                },

                verified: {
                  type: "integer",
                  example: 1350
                }
              }
            },

            fpos: {
              type: "object",

              properties: {
                total: {
                  type: "integer",
                  example: 45
                },

                verified: {
                  type: "integer",
                  example: 42
                }
              }
            },

            marketplace: {
              type: "object",

              properties: {
                totalProducts: {
                  type: "integer",
                  example: 3500
                },

                activeProducts: {
                  type: "integer",
                  example: 2900
                },

                totalOrders: {
                  type: "integer",
                  example: 12000
                },

                completedOrders: {
                  type: "integer",
                  example: 10500
                },

                totalTransactionValue: {
                  type: "number",
                  format: "double",
                  example: 45000000
                }
              }
            },

            demand: {
              type: "object",

              properties: {
                available: {
                  type: "boolean",
                  example: false
                },

                forecasts: {
                  type: "array",

                  items: {
                    type: "object"
                  },

                  example: []
                }
              }
            }
          }
        },

        DashboardAdmin: {
          type: "object",

          properties: {
            summary: {
              type: "object",

              properties: {
                totalUsers: {
                  type: "integer",
                  example: 2500
                },

                totalFarmers: {
                  type: "integer",
                  example: 1500
                },

                totalConsumers: {
                  type: "integer",
                  example: 700
                },

                totalBulkBuyers: {
                  type: "integer",
                  example: 120
                },

                totalFpos: {
                  type: "integer",
                  example: 45
                },

                totalLogisticsPartners: {
                  type: "integer",
                  example: 80
                },

                totalGovernmentOfficers: {
                  type: "integer",
                  example: 55
                },

                totalProducts: {
                  type: "integer",
                  example: 3500
                },

                activeProducts: {
                  type: "integer",
                  example: 2900
                },

                pendingProductApprovals: {
                  type: "integer",
                  example: 150
                },

                totalOrders: {
                  type: "integer",
                  example: 12000
                },

                activeOrders: {
                  type: "integer",
                  example: 900
                },

                completedOrders: {
                  type: "integer",
                  example: 10500
                },

                totalSales: {
                  type: "number",
                  format: "double",
                  example: 45000000
                },

                activeShipments: {
                  type: "integer",
                  example: 250
                }
              }
            },

            products: {
              type: "object",

              properties: {
                pendingApproval: {
                  type: "integer",
                  example: 150
                },

                active: {
                  type: "integer",
                  example: 2900
                },

                inactive: {
                  type: "integer",
                  example: 300
                }
              }
            },

            orders: {
              $ref: "#/components/schemas/DashboardOrderStatusCounts"
            },

            inventory: {
              type: "object",

              properties: {
                lowStockItems: {
                  type: "integer",
                  example: 35
                }
              }
            },

            recentOrders: {
              type: "array",

              items: {
                $ref: "#/components/schemas/DashboardRecentOrder"
              }
            },

            logistics: {
              type: "object",

              properties: {
                pendingJobs: {
                  type: "integer",
                  example: 30
                },

                activeShipments: {
                  type: "integer",
                  example: 250
                },

                deliveredShipments: {
                  type: "integer",
                  example: 1500
                }
              }
            }
          }
        },

        DashboardResponse: {
          type: "object",

          required: ["success", "data"],

          properties: {
            success: {
              type: "boolean",
              example: true
            },

            data: {
              type: "object",

              required: ["role", "dashboard"],

              properties: {
                role: {
                  type: "string",

                  enum: [
                    "ADMIN",
                    "FARMER",
                    "CONSUMER",
                    "BULK_BUYER",
                    "FPO",
                    "LOGISTICS",
                    "GOVERNMENT_OFFICER"
                  ],

                  example: "FARMER"
                },

                dashboard: {
                  type: "object",

                  description:
                    "Role-specific dashboard data. The structure depends on the authenticated user's role.",

                  additionalProperties: true
                }
              }
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

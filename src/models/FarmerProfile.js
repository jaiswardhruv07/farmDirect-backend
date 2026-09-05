const {
  FARM_LAND_UNIT,
  FARM_OWNERSHIP_TYPE
} = require("../enums/profile.enum");
const mongoose = require("mongoose");


const addressSchema = require("../schemas/common/Address");
const geoPointSchema = require("../schemas/common/GeoPoint");
const verificationSchema = require("../schemas/common/Verification");

const farmerProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true
    },

    farmerCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      index: true
    },

    farmDetails: {
      totalLandArea: {
        type: Number,
        required: true,
        min: 0
      },


landUnit: {
  type: String,
  enum: Object.values(FARM_LAND_UNIT),
  required: true
},

ownershipType: {
  type: String,
  enum: Object.values(FARM_OWNERSHIP_TYPE),
  required: true
}
    },

    location: {
      type: addressSchema,
      required: true
    },

    coordinates: {
      type: geoPointSchema
    },

    verification: {
      type: verificationSchema,
      default: () => ({})
    },

    bankDetails: {
      accountHolderName: {
        type: String,
        trim: true,
        maxlength: 100
      },

      accountNumber: {
        type: String,
        trim: true
      },

      ifsc: {
        type: String,
        trim: true,
        uppercase: true,
        match: /^[A-Z]{4}0[A-Z0-9]{6}$/
      }
    }
  },
  {
    timestamps: true,
    collection: "farmer_profiles"
  }
);

farmerProfileSchema.index({
  "location.coordinates": "2dsphere"
});

const FarmerProfile = mongoose.model(
  "FarmerProfile",
  farmerProfileSchema
);

module.exports = FarmerProfile;
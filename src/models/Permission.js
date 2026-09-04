const mongoose = require("mongoose");
const PERMISSIONS = require("../enums/permission.enum");

const permissionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      enum: Object.values(PERMISSIONS),
      required: true,
      unique: true,
      uppercase: true,
      trim: true
    },

    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200
    },

    module: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      maxlength: 50
    }
  },
  {
    timestamps: true,
    collection: "permissions"
  }
);

permissionSchema.index({ module: 1 });

const Permission = mongoose.model("Permission", permissionSchema);

module.exports = Permission;

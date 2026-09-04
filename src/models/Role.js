const mongoose = require("mongoose");
const { ROLES } = require("../config/constants");

const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      enum: Object.values(ROLES),
      required: true,
      unique: true,
      uppercase: true,
      trim: true
    },

    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300
    },

    permissionIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Permission"
      }
    ],

    isSystemRole: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true,
    collection: "roles"
  }
);

const Role = mongoose.model("Role", roleSchema);

module.exports = Role;

const mongoose = require("mongoose");

const { FPO_MEMBER_STATUS } = require("../enums/profile.enum");

const fpoMemberSchema = new mongoose.Schema(
  {
    fpoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FpoProfile",
      required: true,
      index: true
    },

    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FarmerProfile",
      required: true,
      index: true
    },

    membershipNumber: {
      type: String,
      required: true,
      trim: true,
      uppercase: true
    },

    joinedAt: {
      type: Date,
      required: true,
      default: Date.now
    },

    status: {
      type: String,
      enum: Object.values(FPO_MEMBER_STATUS),
      default: FPO_MEMBER_STATUS.ACTIVE,
      required: true,
      index: true
    },

    contributionPercentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    }
  },
  {
    timestamps: true,
    collection: "fpo_members"
  }
);

fpoMemberSchema.index({ fpoId: 1, farmerId: 1 }, { unique: true });

fpoMemberSchema.index({ fpoId: 1, membershipNumber: 1 }, { unique: true });

const FpoMember = mongoose.model("FpoMember", fpoMemberSchema);

module.exports = FpoMember;

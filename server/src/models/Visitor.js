const mongoose = require("mongoose");

const visitorSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
    },

    email: {
      type: String,
    },

    purpose: {
      type: String,
      required: true,
    },
    selfie: {
      type: String, // base64 or image URL later
      required: true,
    },

    hrId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED", "CHECKED_IN", "CHECKED_OUT"],
      default: "PENDING",
      index: true,
    },

    checkInAt: {
      type: Date,
    },

    checkOutAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Visitor", visitorSchema);

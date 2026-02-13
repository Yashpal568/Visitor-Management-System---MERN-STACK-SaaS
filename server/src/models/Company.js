const mongoose = require("mongoose");

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
    },

    phone: {
      type: String,
      required: true,
    },

    address: {
      type: String,
      required: true,
    },

    industry: {
      type: String,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    qrToken: {
      type: String,
      unique: true,
      index: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Company", companySchema);

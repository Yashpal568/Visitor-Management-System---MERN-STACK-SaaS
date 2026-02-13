const mongoose = require("mongoose");

const planSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },

    priceMonthly: {
      type: Number,
      required: true
    },

    priceYearly: {
      type: Number,
      required: true
    },

    employeeLimit: {
      type: Number,
      required: true
    },

    features: {
      type: [String],
      default: []
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Plan", planSchema);

const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      index: true
    },

    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plan"
    },

    planSnapshot: Object,

    status: {
      type: String,
      enum: ["active", "expired", "cancelled", "pending"],
      default: "active"
    },

    startDate: Date,
    endDate: Date
  },
  { timestamps: true }
);

module.exports = mongoose.model("Subscription", subscriptionSchema);

const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      index: true
    },

    companyName: String,

    planId: mongoose.Schema.Types.ObjectId,
    planName: String,
    billingCycle: String,

    amount: Number,
    currency: { type: String, default: "INR" },

    gateway: String,
    transactionId: String,
    invoiceNumber: String,

    status: {
      type: String,
      enum: ["success", "failed", "refunded", "pending"],
      index: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);

const mongoose = require("mongoose");

const securityEventSchema = new mongoose.Schema(
  {
    userId: mongoose.Schema.Types.ObjectId,
    ip: String,
    reason: String
  },
  { timestamps: true }
);

module.exports = mongoose.model("SecurityEvent", securityEventSchema);

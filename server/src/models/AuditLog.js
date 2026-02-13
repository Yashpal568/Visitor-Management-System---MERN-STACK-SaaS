const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    companyId: mongoose.Schema.Types.ObjectId,
    action: String,
    performedBy: mongoose.Schema.Types.ObjectId,
    targetId: mongoose.Schema.Types.ObjectId
  },
  { timestamps: true }
);

module.exports = mongoose.model("AuditLog", auditLogSchema);

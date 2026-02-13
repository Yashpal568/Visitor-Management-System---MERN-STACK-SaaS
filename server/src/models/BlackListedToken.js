const mongoose = require("mongoose");

const blacklistedTokenSchema = new mongoose.Schema({
  token: String,
  expiresAt: Date
});

blacklistedTokenSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 }
);

module.exports = mongoose.model("BlacklistedToken", blacklistedTokenSchema);

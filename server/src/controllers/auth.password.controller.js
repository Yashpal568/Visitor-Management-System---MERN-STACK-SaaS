const User = require("../models/User");
const PasswordResetToken = require("../models/PasswordResetToken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.json({ message: "If user exists, reset link sent" });
  }

  const token = crypto.randomBytes(32).toString("hex");

  await PasswordResetToken.create({
    userId: user._id,
    token,
    expiresAt: new Date(Date.now() + 15 * 60 * 1000)
  });

  // Email sending will be added later
  console.log("Password reset token:", token);

  res.json({ message: "Reset link sent" });
};

exports.resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  const reset = await PasswordResetToken.findOne({
    token,
    expiresAt: { $gt: new Date() }
  });

  if (!reset) {
    return res.status(400).json({ message: "Invalid or expired token" });
  }

  const hashed = await bcrypt.hash(newPassword, 10);
  await User.findByIdAndUpdate(reset.userId, { password: hashed });

  await PasswordResetToken.deleteOne({ _id: reset._id });

  res.json({ message: "Password reset successful" });
};

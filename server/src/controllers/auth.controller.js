const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const BlacklistedToken = require("../models/BlacklistedToken");

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email, isActive: true });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
        companyId: user.companyId
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Fetch Company & Subscription Status
    const company = await require("../models/Company").findById(user.companyId);
    const subscription = await require("../models/Subscription").findOne({ companyId: user.companyId });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
        companyId: user.companyId,
        isCompanyActive: company ? company.isActive : false,
        subscriptionStatus: subscription ? subscription.status : "none"
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.logout = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (token) {
    await BlacklistedToken.create({
      token,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
    });
  }
  res.json({ message: "Logged out successfully" });
};

exports.setPassword = async (req, res, next) => {
  try {
    const { email, newPassword } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.isFirstLogin) {
      return res.status(400).json({
        message: "Password already set. Please login."
      });
    }

    // 🔐 HASH PASSWORD (same logic login expects)
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    user.isFirstLogin = false;
    await user.save();

    res.json({ message: "Password set successfully. Please login." });
  } catch (err) {
    next(err);
  }
};
exports.getMyProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId)
      .select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
      department: user.department,
      designation: user.designation,
      isActive: user.isActive,
      createdAt: user.createdAt
    });
  } catch (err) {
    next(err);
  }
};


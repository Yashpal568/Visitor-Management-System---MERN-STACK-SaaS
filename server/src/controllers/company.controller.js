const Company = require("../models/Company");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const QRCode = require("qrcode");
const crypto = require("crypto");

/**
 * Create company + auto create company admin
 * This API is called AFTER successful payment
 */
exports.createCompany = async (req, res, next) => {
  try {
    const {
      companyName,
      companyEmail,
      companyPhone,
      address,
      industry,
      adminName,
      adminEmail,
      adminPhone,
      adminPassword,
    } = req.body;

    // 1. Generate QR Token
    const qrToken = crypto.randomBytes(32).toString("hex");

    // 2. Create company
    const company = await Company.create({
      name: companyName,
      email: companyEmail,
      phone: companyPhone,
      address,
      industry,
      qrToken // Save directly
    });

    // 2. Create company admin
    const admin = await User.create({
      companyId: company._id,
      name: adminName,
      email: adminEmail,
      phone: adminPhone,
      role: "Admin",
      password: await bcrypt.hash(adminPassword, 12),
      isActive: true,
    });

    res.status(201).json({
      message: "Company created successfully",
      companyId: company._id,
      adminId: admin._id,
    });
  } catch (err) {
    next(err);
  }
};

exports.updateCompany = async (req, res, next) => {
  try {
    const company = await Company.findById(req.user.companyId);
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    Object.assign(company, req.body);
    await company.save();

    res.json({ message: "Company updated" });
  } catch (err) {
    next(err);
  }
};

exports.getCompanyQR = async (req, res, next) => {
  try {
    // console.log("🔍 [Company] getCompanyQR called for:", req.user?.companyId); // REMOVE DEBUG
    const companyId = req.user.companyId;
    const company = await Company.findById(companyId);

    if (!company) return res.status(404).json({ message: "Company not found" });

    const entryUrl = `${process.env.FRONTEND_URL}/check-in/${company.qrToken}`;
    const exitUrl = `${process.env.FRONTEND_URL}/check-out/${company.qrToken}`;

    const entryQR = await QRCode.toDataURL(entryUrl);
    const exitQR = await QRCode.toDataURL(exitUrl);

    res.json({
      entryQR,
      exitQR,
    });
  } catch (err) {
    next(err);
  }
};

exports.getHRList = async (req, res, next) => {
  try {
    const { companyId } = req.params;

    const hrList = await User.find({
      companyId,
      role: "Staff",
    }).select("_id name");

    res.json(hrList);
  } catch (err) {
    next(err);
  }
};

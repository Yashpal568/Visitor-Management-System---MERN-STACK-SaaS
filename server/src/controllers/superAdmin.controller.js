const Plan = require("../models/Plan");
const Company = require("../models/Company");
const User = require("../models/User");
const bcrypt = require("bcryptjs");

/* ======================
   SUPER ADMIN PROFILE
====================== */

exports.getProfile = async (req, res) => {
  const user = await User.findById(req.user.userId).select("-password");
  res.json(user);
};

/* ======================
   DASHBOARD STATS
====================== */
exports.getDashboardStats = async (req, res) => {
  try {
    const totalCompanies = await Company.countDocuments();

    // Revenue (Mock calculation for now, or aggregation from Payments)
    const totalRevenue = await require("../models/Payment").aggregate([
      { $match: { status: "success" } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    const activeSubscriptions = await require("../models/Subscription").countDocuments({ status: "active" });
    const expiredSubscriptions = await require("../models/Subscription").countDocuments({ status: "expired" });
    const pendingPayments = await require("../models/Payment").countDocuments({ status: "pending" });

    res.json({
      totalCompanies,
      revenue: totalRevenue[0]?.total || 0,
      activeSubscriptions,
      expiredSubscriptions,
      pendingPayments
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  const updates = req.body;

  if (updates.password) {
    updates.password = await bcrypt.hash(updates.password, 12);
  }

  await User.findByIdAndUpdate(req.user.userId, updates);
  res.json({ message: "Profile updated" });
};

/* ======================
   PLAN CRUD
====================== */

exports.createPlan = async (req, res) => {
  try {
    const {
      name,
      priceMonthly,
      priceYearly,
      employeeLimit,
      features
    } = req.body;

    const plan = await Plan.create({
      name,
      priceMonthly,
      priceYearly,
      employeeLimit,
      features
    });

    res.status(201).json({
      success: true,
      plan
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

exports.getPlans = async (req, res) => {
  const plans = await Plan.find();
  res.json(plans);
};

exports.updatePlan = async (req, res) => {
  await Plan.findByIdAndUpdate(req.params.id, req.body);
  res.json({ message: "Plan updated" });
};

exports.togglePlan = async (req, res) => {
  const plan = await Plan.findById(req.params.id);
  plan.isActive = !plan.isActive;
  await plan.save();
  res.json({ message: "Plan status updated" });
};

/* ======================
   COMPANY CONTROL
====================== */

exports.getCompanies = async (req, res) => {
  const companies = await Company.find();
  res.json(companies);
};

exports.toggleCompanyStatus = async (req, res) => {
  const company = await Company.findById(req.params.id);
  company.isActive = !company.isActive;
  await company.save();

  res.json({ message: "Company status updated" });
};


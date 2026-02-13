const User = require("../models/User");
const bcrypt = require("bcryptjs");
const { checkEmployeeLimit } = require("../services/employeeLimit.service");
const Visitor = require("../models/Visitor");
const Subscription = require("../models/Subscription");

exports.getDashboardStats = async (req, res, next) => {
  try {
    const companyId = req.user.companyId;

    // 1. Visitor Stats
    const totalVisitors = await Visitor.countDocuments({ companyId });
    const activeVisitors = await Visitor.countDocuments({ companyId, status: "CHECKED_IN" });

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayVisitors = await Visitor.countDocuments({
      companyId,
      createdAt: { $gte: todayStart }
    });

    // 2. Employee Stats
    const totalEmployees = await User.countDocuments({ companyId, role: { $ne: "Admin" } });

    // 3. Subscription Info
    const subscription = await Subscription.findOne({ companyId });
    let daysRemaining = 0;
    if (subscription && subscription.endDate) {
      const diff = new Date(subscription.endDate) - new Date();
      daysRemaining = Math.ceil(diff / (1000 * 60 * 60 * 24));
    }

    res.json({
      totalVisitors,
      activeVisitors,
      todayVisitors,
      totalEmployees,
      subscriptionStatus: subscription ? subscription.status : "none",
      daysRemaining: daysRemaining > 0 ? daysRemaining : 0
    });
  } catch (err) {
    next(err);
  }
};

exports.createEmployee = async (req, res, next) => {
  try {
    const { name, email, phone, role, department, designation } = req.body;

    // Only Staff or Security allowed
    if (!["Staff", "Security"].includes(role)) {
      return res.status(400).json({
        message: "Invalid role",
      });
    }

    // TEMP LIMIT (will be dynamic later)
    await checkEmployeeLimit(req.user.companyId);

    const employee = await User.create({
      companyId: req.user.companyId,
      name,
      email,
      phone,
      role,
      department,
      designation,
      isFirstLogin: true,
      isActive: true,
    });

    res.status(201).json({
      message: "Employee created",
      employeeId: employee._id,
    });

    // TODO: Send Email/WhatsApp to Employee
    // const setPasswordLink = `https://your-frontend.com/set-password?email=${email}`;
    // await sendEmail(email, "Welcome! Set your password here: " + setPasswordLink);
    console.log(`[SIMULATION] Email sent to ${email}: Set password at https://vms-app.com/set-password?email=${email}`);
  } catch (err) {
    next(err);
  }
};

exports.getEmployees = async (req, res, next) => {
  try {
    const employees = await User.find({
      companyId: req.user.companyId,
      role: { $ne: "Admin" },
    }).select("-password");

    res.json(employees);
  } catch (err) {
    next(err);
  }
};

exports.updateEmployee = async (req, res, next) => {
  try {
    const { employeeId } = req.params;

    const employee = await User.findOne({
      _id: employeeId,
      companyId: req.user.companyId,
      role: { $ne: "Admin" },
    });

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    Object.assign(employee, req.body);
    await employee.save();

    res.json({ message: "Employee updated" });
  } catch (err) {
    next(err);
  }
};

exports.deleteEmployee = async (req, res, next) => {
  try {
    const { employeeId } = req.params;

    const employee = await User.findOneAndDelete({
      _id: employeeId,
      companyId: req.user.companyId,
      role: { $ne: "Admin" },
    });

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.json({ message: "Employee deleted" });
  } catch (err) {
    next(err);
  }
};

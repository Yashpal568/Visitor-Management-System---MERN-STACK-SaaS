const Visitor = require("../models/Visitor");
const User = require("../models/User");
const Company = require("../models/Company");
const { createNotification } = require("../services/notification.service");

/* =======================
   VISITOR CHECK-IN (PUBLIC)
======================= */
exports.checkInVisitor = async (req, res, next) => {
  try {
    const { qrToken } = req.params;
    const { name, phone, email, purpose, hrId, selfie } = req.body;

    // 1️⃣ Validate company QR
    const company = await Company.findOne({ qrToken });
    if (!company || !company.isActive) {
      return res.status(403).json({
        message: "Invalid or inactive QR code"
      });
    }

    // 2️⃣ Validate HR
    const hr = await User.findOne({
      _id: hrId,
      companyId: company._id,
      role: "Staff"
    });

    if (!hr) {
      return res.status(400).json({
        message: "Invalid HR selected"
      });
    }

    // 3️⃣ Prevent duplicate active visit
    const existing = await Visitor.findOne({
      companyId: company._id,
      phone,
      status: { $in: ["PENDING", "APPROVED", "CHECKED_IN"] }
    });

    if (existing) {
      return res.status(400).json({
        message: "Active visit already exists"
      });
    }

    // 4️⃣ Validate selfie
    if (!selfie) {
      return res.status(400).json({
        message: "Live selfie required"
      });
    }

    // 5️⃣ Create visitor
    const visitor = await Visitor.create({
      companyId: company._id,
      name,
      phone,
      email,
      purpose,
      hrId,
      selfie
    });

    // 6️⃣ Notify HR
    await createNotification({
      userId: hr._id,
      companyId: company._id,
      type: "VISITOR_CHECK_IN",
      message: `New visitor ${name} is waiting for approval`
    });

    res.status(201).json({
      message: "Check-in submitted. Please wait for approval.",
      visitorId: visitor._id
    });
  } catch (err) {
    next(err);
  }
};

/* =======================
   HR: GET PENDING VISITORS
======================= */
exports.getMyPendingVisitors = async (req, res, next) => {
  try {
    const visitors = await Visitor.find({
      hrId: req.user.userId,
      status: "PENDING"
    }).populate("companyId", "name");

    res.json(visitors);
  } catch (err) {
    next(err);
  }
};

/* =======================
   HR: APPROVE / REJECT
======================= */
exports.updateVisitorStatus = async (req, res, next) => {
  try {
    const { visitorId } = req.params;
    const { action } = req.body;

    const allowedActions = ["APPROVED", "REJECTED", "CHECKED_IN", "CHECKED_OUT"];
    if (!allowedActions.includes(action)) {
      return res.status(400).json({
        message: "Invalid action"
      });
    }

    // Find visitor without role restrictions first (we check role logic below)
    const visitor = await Visitor.findById(visitorId);

    if (!visitor) {
      return res.status(404).json({
        message: "Visitor not found"
      });
    }

    // 1️⃣ Ensure company still active
    const company = await Company.findById(visitor.companyId);
    if (!company || !company.isActive) {
      return res.status(403).json({
        message: "Company subscription inactive"
      });
    }

    // 2️⃣ Role-based Logic
    const userRole = req.user.role; // "Staff" or "Security"

    // HR Logic (Approve/Reject)
    if (["APPROVED", "REJECTED"].includes(action)) {
      if (userRole !== "Staff") {
        return res.status(403).json({ message: "Only HR can approve/reject visitors" });
      }
      if (visitor.status !== "PENDING") {
        return res.status(400).json({ message: "Visitor is not in PENDING state" });
      }
    }

    // Security Logic (Check-In)
    if (action === "CHECKED_IN") {
      if (userRole !== "Security") {
        return res.status(403).json({ message: "Only Security can check-in visitors" });
      }
      if (visitor.status !== "APPROVED") {
        return res.status(400).json({ message: "Visitor must be APPROVED before check-in" });
      }
      visitor.checkInAt = new Date();
    }

    // Security Logic (Check-Out)
    if (action === "CHECKED_OUT") {
      if (userRole !== "Security") {
        return res.status(403).json({ message: "Only Security can check-out visitors" });
      }
      if (visitor.status !== "CHECKED_IN") {
        return res.status(400).json({ message: "Visitor must be CHECKED_IN before check-out" });
      }
      visitor.checkOutAt = new Date();
    }

    // 3️⃣ Update visitor status
    visitor.status = action;
    await visitor.save();

    // 4️⃣ Notify relevant parties
    // If HR Approved/Rejected -> Notify Security (Wait, usually Security notified when APPROVED)
    // If Security Check-In -> Notify HR (Visitor Arrived)

    if (action === "APPROVED") {
      // Notify Security
      // (Implementation kept simple: just create notif for all security)
      const securityUsers = await User.find({ companyId: visitor.companyId, role: "Security" });
      for (const sec of securityUsers) {
        await createNotification({
          userId: sec._id,
          companyId: visitor.companyId,
          type: "VISITOR_APPROVED",
          message: `Visitor ${visitor.name} Approved. Expect arrival.`
        });
      }
    } else if (action === "CHECKED_IN") {
      // Notify HR (Host)
      await createNotification({
        userId: visitor.hrId,
        companyId: visitor.companyId,
        type: "VISITOR_ARRIVED",
        message: `Visitor ${visitor.name} has Checked In.`
      });
    }

    res.json({
      message: `Visitor status updated to ${action}`,
      visitor
    });
  } catch (err) {
    next(err);
  }
};

/* =======================
   VISITOR STATUS (PUBLIC)
======================= */
exports.getVisitorStatus = async (req, res, next) => {
  try {
    const { visitorId } = req.params;

    const visitor = await Visitor.findById(visitorId).select("status");

    if (!visitor) {
      return res.status(404).json({
        message: "Visitor not found"
      });
    }

    let message = "Please wait, your request is under review";

    if (visitor.status === "APPROVED") {
      message = "Your request is approved. Please reach the gate";
    } else if (visitor.status === "REJECTED") {
      message = "Your request was rejected";
    } else if (visitor.status === "CHECKED_IN") {
      message = "You are checked in";
    } else if (visitor.status === "CHECKED_OUT") {
      message = "You have checked out. Thank you";
    }

    res.json({
      status: visitor.status,
      message
    });
  } catch (err) {
    next(err);
  }
};


exports.getVisitorHistory = async (req, res, next) => {
  try {
    const { status, fromDate, toDate, hrId } = req.query;

    const filter = {
      companyId: req.user.companyId
    };

    if (status) filter.status = status;
    if (hrId) filter.hrId = hrId;

    if (fromDate || toDate) {
      filter.createdAt = {};
      if (fromDate) filter.createdAt.$gte = new Date(fromDate);
      if (toDate) filter.createdAt.$lte = new Date(toDate);
    }

    const visitors = await Visitor.find(filter)
      .populate("hrId", "name email")
      .sort({ createdAt: -1 });

    res.json({
      count: visitors.length,
      visitors
    });
  } catch (err) {
    next(err);
  }
};

exports.getVisitorAnalytics = async (req, res, next) => {
  try {
    const companyId = req.user.companyId;

    const total = await Visitor.countDocuments({ companyId });

    const approved = await Visitor.countDocuments({
      companyId,
      status: "APPROVED"
    });

    const rejected = await Visitor.countDocuments({
      companyId,
      status: "REJECTED"
    });

    const peakHours = await Visitor.aggregate([
      { $match: { companyId } },
      {
        $group: {
          _id: { $hour: "$createdAt" },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      totalVisitors: total,
      approved,
      rejected,
      peakHours
    });
  } catch (err) {
    next(err);
  }
};

const Visitor = require("../models/Visitor");
const Company = require("../models/Company");

/**
 * GET all approved visitors (Security dashboard)
 */
exports.getApprovedVisitors = async (req, res, next) => {
  try {
    const visitors = await Visitor.find({
      companyId: req.user.companyId,
      status: "APPROVED"
    }).sort({ createdAt: -1 });

    res.json(visitors);
  } catch (err) {
    next(err);
  }
};

/**
 * SECURITY ENTRY
 */
exports.checkInVisitor = async (req, res, next) => {
  try {
    const { visitorId } = req.params;

    const visitor = await Visitor.findOne({
      _id: visitorId,
      companyId: req.user.companyId
    });

    if (!visitor) {
      return res.status(404).json({ message: "Visitor not found" });
    }

    if (visitor.status === "CHECKED_IN") {
      return res.status(400).json({ message: "Visitor already inside" });
    }

    if (visitor.status !== "APPROVED") {
      return res.status(400).json({
        message: "Visitor not approved for entry"
      });
    }

    // Subscription safety check
    const company = await Company.findById(visitor.companyId);
    if (!company || !company.isActive) {
      return res.status(403).json({
        message: "Company subscription inactive"
      });
    }

    visitor.status = "CHECKED_IN";
    visitor.checkInAt = new Date();
    await visitor.save();

    res.json({ message: "Visitor checked in successfully" });
  } catch (err) {
    next(err);
  }
};

/**
 * SECURITY EXIT
 */
exports.checkOutVisitor = async (req, res, next) => {
  try {
    const { visitorId } = req.params;

    const visitor = await Visitor.findOne({
      _id: visitorId,
      companyId: req.user.companyId
    });

    if (!visitor) {
      return res.status(404).json({ message: "Visitor not found" });
    }

    if (visitor.status === "CHECKED_OUT") {
      return res.status(400).json({
        message: "Visitor already checked out"
      });
    }

    if (visitor.status !== "CHECKED_IN") {
      return res.status(400).json({
        message: "Visitor is not inside"
      });
    }

    visitor.status = "CHECKED_OUT";
    visitor.checkOutAt = new Date();
    await visitor.save();

    res.json({ message: "Visitor checked out successfully" });
  } catch (err) {
    next(err);
  }
};

const Company = require("../models/Company");

module.exports = async (req, res, next) => {
  try {
    if (!req.user || !req.user.companyId) {
      return next();
    }

    const company = await Company.findById(req.user.companyId);

    if (!company || !company.isActive) {
      return res.status(403).json({
        message: "Subscription expired. Please renew your plan."
      });
    }

    next();
  } catch (err) {
    next(err);
  }
};

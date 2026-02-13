const User = require("../models/User");
const Subscription = require("../models/Subscription");

exports.checkEmployeeLimit = async (companyId) => {
  const subscription = await Subscription.findOne({
    companyId,
    status: "active"
  });

  if (!subscription) {
    throw new Error("No active subscription found");
  }

  const limit = subscription.planSnapshot.employeeLimit;

  const currentCount = await User.countDocuments({
    companyId,
    role: { $ne: "SuperAdmin" }
  });

  if (currentCount >= limit) {
    throw new Error(
      `Employee limit exceeded. Your plan allows only ${limit} employees.`
    );
  }
};

const Subscription = require("../models/Subscription");
const Company = require("../models/Company");

exports.startOrRenewSubscription = async ({ companyId, plan }) => {
  const startDate = new Date();
  const endDate = new Date(startDate);

  if (plan.billingCycle === "monthly") {
    endDate.setDate(endDate.getDate() + 30);
  } else {
    endDate.setDate(endDate.getDate() + 365);
  }

  let subscription = await Subscription.findOne({ companyId });

  if (!subscription) {
    subscription = await Subscription.create({
      companyId,
      planId: plan._id,
      planSnapshot: plan,
      startDate,
      endDate,
      status: "active"
    });
  } else {
    subscription.planId = plan._id;
    subscription.planSnapshot = plan;
    subscription.startDate = startDate;
    subscription.endDate = endDate;
    subscription.status = "active";
    await subscription.save();
  }

  await Company.findByIdAndUpdate(companyId, { isActive: true });

  return subscription;
};

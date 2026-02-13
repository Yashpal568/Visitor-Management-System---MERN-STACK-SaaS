const Plan = require("../models/Plan");
const { startOrRenewSubscription } = require("../services/subscription.service");
const Subscription = require("../models/Subscription");


exports.activateSubscription = async (req, res, next) => {
  try {
    const { planId } = req.body;

    const plan = await Plan.findById(planId);
    if (!plan || !plan.isActive) {
      return res.status(400).json({ message: "Invalid or inactive plan" });
    }

    await startOrRenewSubscription({
      companyId: req.user.companyId,
      plan
    });

    res.json({ message: "Subscription activated successfully" });
  } catch (err) {
    next(err);
  }
};


exports.getMySubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.findOne({
      companyId: req.user.companyId
    }).populate("planId");

    if (!subscription) {
      return res.json({
        hasPlan: false,
        message: "No active subscription"
      });
    }

    const today = new Date();
    const remainingDays = Math.ceil(
      (subscription.endDate - today) / (1000 * 60 * 60 * 24)
    );

    res.json({
      hasPlan: true,
      plan: {
        name: subscription.planSnapshot.name,
        billingCycle: subscription.planSnapshot.billingCycle,
        price: subscription.planSnapshot.price
      },
      startDate: subscription.startDate,
      endDate: subscription.endDate,
      status: subscription.status,
      remainingDays: remainingDays > 0 ? remainingDays : 0
    });
  } catch (err) {
    next(err);
  }
};
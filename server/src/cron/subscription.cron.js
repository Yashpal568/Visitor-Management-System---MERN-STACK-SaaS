const cron = require("node-cron");
const Subscription = require("../models/Subscription");
const Company = require("../models/Company");

cron.schedule("0 0 * * *", async () => {
  console.log(`[CRON] Checking for expired subscriptions at ${new Date().toISOString()}`);

  const expiredSubscriptions = await Subscription.find({
    status: "active",
    endDate: { $lt: new Date() }
  });

  console.log(`[CRON] Found ${expiredSubscriptions.length} expired subscriptions.`);

  for (const sub of expiredSubscriptions) {
    // 1. Mark Subscription as Expired
    sub.status = "expired";
    await sub.save();

    // 2. Deactivate Company Access
    await Company.findByIdAndUpdate(sub.companyId, {
      isActive: false
    });

    console.log(`[CRON] Deactivated Company: ${sub.companyId}`);
  }

  console.log("🔁 Subscription expiry check completed");
});

const Subscription = require("../models/Subscription");

module.exports = async (req, res, next) => {
    try {
        const subscription = await Subscription.findOne({
            companyId: req.user.companyId,
            status: "active"
        });

        if (!subscription) {
            return res.status(403).json({
                message: "No active subscription. Please subscribe."
            });
        }

        const now = new Date();

        if (subscription.endDate < now) {
            subscription.status = "expired";
            await subscription.save();

            return res.status(403).json({
                message: "Subscription expired. Please renew."
            });
        }

        // ✅ attach for future use
        req.subscription = subscription;

        next();
    } catch (err) {
        next(err);
    }
};

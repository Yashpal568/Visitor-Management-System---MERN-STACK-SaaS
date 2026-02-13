const razorpay = require("../config/razorpay");
const Plan = require("../models/Plan");
const Subscription = require("../models/Subscription");
const Company = require("../models/Company");
const QRCode = require("qrcode");


/**
 * CREATE ORDER
 * Only needs auth + Admin
 * NO companyActive here
 */
exports.createOrder = async (req, res, next) => {
  try {
    const { planId, billingCycle } = req.body;

    if (!planId || !billingCycle) {
      return res.status(400).json({ message: "planId & billingCycle required" });
    }

    const plan = await Plan.findById(planId);
    if (!plan) {
      return res.status(404).json({ message: "Plan not found" });
    }

    const amount =
      billingCycle === "yearly"
        ? plan.priceYearly
        : plan.priceMonthly;

    let order;
    try {
      order = await razorpay.orders.create({
        amount: amount * 100,
        currency: "INR",
        receipt: `receipt_${Date.now()}`
      });
    } catch (rpError) {
      console.warn("⚠️ Razorpay Failed (using dummy keys?). Returning MOCK order.", rpError.message);
      order = { id: `order_mock_${Date.now()}` };
    }

    res.status(200).json({
      success: true,
      orderId: order.id,
      amount,
      currency: "INR"
    });
  } catch (err) {
    next(err);
  }
};

/**
 * ACTIVATE SUBSCRIPTION (DUMMY SUCCESS)
 */
exports.activateSubscription = async (req, res, next) => {
  try {
    const { planId, billingCycle } = req.body;

    const plan = await Plan.findById(planId);
    if (!plan) {
      return res.status(404).json({ message: "Plan not found" });
    }

    const startDate = new Date();
    const endDate = new Date(startDate);

    billingCycle === "yearly"
      ? endDate.setFullYear(endDate.getFullYear() + 1)
      : endDate.setMonth(endDate.getMonth() + 1);

    await Subscription.findOneAndUpdate(
      { companyId: req.user.companyId },
      {
        companyId: req.user.companyId,
        planId,
        planSnapshot: plan, // 📸 SNAPSHOT THE PLAN
        billingCycle,
        startDate,
        endDate,
        status: "active"
      },
      { upsert: true }
    );

    await Company.findByIdAndUpdate(req.user.companyId, {
      isActive: true
    });

    res.json({
      success: true,
      message: "Subscription activated"
    });
  } catch (err) {
    next(err);
  }
};


exports.generateManualQR = async (req, res, next) => {
  try {
    const { planId, billingCycle } = req.body;

    const plan = await Plan.findById(planId);
    if (!plan) {
      return res.status(404).json({ message: "Plan not found" });
    }

    const amount =
      billingCycle === "yearly"
        ? plan.priceYearly
        : plan.priceMonthly;

    // 🔹 Replace with your real UPI ID
    const upiId = "yash38687-1@oksbi";

    const upiLink = `upi://pay?pa=${upiId}&pn=VMS SaaS&am=${amount}&cu=INR`;

    const qrImage = await QRCode.toDataURL(upiLink);

    res.json({
      success: true,
      amount,
      upiLink,
      qrImage
    });

  } catch (err) {
    next(err);
  }
};

exports.markPaymentRequest = async (req, res, next) => {
  try {
    const { planId, billingCycle, transactionId } = req.body;

    if (!planId || !billingCycle || !transactionId) {
      return res.status(400).json({ message: "planId, billingCycle & transactionId required" });
    }

    // 0. Validate Plan ID Format
    const mongoose = require("mongoose");
    if (!mongoose.Types.ObjectId.isValid(planId)) {
      return res.status(400).json({ message: "Invalid Plan ID format" });
    }

    // 1. Check if transactionId already exists
    const existingPayment = await require("../models/Payment").findOne({ transactionId });
    if (existingPayment) {
      return res.status(400).json({ message: "Transaction ID already submitted." });
    }

    // 2. Fetch Plan to calculate amount (TRUST SERVER)
    const plan = await Plan.findById(planId);
    if (!plan) {
      return res.status(404).json({ message: "Plan not found" });
    }

    const amount =
      billingCycle === "yearly"
        ? plan.priceYearly
        : plan.priceMonthly;

    // 3. Create Payment Record (Pending)
    const Payment = require("../models/Payment");
    const newPayment = await Payment.create({
      companyId: req.user.companyId,
      companyName: req.user.companyName || "Unknown Company", // Ensure Company Name is available in req.user or fetch it
      planId: plan._id,
      planName: plan.name,
      billingCycle,
      amount,
      currency: "INR",
      gateway: "manual",
      transactionId,
      status: "pending"
    });

    // 4. Upsert Subscription (Pending)
    await Subscription.findOneAndUpdate(
      { companyId: req.user.companyId },
      {
        companyId: req.user.companyId,
        planId: plan._id,
        planSnapshot: plan,
        billingCycle,
        // No startDate/endDate yet. They are set on APPROVAL.
        status: "pending"
      },
      { upsert: true }
    );

    res.json({
      success: true,
      message: "Payment request submitted. Verification pending.",
      paymentId: newPayment._id
    });

  } catch (err) {
    next(err);
  }
};

/**
 * GET PENDING PAYMENTS (SUPER ADMIN)
 */
exports.getPendingPayments = async (req, res, next) => {
  try {
    const Payment = require("../models/Payment");
    const payments = await Payment.find({ status: "pending" })
      .sort({ createdAt: -1 })
      .populate("companyId", "name email contactNumber"); // Assuming Company model has these fields

    res.json({
      success: true,
      count: payments.length,
      data: payments
    });
  } catch (err) {
    next(err);
  }
};

/**
 * APPROVE PAYMENT (SUPER ADMIN)
 */
exports.approvePayment = async (req, res, next) => {
  try {
    const { paymentId } = req.body;
    const Payment = require("../models/Payment");

    // Allow lookup by _id OR transactionId
    let payment;
    const mongoose = require("mongoose");
    if (mongoose.Types.ObjectId.isValid(paymentId)) {
      payment = await Payment.findById(paymentId);
    } else {
      payment = await Payment.findOne({ transactionId: paymentId });
    }

    if (!payment) {
      return res.status(404).json({ message: "Payment request not found" });
    }

    if (payment.status === "success") {
      return res.status(400).json({ message: "Payment already approved" });
    }

    // 1. Activate Subscription
    const startDate = new Date();
    const endDate = new Date(startDate);

    payment.billingCycle === "yearly"
      ? endDate.setFullYear(endDate.getFullYear() + 1)
      : endDate.setMonth(endDate.getMonth() + 1);

    await Subscription.findOneAndUpdate(
      { companyId: payment.companyId },
      {
        status: "active",
        startDate,
        endDate
      }
    );

    // 2. Activate Company
    await Company.findByIdAndUpdate(payment.companyId, { isActive: true });

    // 3. Update Payment Status
    payment.status = "success";
    await payment.save();

    res.json({
      success: true,
      message: "Payment approved. Subscription activated."
    });

  } catch (err) {
    next(err);
  }
};

/**
 * REJECT PAYMENT (SUPER ADMIN)
 */
exports.rejectPayment = async (req, res, next) => {
  try {
    const { paymentId } = req.body;
    const Payment = require("../models/Payment");

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ message: "Payment request not found" });
    }

    if (payment.status !== "pending") {
      return res.status(400).json({ message: "Can only reject pending payments" });
    }

    payment.status = "failed"; // or 'rejected'
    await payment.save();

    // Optional: Revert subscription status if it was set to pending, 
    // but usually we just leave it or let the user try again. 
    // If they try again, 'markPaymentRequest' upserts it.

    res.json({
      success: true,
      message: "Payment request rejected."
    });
  } catch (err) {
    next(err);
  }
};

const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const role = require("../middleware/role");
const paymentCtrl = require("../controllers/payment.controller");

/**
 * IMPORTANT:
 * NO companyActive middleware here
 */

router.post(
  "/create-order",
  auth,
  role("Admin"),
  paymentCtrl.createOrder
);

router.post(
  "/activate",
  auth,
  role("Admin"),
  paymentCtrl.activateSubscription
);

router.post(
  "/manual-qr",
  auth,
  role("Admin"),
  paymentCtrl.generateManualQR
);

router.post(
  "/mark-paid",
  auth,
  role("Admin"),
  paymentCtrl.markPaymentRequest
);

// --- SUPER ADMIN / ADMIN ROUTES ---

router.get(
  "/pending-requests",
  auth,
  role("Admin", "SuperAdmin"),
  paymentCtrl.getPendingPayments
);

router.post(
  "/approve-request",
  auth,
  role("Admin", "SuperAdmin"),
  paymentCtrl.approvePayment
);

router.post(
  "/reject-request",
  auth,
  role("Admin", "SuperAdmin"),
  paymentCtrl.rejectPayment
);

module.exports = router;

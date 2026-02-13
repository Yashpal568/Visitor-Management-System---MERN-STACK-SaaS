const express = require("express");
const router = express.Router();

const companyActive = require("../middleware/companyActive");
const subscriptionActive = require("../middleware/subscriptionActive");
const companyCtrl = require("../controllers/company.controller");
const auth = require("../middleware/auth");
const role = require("../middleware/role");

/**
 * SUPER ADMIN ONLY
 * ❌ NO subscriptionActive here
 */
router.post(
  "/create",
  auth,
  role("SuperAdmin"),
  companyCtrl.createCompany
);

/**
 * COMPANY ADMIN
 * Subscription REQUIRED
 */
router.put(
  "/update",
  auth,
  subscriptionActive,
  role("Admin"),
  companyCtrl.updateCompany
);

/**
 * COMPANY ADMIN
 * Subscription REQUIRED
 */
router.get(
  "/qr",
  auth,
  subscriptionActive,
  companyActive,
  role("Admin"),
  companyCtrl.getCompanyQR
);

/**
 * PUBLIC (visitor uses this)
 * ❌ NO auth
 * ❌ NO subscription middleware
 */
router.get(
  "/:companyId/hr-list",
  companyCtrl.getHRList
);

module.exports = router;

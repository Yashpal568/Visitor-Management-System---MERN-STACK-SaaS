const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const role = require("../middleware/role");
const companyActive = require("../middleware/companyActive");
const subscriptionCtrl = require("../controllers/subscription.controller");

router.post(
  "/activate",
  auth,
  companyActive,
  role("Admin"),
  subscriptionCtrl.activateSubscription
);

router.get(
  "/me",
  auth,
  role("Admin"),
  subscriptionCtrl.getMySubscription
);

module.exports = router;

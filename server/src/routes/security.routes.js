const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const role = require("../middleware/role");
const subscriptionActive = require("../middleware/subscriptionActive");
const securityCtrl = require("../controllers/security.controller");

router.use(auth, subscriptionActive, role("Security"));

router.get("/approved", securityCtrl.getApprovedVisitors);
router.patch("/check-in/:visitorId", securityCtrl.checkInVisitor);
router.patch("/check-out/:visitorId", securityCtrl.checkOutVisitor);

module.exports = router;

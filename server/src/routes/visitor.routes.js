const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const role = require("../middleware/role");
const visitorCtrl = require("../controllers/visitor.controller");
const subscriptionActive = require("../middleware/subscriptionActive");

// Visitor check-in (NO AUTH – public QR)
router.post("/check-in/:qrToken", visitorCtrl.checkInVisitor);

// HR dashboard
router.get(
  "/my-pending",
  auth,
  subscriptionActive,
  role("Staff"),
  visitorCtrl.getMyPendingVisitors
);

// HR approve / reject
router.patch(
  "/:visitorId/action",
  auth,
  role("Staff"),
  visitorCtrl.updateVisitorStatus
);

// Visitor status (public)
router.get(
  "/status/:visitorId",
  visitorCtrl.getVisitorStatus
);

router.get(
  "/history",
  auth,
  subscriptionActive,
  role("Admin"),
  visitorCtrl.getVisitorHistory
);

router.get(
  "/analytics",
  auth,
  subscriptionActive,
  role("Admin"),
  visitorCtrl.getVisitorAnalytics
);


module.exports = router;

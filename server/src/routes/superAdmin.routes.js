const express = require("express");
const router = express.Router();

const superCtrl = require("../controllers/superAdmin.controller");
const auth = require("../middleware/auth");
const role = require("../middleware/role");

/* Profile */
router.get("/profile", auth, role("SuperAdmin"), superCtrl.getProfile);
router.put("/profile", auth, role("SuperAdmin"), superCtrl.updateProfile);
router.get("/dashboard/stats", auth, role("SuperAdmin"), superCtrl.getDashboardStats);

/* Plans */
router.post("/plans", auth, role("SuperAdmin"), superCtrl.createPlan);
router.get("/plans", auth, role("SuperAdmin"), superCtrl.getPlans);
router.put("/plans/:id", auth, role("SuperAdmin"), superCtrl.updatePlan);
router.patch("/plans/:id/toggle", auth, role("SuperAdmin"), superCtrl.togglePlan);

/* Companies */
router.get("/companies", auth, role("SuperAdmin"), superCtrl.getCompanies);
router.patch(
  "/companies/:id/status",
  auth,
  role("SuperAdmin"),
  superCtrl.toggleCompanyStatus
);

module.exports = router;

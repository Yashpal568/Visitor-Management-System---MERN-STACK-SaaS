const express = require("express");
const router = express.Router();

const adminCtrl = require("../controllers/admin.controller");
const auth = require("../middleware/auth");
const role = require("../middleware/role");
const companyActive = require("../middleware/companyActive");
const subscriptionActive = require("../middleware/subscriptionActive");

router.post("/create-employee", auth, subscriptionActive, companyActive, role("Admin"), adminCtrl.createEmployee);
router.get("/dashboard/stats", auth, role("Admin"), adminCtrl.getDashboardStats);

router.get("/employees", auth, role("Admin"), adminCtrl.getEmployees);

router.put(
  "/employee/:employeeId",
  auth,
  role("Admin"),
  adminCtrl.updateEmployee
);

router.delete(
  "/employee/:employeeId",
  auth,
  role("Admin"),
  adminCtrl.deleteEmployee
);

module.exports = router;

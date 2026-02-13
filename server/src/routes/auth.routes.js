const express = require("express");
const router = express.Router();

const authCtrl = require("../controllers/auth.controller");
const passwordCtrl = require("../controllers/auth.password.controller");
const auth = require("../middleware/auth");
const { getMyProfile } = require("../controllers/auth.controller")

router.post("/login", authCtrl.login);
router.post("/logout", auth, authCtrl.logout);

router.post("/forgot-password", passwordCtrl.forgotPassword);
router.post("/reset-password", passwordCtrl.resetPassword);
router.post("/set-password", authCtrl.setPassword);

router.get(
  "/me",
  auth,
  getMyProfile
);

router.put(
  "/me",
  auth,
  authCtrl.updateMyProfile
);
module.exports = router;

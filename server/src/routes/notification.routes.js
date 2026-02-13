const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const notificationCtrl = require("../controllers/notification.controller");

// Get my notifications
router.get("/", auth, notificationCtrl.getMyNotifications);

// Mark notification as read
router.patch("/:notificationId/read", auth, notificationCtrl.markAsRead);

module.exports = router;

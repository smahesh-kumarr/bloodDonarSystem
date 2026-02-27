const express = require("express");
const {
  sendNotification,
  getNotifications,
} = require("../controllers/notificationController");

const router = express.Router();

router.post("/send", sendNotification);
router.get("/", getNotifications);

module.exports = router;

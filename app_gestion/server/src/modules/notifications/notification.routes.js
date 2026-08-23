// src/modules/notifications/notification.routes.js
const express = require("express");
const authMiddleware = require("../../common/middlewares/auth.middleware");
const notificationController = require("./notification.controller");

const router = express.Router();

router.use(authMiddleware.protect);

router.get("/", notificationController.getMyNotifications);
router.patch("/:id/read", notificationController.markAsRead);

module.exports = router;

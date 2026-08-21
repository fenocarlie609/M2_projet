// src/modules/notifications/notification.controller.js
const catchAsync = require("../../common/utils/catchAsync");
const notificationService = require("./notification.service");

exports.getMyNotifications = catchAsync(async (req, res) => {
  const notifications = await notificationService.getNotificationsForEmployee(
    req.user.id,
    req.user.permissions || [],
  );

  res.status(200).json({
    status: "success",
    results: notifications.length,
    data: { notifications },
  });
});

exports.markAsRead = catchAsync(async (req, res) => {
  await notificationService.markAsRead(req.params.id, req.user.id);

  res.status(200).json({
    status: "success",
    message: "Notification marquée comme lue.",
  });
});

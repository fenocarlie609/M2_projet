// src/modules/dashboard/dashboard.controller.js
const catchAsync = require("../../common/utils/catchAsync");
const { sendSuccess } = require("../../common/utils/response");
const dashboardService = require("./dashboard.service");

exports.getSummary = catchAsync(async (req, res) => {
  const resume = await dashboardService.getSummary(req.user);

  return sendSuccess(res, { data: resume });
});

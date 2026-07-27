// src/modules/uploads/upload.controller.js
const catchAsync = require("../../common/utils/catchAsync");
const AppError = require("../../common/utils/AppError");

exports.uploadAvatar = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError("Aucun fichier reçu.", 400));
  }

  // APP_URL est déjà défini dans votre .env.development (http://localhost:5000)
  const baseUrl = process.env.APP_URL || `${req.protocol}://${req.get("host")}`;
  const url = `${baseUrl}/uploads/avatars/${req.file.filename}`;

  res.status(201).json({
    status: "success",
    data: { url },
  });
});

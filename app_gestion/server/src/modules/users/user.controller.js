// src/modules/users/user.controller.js
const userService = require("./user.service");
const catchAsync = require("../../common/utils/catchAsync"); // Utilisation de ton utilitaire existant
const AppError = require("../../common/utils/AppError");

// Fonction utilitaire interne pour extraire le contexte d'audit de la requête HTTP
const getAuditContext = (req) => ({
  userId: req.user?.id || null, // ID de l'admin/user connecté (via ton auth middleware)
  ipAddress: req.ip || req.headers["x-forwarded-for"] || "127.0.0.1",
  route: req.originalUrl,
  method: req.method,
});

exports.register = catchAsync(async (req, res, next) => {
  const context = getAuditContext(req);
  const newUser = await userService.createUser(req.body, context);

  // Masquer le mot de passe dans la réponse HTTP
  newUser.password = undefined;

  res.status(201).json({
    status: "success",
    data: { user: newUser },
  });
});

exports.update = catchAsync(async (req, res, next) => {
  const context = getAuditContext(req);
  const updatedUser = await userService.updateUser(
    req.params.id,
    req.body,
    context,
  );

  updatedUser.password = undefined;

  res.status(200).json({
    status: "success",
    data: { user: updatedUser },
  });
});

exports.delete = catchAsync(async (req, res, next) => {
  const context = getAuditContext(req);
  await userService.softDeleteUser(req.params.id, context);

  res.status(204).json({
    status: "success",
    data: null,
  });
});

exports.getUsers = catchAsync(async (req, res, next) => {
  const users = await userService.getAllActiveUsers();

  res.status(200).json({
    status: "success",
    results: users.length,
    data: { users },
  });
});

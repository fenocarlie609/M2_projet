const catchAsync = require("../../common/utils/catchAsync");
const userService = require("./user.service");
const authService = require("../auth/auth.service");
const { getIO } = require("../../config/socket");

exports.getPending = catchAsync(async (req, res) => {
  const pending = await userService.getPendingAccessRequests();

  res.status(200).json({
    status: "success",
    results: pending.length,
    data: { employees: pending },
  });
});

exports.getAll = catchAsync(async (req, res) => {
  const users = await userService.getAllUsers();

  res.status(200).json({
    status: "success",
    results: users.length,
    data: { users },
  });
});

exports.getAllPermissions = catchAsync(async (req, res) => {
  const permissions = await userService.getAllPermissions();

  res.status(200).json({
    status: "success",
    results: permissions.length,
    data: { permissions },
  });
});

exports.getById = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.params.id);

  res.status(200).json({
    status: "success",
    data: { user },
  });
});

exports.grantAccess = catchAsync(async (req, res) => {
  const { id } = req.params;
  const user = await userService.grantAccess(id, req.body);
  user.password = undefined;

  res.status(201).json({
    status: "success",
    data: { user },
  });
});

exports.updateAccess = catchAsync(async (req, res) => {
  const { id } = req.params;
  const user = await userService.updateAccess(id, req.body);
  user.password = undefined;

  const io = getIO();
  if (req.body.isActive === false) {
    io.to(`employee_${id}`).emit("account-disabled", {
      message: "Votre compte a été désactivé par l'IT.",
    });
  } else {
    const freshProfile = await authService.getFreshProfile(id);
    io.to(`employee_${id}`).emit("profile-updated", freshProfile);
  }

  res.status(200).json({
    status: "success",
    data: { user },
  });
});

exports.revokeAccess = catchAsync(async (req, res) => {
  const { id } = req.params;
  await userService.revokeAccess(id);

  const io = getIO();
  io.to(`employee_${id}`).emit("account-disabled", {
    message: "Votre accès à l'application a été révoqué.",
  });

  res.status(204).json({
    status: "success",
    data: null,
  });
});

exports.assignPermission = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { module, action } = req.body;

  const permission = await userService.assignPermission(id, module, action);

  const io = getIO();
  const freshProfile = await authService.getFreshProfile(id);
  io.to(`employee_${id}`).emit("profile-updated", freshProfile);

  res.status(201).json({
    status: "success",
    data: { permission },
  });
});

exports.revokePermission = catchAsync(async (req, res) => {
  const { id, permissionId } = req.params;
  await userService.revokePermission(id, permissionId);

  const io = getIO();
  const freshProfile = await authService.getFreshProfile(id);
  io.to(`employee_${id}`).emit("profile-updated", freshProfile);

  res.status(204).json({
    status: "success",
    data: null,
  });
});

// ⚠️ Manquait dans le fichier uploadé : le service `revokePermissions`
// existait déjà mais n'était jamais appelé depuis un handler.
exports.revokeManyPermissions = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { permissionIds } = req.body;

  await userService.revokePermissions(id, permissionIds);

  const io = getIO();
  const freshProfile = await authService.getFreshProfile(id);
  io.to(`employee_${id}`).emit("profile-updated", freshProfile);

  res.status(204).json({
    status: "success",
    data: null,
  });
});

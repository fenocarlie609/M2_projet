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

  // Cohérence avec les autres mutations (updateAccess, assignPermission...) :
  // on pousse le profil à jour. Dans la majorité des cas l'employé n'a pas
  // encore de session ouverte à ce stade (il vient tout juste d'avoir accès),
  // donc ça ne fait rien de visible — mais ça ne doit jamais faire échouer
  // la réponse si Socket.IO est indisponible.
  try {
    const io = getIO();
    const freshProfile = await authService.getFreshProfile(id);
    io.to(`employee_${id}`).emit("profile-updated", freshProfile);
  } catch (err) {
    // Échec silencieux : le compte a bien été créé, le push temps réel est secondaire.
  }

  res.status(201).json({
    status: "success",
    data: { user },
  });
});

exports.updateAccess = catchAsync(async (req, res) => {
  const { id } = req.params;
  const user = await userService.updateAccess(id, req.body);
  user.password = undefined;

  try {
    const io = getIO();
    if (req.body.isActive === false) {
      io.to(`employee_${id}`).emit("account-disabled", {
        message: "Votre compte a été désactivé par l'IT.",
      });
    } else {
      const freshProfile = await authService.getFreshProfile(id);
      io.to(`employee_${id}`).emit("profile-updated", freshProfile);
    }
  } catch (err) {
    // Échec silencieux : la mise à jour a réussi, le push temps réel est secondaire.
  }

  res.status(200).json({
    status: "success",
    data: { user },
  });
});

exports.revokeAccess = catchAsync(async (req, res) => {
  const { id } = req.params;
  await userService.revokeAccess(id);

  try {
    const io = getIO();
    io.to(`employee_${id}`).emit("account-disabled", {
      message: "Votre accès à l'application a été révoqué.",
    });
  } catch (err) {
    // Échec silencieux
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
});

exports.assignPermission = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { module, action } = req.body;

  const permission = await userService.assignPermission(id, module, action);

  try {
    const io = getIO();
    const freshProfile = await authService.getFreshProfile(id);
    io.to(`employee_${id}`).emit("profile-updated", freshProfile);
  } catch (err) {
    // Échec silencieux
  }

  res.status(201).json({
    status: "success",
    data: { permission },
  });
});

exports.revokePermission = catchAsync(async (req, res) => {
  const { id, permissionId } = req.params;
  await userService.revokePermission(id, permissionId);

  try {
    const io = getIO();
    const freshProfile = await authService.getFreshProfile(id);
    io.to(`employee_${id}`).emit("profile-updated", freshProfile);
  } catch (err) {
    // Échec silencieux
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
});

exports.revokeManyPermissions = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { permissionIds } = req.body;

  await userService.revokePermissions(id, permissionIds);

  try {
    const io = getIO();
    const freshProfile = await authService.getFreshProfile(id);
    io.to(`employee_${id}`).emit("profile-updated", freshProfile);
  } catch (err) {
    // Échec silencieux
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
});

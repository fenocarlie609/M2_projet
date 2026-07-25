const catchAsync = require("../../common/utils/catchAsync");
const AppError = require("../../common/utils/AppError");
const employeeService = require("./employee.service");
const authService = require("../auth/auth.service"); // Import pour nettoyer le profil
const { getIO } = require("../../config/socket"); // Instance WebSocket globale

exports.create = catchAsync(async (req, res) => {
  const employee = await employeeService.createEmployee(req.body);
  employee.password = undefined;

  res.status(201).json({
    status: "success",
    data: { employee },
  });
});

exports.update = catchAsync(async (req, res) => {
  const { id } = req.params;

  // 1. Exécuter la mise à jour en base de données
  const updatedData = await employeeService.updateEmployee(id, req.body);
  updatedData.password = undefined;

  // 2. Si l'employé a un accès applicatif, on pousse les changements en temps réel
  if (updatedData.hasAppAccess) {
    const io = getIO();

    // Si le compte vient d'être désactivé (Bannissement/Suspension)
    if (req.body.isActive === false) {
      io.to(`employee_${id}`).emit("account-disabled", {
        message: "Votre compte a été désactivé par un administrateur.",
      });
    } else {
      // Sinon, on génère un profil tout propre filtré et on met à jour son état global
      const freshProfile = await authService.getFreshProfile(id);
      io.to(`employee_${id}`).emit("profile-updated", freshProfile);
    }
  }

  res.status(200).json({
    status: "success",
    data: { employee: updatedData },
  });
});

exports.delete = catchAsync(async (req, res) => {
  const { id } = req.params;

  // 1. Exécuter le soft delete (qui passe déjà isActive à false en interne)
  await employeeService.softDeleteEmployee(id);

  // 2. Notifier instantanément le client pour rompre sa session
  const io = getIO();
  io.to(`employee_${id}`).emit("account-disabled", {
    message: "Votre compte a été supprimé du système.",
  });

  res.status(204).json({
    status: "success",
    data: null,
  });
});

exports.getAll = catchAsync(async (req, res) => {
  const employees = await employeeService.getAllActiveEmployees();

  res.status(200).json({
    status: "success",
    results: employees.length,
    data: { employees },
  });
});

exports.getById = catchAsync(async (req, res, next) => {
  const employee = await employeeService.getEmployeeById(req.params.id);
  if (!employee || employee.deletedAt) {
    return next(new AppError("Employé non trouvé.", 404));
  }
  employee.password = undefined;

  res.status(200).json({
    status: "success",
    data: { employee },
  });
});

exports.assignPermission = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { module, action } = req.body;

  // 1. Assigner la permission en base de données
  const permission = await employeeService.assignPermission(id, module, action);

  // 2. Récupérer le profil complet nettoyé et le pousser en temps réel
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

  // 1. Révoquer la permission en base de données
  await employeeService.revokePermission(id, permissionId);

  // 2. Mettre à jour immédiatement l'état global du client connecté
  const io = getIO();
  const freshProfile = await authService.getFreshProfile(id);
  io.to(`employee_${id}`).emit("profile-updated", freshProfile);

  res.status(204).json({
    status: "success",
    data: null,
  });
});

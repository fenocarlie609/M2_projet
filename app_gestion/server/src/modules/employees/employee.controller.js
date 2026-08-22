const catchAsync = require("../../common/utils/catchAsync");
const AppError = require("../../common/utils/AppError");
const employeeService = require("./employee.service");
const authService = require("../auth/auth.service"); // Import pour nettoyer le profil
const { getIO } = require("../../config/socket"); // Instance WebSocket globale

exports.create = catchAsync(async (req, res) => {
  const employee = await employeeService.createEmployee(req.body);
  employee.password = undefined;

  try {
    getIO().emit("employees:changed", { action: "created", employee });
  } catch (err) {
    // Ne pas faire échouer la création si Socket indisponible
  }

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

  // 2. Push temps réel.
  // CORRECTION : l'ancienne condition ne se basait que sur hasAppAccess,
  // ce qui pouvait pousser "profile-updated" à un employé qui n'a en réalité
  // aucun compte actif (hasAppAccess=true mais isActive=false, en attente
  // qu'un IT traite la demande via le module "users" — voir user.service.js).
  // On protège aussi tous les appels socket par try/catch, comme dans
  // notification.service.js, pour ne jamais faire échouer une mise à jour
  // réussie à cause d'un souci de diffusion temps réel.
  try {
    const io = getIO();

    // Désactivation explicite demandée dans cette requête -> on force la
    // déconnexion, même si en pratique la room peut ne pas avoir d'auditeur.
    const wasJustDeactivated =
      req.body.isActive === false || req.body.hasAppAccess === false;

    if (wasJustDeactivated) {
      io.to(`employee_${id}`).emit("account-disabled", {
        message: "Votre compte a été désactivé par un administrateur.",
      });
    } else if (updatedData.hasAppAccess && updatedData.isActive) {
      // Compte réellement actif : toute autre modification (nom, téléphone,
      // département, poste...) doit rafraîchir le profil de l'employé connecté.
      const freshProfile = await authService.getFreshProfile(id);
      io.to(`employee_${id}`).emit("profile-updated", freshProfile);
    }
  } catch (err) {
    // Échec silencieux : la mise à jour a réussi, le push temps réel est secondaire.
  }

  try {
    getIO().emit("employees:changed", {
      action: "updated",
      employee: updatedData,
    });
  } catch (err) {
    // échec silencieux
  }

  res.status(200).json({
    status: "success",
    data: { employee: updatedData },
  });
});

exports.delete = catchAsync(async (req, res) => {
  const { id } = req.params;

  // 1. Exécuter le soft delete (qui passe déjà isActive/hasAppAccess à false en interne)
  await employeeService.softDeleteEmployee(id);

  // 2. Notifier instantanément le client pour rompre sa session
  try {
    const io = getIO();
    io.to(`employee_${id}`).emit("account-disabled", {
      message: "Votre compte a été supprimé du système.",
    });
  } catch (err) {
    // Échec silencieux
  }

  try {
    getIO().emit("employees:changed", { action: "deleted", id });
  } catch (err) {
    // échec silencieux
  }

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

  // 1. Révoquer la permission en base de données
  await employeeService.revokePermission(id, permissionId);

  // 2. Mettre à jour immédiatement l'état global du client connecté
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

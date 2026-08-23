// src/modules/employees/employee.service.js
const { prisma } = require("../../config/database");
const { hashPassword } = require("../../common/utils/password.utils");
const AppError = require("../../common/utils/AppError");
const {
  createNotification,
  deleteAccessRequestNotifications,
} = require("../notifications/notification.service");

/**
 * Crée un nouvel employé.
 */
const createEmployee = async (data) => {
  const { permissions = [], password, ...rest } = data;

  if (rest.cin) {
    const existingCin = await prisma.employee.findUnique({
      where: { cin: rest.cin },
    });
    if (existingCin) {
      throw new AppError("Ce CIN est déjà enregistré.", 400);
    }
  }

  const existingMatricule = await prisma.employee.findUnique({
    where: { matricule: rest.matricule },
  });
  if (existingMatricule) {
    throw new AppError("Ce matricule est déjà utilisé.", 400);
  }

  if (rest.hasAppAccess && rest.email) {
    const existingEmail = await prisma.employee.findUnique({
      where: { email: rest.email },
    });
    if (existingEmail) {
      throw new AppError("Cet email est déjà utilisé.", 400);
    }
  }

  const employee = await prisma.employee.create({
    data: {
      ...rest,
      password: rest.hasAppAccess ? await hashPassword(password) : null,
      email: rest.hasAppAccess ? rest.email : null,
      permissions: permissions.length
        ? {
            create: permissions.map((p) => ({
              module: p.module,
              action: p.action,
            })),
          }
        : undefined,
    },
    include: {
      permissions: true,
      department: true,
      position: true,
    },
  });

  // Un employé créé directement avec hasAppAccess=true (rare, en général on
  // crée d'abord la fiche RH puis on demande l'accès) déclenche aussi la
  // notification, pour rester cohérent avec updateEmployee ci-dessous.
  if (employee.hasAppAccess) {
    await notifyItForAccessRequest(employee);
  }

  return employee;
};

/**
 * Notifie les employés ayant la permission USERS:CREATE (les IT/superadmin,
 * seuls capables d'accorder un accès applicatif via le module "users")
 * qu'un employé attend une activation.
 */
const notifyItForAccessRequest = async (employee) => {
  await createNotification({
    type: "ACCESS_REQUEST",
    message: `${employee.name} (${employee.matricule}) a besoin d'un accès à l'application.`,
    payload: { employeeId: employee.id },
    targetModule: "USERS",
    targetAction: "CREATE",
  });
};

/**
 * Met à jour un employé.
 */
const updateEmployee = async (id, data) => {
  const payload = { ...data };

  if (payload.cin) {
    const existingCin = await prisma.employee.findUnique({
      where: { cin: payload.cin },
    });
    if (existingCin && existingCin.id !== id) {
      throw new AppError("Ce CIN est déjà enregistré.", 400);
    }
  }

  if (payload.matricule) {
    const existingMatricule = await prisma.employee.findUnique({
      where: { matricule: payload.matricule },
    });
    if (existingMatricule && existingMatricule.id !== id) {
      throw new AppError("Ce matricule est déjà utilisé.", 400);
    }
  }

  if (payload.password) {
    payload.password = await hashPassword(payload.password);
  }

  if (payload.hasAppAccess === false) {
    payload.email = null;
    payload.password = null;
  }

  // On récupère l'état AVANT modification pour détecter la transition
  // false -> true sur hasAppAccess (seul cas qui doit notifier l'IT).
  const previousEmployee = await prisma.employee.findUnique({
    where: { id },
    select: { hasAppAccess: true },
  });

  const updatedEmployee = await prisma.employee.update({
    where: { id },
    data: payload,
    include: {
      permissions: true,
      department: true,
      position: true,
    },
  });

  const justEnabledAccess =
    previousEmployee &&
    !previousEmployee.hasAppAccess &&
    updatedEmployee.hasAppAccess;

  const justDisabledAccess =
    previousEmployee &&
    previousEmployee.hasAppAccess &&
    !updatedEmployee.hasAppAccess;

  if (justEnabledAccess) {
    await notifyItForAccessRequest(updatedEmployee);
  }

  // RH a désactivé hasAppAccess avant que l'IT n'ait traité la demande :
  // la notification n'a plus lieu d'être.
  if (justDisabledAccess) {
    await deleteAccessRequestNotifications(id);
  }

  return updatedEmployee;
};

/**
 * Suppression logique (soft delete) : on désactive aussi l'accès à l'app.
 */
const softDeleteEmployee = async (id) => {
  return await prisma.employee.update({
    where: { id },
    data: { deletedAt: new Date(), isActive: false, hasAppAccess: false },
  });
};

const getAllActiveEmployees = async () => {
  return await prisma.employee.findMany({
    where: { deletedAt: null },
    include: {
      department: true,
      position: true,
      permissions: true,
    },
    orderBy: { createdAt: "desc" },
  });
};

const getEmployeeById = async (id) => {
  return await prisma.employee.findUnique({
    where: { id },
    include: {
      permissions: true,
      department: true,
      position: true,
    },
  });
};

const assignPermission = async (employeeId, module, action) => {
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
  });
  if (!employee || employee.deletedAt) {
    throw new AppError("Employé non trouvé.", 404);
  }

  try {
    return await prisma.employeePermission.create({
      data: { employeeId, module, action },
    });
  } catch (err) {
    if (err.code === "P2002") {
      throw new AppError("Cette permission existe déjà pour cet employé.", 400);
    }
    throw err;
  }
};

const revokePermission = async (employeeId, permissionId) => {
  const permission = await prisma.employeePermission.findUnique({
    where: { id: permissionId },
  });
  if (!permission || permission.employeeId !== employeeId) {
    throw new AppError("Permission non trouvée pour cet employé.", 404);
  }

  return await prisma.employeePermission.delete({
    where: { id: permissionId },
  });
};

module.exports = {
  createEmployee,
  updateEmployee,
  softDeleteEmployee,
  getAllActiveEmployees,
  getEmployeeById,
  assignPermission,
  revokePermission,
};

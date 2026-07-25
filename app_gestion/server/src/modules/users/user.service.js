const { prisma } = require("../../config/database");
const AppError = require("../../common/utils/AppError");
const { hashPassword } = require("../../common/utils/password.utils");

/**
 * Employés signalés par la RH (hasAppAccess = true) mais pour lesquels
 * l'IT n'a pas encore créé/activé de compte (isActive = false).
 * File d'attente IT.
 */
const getPendingAccessRequests = async () => {
  return prisma.employee.findMany({
    where: {
      deletedAt: null,
      hasAppAccess: true,
      isActive: false,
    },
    select: {
      id: true,
      name: true,
      matricule: true,
      department: { select: { code: true, label: true } },
      position: { select: { code: true, label: true } },
      createdAt: true,
    },
    orderBy: { createdAt: "asc" },
  });
};

/**
 * Tous les "users" existants (employés ayant un compte applicatif actif).
 */
const getAllUsers = async () => {
  return prisma.employee.findMany({
    where: { deletedAt: null, hasAppAccess: true },
    select: {
      id: true,
      name: true,
      matricule: true,
      email: true,
      isActive: true,
      department: { select: { code: true, label: true } },
      position: { select: { code: true, label: true } },
      permissions: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });
};

/**
 * Récupère un "user" par son id (utilisé pour rafraîchir le profil après
 * attribution/révocation d'une ou plusieurs permissions côté front).
 */
const getUserById = async (employeeId) => {
  const user = await prisma.employee.findUnique({
    where: { id: employeeId },
    select: {
      id: true,
      name: true,
      matricule: true,
      email: true,
      isActive: true,
      hasAppAccess: true,
      department: { select: { code: true, label: true } },
      position: { select: { code: true, label: true } },
      permissions: true,
      createdAt: true,
    },
  });

  if (!user || !user.hasAppAccess) {
    throw new AppError("Utilisateur introuvable.", 404);
  }

  return user;
};

/**
 * Vue d'ensemble de toutes les permissions accordées, groupées par employé
 * (un employé peut avoir plusieurs permissions). Utile pour un écran
 * d'audit IT global.
 */
const getAllPermissions = async () => {
  return prisma.employee.findMany({
    where: {
      permissions: { some: {} },
    },
    select: {
      id: true,
      name: true,
      matricule: true,
      department: { select: { code: true, label: true } },
      permissions: {
        select: {
          id: true,
          module: true,
          action: true,
        },
      },
    },
  });
};

/**
 * Donne réellement accès à l'app à un employé déjà signalé par la RH :
 * crée le mot de passe (obligatoire, permet la connexion par matricule),
 * l'email est optionnel (peut être ajouté plus tard via updateAccess),
 * active le compte, et peut assigner des permissions initiales par module.
 */
const grantAccess = async (
  employeeId,
  { email, password, permissions = [] },
) => {
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
  });

  if (!employee || employee.deletedAt) {
    throw new AppError("Employé non trouvé.", 404);
  }
  if (!employee.hasAppAccess) {
    throw new AppError(
      "Cet employé n'a pas été signalé par la RH comme ayant besoin d'un accès à l'application.",
      400,
    );
  }
  if (employee.isActive) {
    throw new AppError("Cet employé a déjà un accès à l'application.", 400);
  }

  if (email) {
    const existingEmail = await prisma.employee.findUnique({
      where: { email },
    });
    if (existingEmail) {
      throw new AppError("Cet email est déjà utilisé.", 400);
    }
  }

  return prisma.employee.update({
    where: { id: employeeId },
    data: {
      email: email ?? undefined,
      password: await hashPassword(password),
      isActive: true,
      permissions: permissions.length
        ? {
            create: permissions.map((p) => ({
              module: p.module,
              action: p.action,
            })),
          }
        : undefined,
    },
    include: { permissions: true, department: true, position: true },
  });
};

/**
 * Met à jour les identifiants / l'état d'un compte existant (toujours côté IT).
 */
const updateAccess = async (employeeId, { email, password, isActive }) => {
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
  });
  if (!employee || employee.deletedAt) {
    throw new AppError("Employé non trouvé.", 404);
  }
  if (!employee.isActive) {
    throw new AppError(
      "Cet employé n'a pas encore de compte à mettre à jour.",
      400,
    );
  }

  const data = {};

  if (email && email !== employee.email) {
    const existingEmail = await prisma.employee.findUnique({
      where: { email },
    });
    if (existingEmail) {
      throw new AppError("Cet email est déjà utilisé.", 400);
    }
    data.email = email;
  }

  if (password) {
    data.password = await hashPassword(password);
  }

  if (typeof isActive === "boolean") {
    data.isActive = isActive;
  }

  return prisma.employee.update({
    where: { id: employeeId },
    data,
    include: { permissions: true, department: true, position: true },
  });
};

/**
 * Révoque complètement l'accès à l'app.
 */
const revokeAccess = async (employeeId) => {
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
  });
  if (!employee || employee.deletedAt) {
    throw new AppError("Employé non trouvé.", 404);
  }

  return prisma.employee.update({
    where: { id: employeeId },
    data: {
      email: null,
      password: null,
      isActive: false,
      hasAppAccess: false,
    },
  });
};

/**
 * Attribue une permission (module + action) à un employé ayant déjà un compte actif.
 */
const assignPermission = async (employeeId, module, action) => {
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
  });
  if (!employee || employee.deletedAt) {
    throw new AppError("Employé non trouvé.", 404);
  }
  if (!employee.isActive) {
    throw new AppError("Cet employé n'a pas encore de compte applicatif.", 400);
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

  return prisma.employeePermission.delete({ where: { id: permissionId } });
};

module.exports = {
  getPendingAccessRequests,
  getAllUsers,
  getUserById,
  getAllPermissions,
  grantAccess,
  updateAccess,
  revokeAccess,
  assignPermission,
  revokePermission,
};

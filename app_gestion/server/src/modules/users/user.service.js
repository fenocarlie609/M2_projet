const { prisma } = require("../../config/database");
const AppError = require("../../common/utils/AppError");
const { hashPassword } = require("../../common/utils/password.utils");

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

const updateAccess = async (employeeId, { email, password, isActive }) => {
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
  });
  if (!employee || employee.deletedAt) {
    throw new AppError("Employé non trouvé.", 404);
  }
  if (!employee.hasAppAccess) {
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

const assignPermission = async (employeeId, module, action) => {
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
  });
  if (!employee || employee.deletedAt) {
    throw new AppError("Employé non trouvé.", 404);
  }
  if (!employee.hasAppAccess) {
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

/**
 * Révoque plusieurs permissions d'un coup (sélection multiple côté front).
 * `deleteMany` avec employeeId dans le where garantit qu'on ne supprime
 * jamais les permissions d'un autre employé, même si un id erroné était
 * injecté dans la liste.
 */
const revokePermissions = async (employeeId, permissionIds = []) => {
  if (!permissionIds.length) {
    throw new AppError("Aucune permission à supprimer.", 400);
  }

  const result = await prisma.employeePermission.deleteMany({
    where: {
      id: { in: permissionIds },
      employeeId,
    },
  });

  if (result.count === 0) {
    throw new AppError(
      "Aucune des permissions indiquées n'appartient à cet employé.",
      404,
    );
  }

  return result;
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
  revokePermissions,
};

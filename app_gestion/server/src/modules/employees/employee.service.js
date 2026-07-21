const { prisma } = require("../../config/database");
const { hashPassword } = require("../../common/utils/password.utils");
const AppError = require("../../common/utils/AppError");

/**
 * Crée un nouvel employé.
 * - Si hasAppAccess = false : email/password restent null (l'employé n'a pas de compte).
 * - Si hasAppAccess = true  : email/password sont requis, le mot de passe est hashé.
 * - Des permissions initiales (module + action) peuvent être fournies.
 */
const createEmployee = async (data) => {
  const { permissions = [], password, ...rest } = data;

  // CIN désormais optionnel : on ne vérifie l'unicité que s'il est fourni
  if (rest.cin) {
    const existingCin = await prisma.Employee.findUnique({
      where: { cin: rest.cin },
    });
    if (existingCin) {
      throw new AppError("Ce CIN est déjà enregistré.", 400);
    }
  }

  // Matricule : requis, unique
  const existingMatricule = await prisma.Employee.findUnique({
    where: { matricule: rest.matricule },
  });
  if (existingMatricule) {
    throw new AppError("Ce matricule est déjà utilisé.", 400);
  }

  if (rest.hasAppAccess && rest.email) {
    const existingEmail = await prisma.Employee.findUnique({
      where: { email: rest.email },
    });
    if (existingEmail) {
      throw new AppError("Cet email est déjà utilisé.", 400);
    }
  }

  return await prisma.Employee.create({
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
    include: { permissions: true },
  });
};

/**
 * Met à jour un employé. Si le mot de passe est fourni, il est re-hashé.
 * Si hasAppAccess passe à false, on nettoie email/password pour rester cohérent.
 */
const updateEmployee = async (id, data) => {
  const payload = { ...data };

  if (payload.cin) {
    const existingCin = await prisma.Employee.findUnique({
      where: { cin: payload.cin },
    });
    if (existingCin && existingCin.id !== id) {
      throw new AppError("Ce CIN est déjà enregistré.", 400);
    }
  }

  if (payload.matricule) {
    const existingMatricule = await prisma.Employee.findUnique({
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

  return await prisma.Employee.update({
    where: { id },
    data: payload,
    include: { permissions: true },
  });
};

/**
 * Suppression logique (soft delete) : on désactive aussi l'accès à l'app.
 */
const softDeleteEmployee = async (id) => {
  return await prisma.Employee.update({
    where: { id },
    data: { deletedAt: new Date(), isActive: false },
  });
};

const getAllActiveEmployees = async () => {
  return await prisma.Employee.findMany({
    where: { deletedAt: null },
    select: {
      id: true,
      name: true,
      cin: true,
      phone: true,
      department: true,
      position: true,
      hasAppAccess: true,
      email: true,
      isActive: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });
};

const getEmployeeById = async (id) => {
  return await prisma.Employee.findUnique({
    where: { id },
    include: { permissions: true },
  });
};

/**
 * Attribue une permission (module, action) à un employé.
 * Deux employés au même poste/département peuvent donc avoir des droits différents.
 */
const assignPermission = async (employeeId, module, action) => {
  const employee = await prisma.Employee.findUnique({
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

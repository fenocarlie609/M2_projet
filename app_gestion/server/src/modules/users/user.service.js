const { prisma } = require("../../config/database");
const AppError = require("../../common/utils/AppError");
const { hashPassword } = require("../../common/utils/password.utils");
const {
  deleteAccessRequestNotifications,
} = require("../notifications/notification.service");

const getPendingAccessRequests = async () => {
  return prisma.employee.findMany({
    where: {
      deletedAt: null,
      // Un employe sans compte actif attend qu'on lui en attribue un.
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
      hasAppAccess: true,
      isActive: true,
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
  // L'attribution d'un acces cree le compte de l'employe : elle concerne
  // donc un employe qui n'a pas encore de compte actif. Exiger un acces
  // deja accorde rendait la demande impossible a satisfaire.
  if (employee.isActive) {
    throw new AppError("Cet employé a déjà un accès à l'application.", 400);
  }

  if (email) {
    // L'adresse peut appartenir a l'employe lui-meme : elle ne le bloque
    // alors pas.
    const existingEmail = await prisma.employee.findFirst({
      where: { email, NOT: { id: employeeId } },
    });
    if (existingEmail) {
      throw new AppError("Cet email est déjà utilisé.", 400);
    }
  }

  const updatedEmployee = await prisma.employee.update({
    where: { id: employeeId },
    data: {
      email: email ?? undefined,
      password: await hashPassword(password),
      // Le compte devient utilisable : sans ce drapeau, l'authentification
      // refuse l'employe alors meme que l'acces vient d'etre accorde.
      hasAppAccess: true,
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

  // CORRECTION : la demande d'accès est traitée, la notification
  // "a besoin d'un accès" n'a plus lieu d'être -> on la supprime + on
  // diffuse notification:removed pour qu'elle disparaisse en temps réel
  // chez tous les IT connectés (voir notification.service.js).
  await deleteAccessRequestNotifications(employeeId);

  return updatedEmployee;
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

  const updatedEmployee = await prisma.employee.update({
    where: { id: employeeId },
    data: {
      // L'adresse electronique identifie l'employe dans l'entreprise : elle
      // est conservee. C'est le compte qui est revoque : le mot de passe
      // disparait et l'employe ne peut plus se connecter.
      password: null,
      isActive: false,
      hasAppAccess: false,
    },
  });

  // CORRECTION : nettoyage défensif — couvre le cas rare où une notification
  // ACCESS_REQUEST traînerait encore pour cet employé au moment de la
  // révocation (ex: accès révoqué avant même d'avoir été accordé).
  await deleteAccessRequestNotifications(employeeId);

  return updatedEmployee;
};

const assignPermission = async (employeeId, module, action) => {
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
  });
  if (module !== "*") {
    const existingModule = await prisma.appModule.findUnique({
      where: { code: module },
    });

    if (!existingModule) {
      throw new Error(`Le module "${module}" n'existe pas en base de données.`);
    }
  }
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

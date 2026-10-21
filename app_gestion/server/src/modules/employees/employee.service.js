const { prisma } = require("../../config/database");
const { hashPassword } = require("../../common/utils/password.utils");
const AppError = require("../../common/utils/AppError");
const {
  createNotification,
  deleteAccessRequestNotifications,
} = require("../notifications/notification.service");

/**
 * Génère un code court et propre pour les départements ou postes.
 * Exemples :
 * - "SALES_REPRESENTATIVE" -> "SREP"
 * - "FINANCIAL_ANALYST" -> "FANAL"
 * - "SOFTWARE_ENG" -> "SENG"
 * - "DBA" -> "DBA"
 * - "Technologie & Systèmes" -> "TECH"
 */
const formatCode = (rawCodeOrName) => {
  if (!rawCodeOrName) return "GEN";

  // Si c'est un identifiant avec des mots séparés par des "_" ou des espaces
  const words = rawCodeOrName.split(/[\s_]+/);
  if (words.length > 1) {
    const initials = words
      .map((w) => w[0])
      .join("")
      .toUpperCase();
    if (initials.length >= 2) return initials;
  }

  // Sinon, prend les 4 premiers caractères alphanumériques
  return rawCodeOrName
    .replace(/[^a-zA-Z0-9]/g, "")
    .substring(0, 4)
    .toUpperCase();
};

/**
 * Génère automatiquement un matricule sous la forme : DEPT-POSTE-INDEX
 */
const generateMatricule = async (departmentId, positionId) => {
  const department = await prisma.department.findUnique({
    where: { id: departmentId },
  });
  if (!department) throw new AppError("Département non trouvé.", 404);

  const position = await prisma.position.findUnique({
    where: { id: positionId },
  });
  if (!position) throw new AppError("Poste non trouvé.", 404);

  const deptCode = formatCode(department.code || department.name);
  const posCode = formatCode(position.code || position.title);
  const prefix = `${deptCode}-${posCode}-`;

  // Le numero est le plus grand deja utilise pour ce poste, et non le
  // nombre d'employes : apres une suppression, un simple comptage
  // attribuerait un matricule deja porte par un autre employe.
  const employes = await prisma.employee.findMany({
    where: { positionId },
    select: { matricule: true },
  });

  const plusGrand = employes.reduce((maximum, employe) => {
    const matricule = employe.matricule || "";
    if (!matricule.startsWith(prefix)) return maximum;
    const numero = Number.parseInt(matricule.slice(prefix.length), 10);
    return Number.isNaN(numero) ? maximum : Math.max(maximum, numero);
  }, 0);

  const sequence = String(plusGrand + 1).padStart(2, "0");
  return `${prefix}${sequence}`;
};

/**
 * Notifie les IT/Superadmins pour les demandes d'accès.
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
 * Crée un nouvel employé avec génération automatique du matricule.
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

  // Génération automatique si non fourni par le client
  if (!rest.matricule) {
    rest.matricule = await generateMatricule(
      rest.departmentId,
      rest.positionId,
    );
  } else {
    const existingMatricule = await prisma.employee.findUnique({
      where: { matricule: rest.matricule },
    });
    if (existingMatricule) {
      throw new AppError("Ce matricule est déjà utilisé.", 400);
    }
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

  if (employee.hasAppAccess) {
    await notifyItForAccessRequest(employee);
  }

  return employee;
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

  if (justDisabledAccess) {
    await deleteAccessRequestNotifications(id);
  }

  return updatedEmployee;
};

/**
 * Soft delete de l'employé.
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

const jwt = require("jsonwebtoken");
const { prisma } = require("../../config/database");
const { comparePassword } = require("../../common/utils/password.utils");
const AppError = require("../../common/utils/AppError");

const createToken = (payload) => {
  const expiresIn = process.env.JWT_EXPIRES_IN || "60m";
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
};

// Champs à garder pour department/position dans les réponses employé :
// on masque id, departmentId, createdAt, updatedAt.
const departmentSelect = { select: { code: true, label: true } };
const positionSelect = { select: { code: true, label: true } };

/**
 * Authentifie un employé.
 * Seuls les employés avec hasAppAccess = true ET isActive = true peuvent se connecter.
 */
const loginEmployee = async ({ identifier, password }) => {
  // CORRECTION : prisma.employee (minuscule) au lieu de prisma.Employee
  // + "select" au lieu de "include" : on ne renvoie que le strict nécessaire
  // (identité + permissions pour le routing). Le profil complet (cin, phone,
  // department, position...) est récupéré ensuite via /auth/me.
  const employee = await prisma.employee.findFirst({
    where: {
      OR: [{ email: identifier }, { matricule: identifier }],
    },
    select: {
      id: true,
      name: true,
      email: true,
      matricule: true,
      password: true, // nécessaire pour comparePassword ci-dessous, retiré avant le retour
      hasAppAccess: true,
      isActive: true,
      deletedAt: true,

      permissions: { select: { module: true, action: true } },
    },
  });

  // On renvoie le même message générique dans tous les cas d'échec pour ne pas
  // laisser deviner si l'email existe, s'il a accès à l'app, etc.
  if (!employee || employee.deletedAt) {
    throw new AppError("Identifiant ou mot de passe incorrect.", 401);
  }

  // Un employé sans accès à l'application (ex: agent de quai sans compte) ne peut pas se connecter
  if (!employee.hasAppAccess || !employee.password) {
    throw new AppError("Identifiant ou mot de passe incorrect.", 401);
  }

  const passwordIsValid = await comparePassword(password, employee.password);
  if (!passwordIsValid) {
    throw new AppError("Identifiant ou mot de passe incorrect.", 401);
  }

  if (!employee.isActive) {
    throw new AppError(
      "Votre compte n'est pas encore activé. Contactez un administrateur.",
      403,
    );
  }

  const token = createToken({
    id: employee.id,
    email: employee.email,
  });

  employee.password = undefined;

  // On ne renvoie que l'identifiant utilisé pour se connecter :
  // email si l'employé s'est connecté avec son email, matricule sinon.
  if (employee.email === identifier) {
    employee.matricule = undefined;
  } else {
    employee.email = undefined;
  }

  return { employee, token };
};

const getFreshProfile = async (employeeId) => {
  // CORRECTION : prisma.employee (minuscule) au lieu de prisma.Employee
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    include: {
      permissions: true,
      department: departmentSelect,
      position: positionSelect,
    },
  });

  // L'erreur est levée ici si l'employé est introuvable ou supprimé
  if (!employee || employee.deletedAt) {
    throw new AppError("Cet employé n'existe plus ou a été supprimé.", 404);
  }

  // 1. Sécurité : On retire le mot de passe
  employee.password = undefined;

  // 2. Nettoyage des permissions : On map le tableau pour exclure id et employeeId
  if (employee.permissions && Array.isArray(employee.permissions)) {
    employee.permissions = employee.permissions.map(({ module, action }) => ({
      module,
      action,
    }));
  }

  return employee;
};

module.exports = {
  loginEmployee,
  getFreshProfile,
};

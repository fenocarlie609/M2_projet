// src/common/middlewares/auth.middleware.js
const jwt = require("jsonwebtoken");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const { prisma } = require("../../config/database");

const protect = catchAsync(async (req, res, next) => {
  let token;

  // 1. Récupération du token depuis les cookies signés
  if (req.signedCookies && req.signedCookies.token) {
    token = req.signedCookies.token;
  }

  // Fallback sur le header Authorization (Pratique pour Postman)
  if (
    !token &&
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(
      new AppError(
        "Vous n'êtes pas connecté. Veuillez vous connecter pour accéder à cette ressource.",
        401,
      ),
    );
  }

  // 2. Vérification de la validité du token
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  // 3. CORRECTION : prisma.employee au lieu de prisma.user (le modèle User n'existe plus)
  //    On inclut les permissions pour ne pas avoir à requêter à nouveau dans authorize()
  const currentEmployee = await prisma.Employee.findUnique({
    where: { id: decoded.id },
    include: { permissions: true },
  });

  if (!currentEmployee) {
    return next(
      new AppError("L'employé propriétaire de ce token n'existe plus.", 401),
    );
  }

  if (currentEmployee.deletedAt) {
    return next(new AppError("Ce compte a été supprimé ou désactivé.", 401));
  }

  // Un employé sans accès à l'app (ex: agent de quai sans compte) ne doit
  // jamais pouvoir passer ce middleware, même avec un vieux token encore valide
  if (!currentEmployee.hasAppAccess || !currentEmployee.isActive) {
    return next(new AppError("Accès à l'application refusé.", 403));
  }

  // 4. CORRECTION : plus de "role" (Employee n'en a pas) -> on injecte les
  // permissions granulaires (module, action) propres à cet employé
  req.user = {
    id: currentEmployee.id,
    email: currentEmployee.email,
    department: currentEmployee.department,
    position: currentEmployee.position,
    permissions: currentEmployee.permissions, // [{ module, action }, ...]
    ip: req.ip || req.headers["x-forwarded-for"] || "127.0.0.1",
  };

  next();
});

/**
 * CORRECTION : remplace l'ancien restrictTo(...roles).
 * Employee n'a plus de champ "role" : chaque employé a sa propre liste de
 * permissions (module, action) dans EmployeePermission. Deux employés au
 * même poste/département peuvent donc avoir des droits différents.
 * Une permission wildcard { module: "*", action: "*" } donne tous les droits
 * (équivalent de l'ancien SUPERADMIN).
 */
const authorize = (module, action) => {
  return (req, res, next) => {
    const hasPermission = (req.user.permissions || []).some(
      (p) =>
        (p.module === module || p.module === "*") &&
        (p.action === action || p.action === "*"),
    );

    if (!hasPermission) {
      return next(
        new AppError(
          "Vous n'avez pas la permission d'effectuer cette action.",
          403,
        ),
      );
    }
    next();
  };
};

module.exports = {
  protect,
  authorize,
};

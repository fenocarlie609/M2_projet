// src/common/middlewares/owner.middleware.js
const AppError = require("../utils/AppError");

/**
 * CORRECTION : l'ancienne hiérarchie SUPERADMIN > ADMIN > USER n'existe plus
 * (Employee n'a pas de champ "role"). On la remplace par :
 *   - l'employé peut toujours agir sur SA PROPRE fiche
 *   - sinon il lui faut la permission (module, action) explicite
 *   - un employé avec la permission wildcard { module: "*", action: "*" }
 *     passe partout (équivalent de l'ancien SUPERADMIN)
 *   - anti auto-élévation : un employé ne peut jamais modifier ses propres
 *     permissions ou son propre hasAppAccess sans déjà avoir EMPLOYEES:UPDATE
 */
const isSelfOrAuthorized = (module, action) => {
  return (req, res, next) => {
    const currentEmployeeId = req.user.id;
    const targetEmployeeId = req.params.id;
    const permissions = req.user.permissions || [];

    const hasWildcard = permissions.some(
      (p) => p.module === "*" && p.action === "*",
    );

    if (hasWildcard) {
      return next();
    }

    if (currentEmployeeId === targetEmployeeId) {
      const triesToEscalate =
        req.body?.permissions !== undefined ||
        req.body?.hasAppAccess !== undefined ||
        req.body?.isActive !== undefined;

      if (triesToEscalate) {
        const hasEmployeesUpdate = permissions.some(
          (p) => p.module === "EMPLOYEES" && p.action === "UPDATE",
        );
        if (!hasEmployeesUpdate) {
          return next(
            new AppError(
              "Vous ne pouvez pas modifier vos propres permissions ou votre accès à l'application.",
              403,
            ),
          );
        }
      }
      return next();
    }

    const hasPermission = permissions.some(
      (p) =>
        (p.module === module || p.module === "*") &&
        (p.action === action || p.action === "*"),
    );

    if (!hasPermission) {
      return next(
        new AppError(
          "Vous n'avez pas les privilèges requis pour modifier ou supprimer cette ressource.",
          403,
        ),
      );
    }

    next();
  };
};

module.exports = { isSelfOrAuthorized };

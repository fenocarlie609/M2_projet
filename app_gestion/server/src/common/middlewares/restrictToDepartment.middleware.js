const { prisma } = require("../../config/database");
const AppError = require("../utils/AppError");

/**
 * Restreint l'accès aux routes à un ou plusieurs départements précis
 * (ex: restrictToDepartment("TECH") pour réserver à l'IT).
 * À utiliser APRÈS authMiddleware.protect (qui doit avoir peuplé req.user).
 *
 * ⚠️ Suppose que req.user contient soit `department: { code }` (si ton
 * middleware `protect` inclut déjà la relation), soit au minimum
 * `departmentId`. Si aucun des deux n'est présent, adapte `protect` pour
 * inclure la relation department lors du chargement de l'employé courant.
 */
const restrictToDepartment = (...allowedDepartmentCodes) => {
  return async (req, res, next) => {
    if (!req.user) {
      return next(new AppError("Authentification requise.", 401));
    }

    let departmentCode = req.user.department?.code;

    if (!departmentCode && req.user.departmentId) {
      const department = await prisma.department.findUnique({
        where: { id: req.user.departmentId },
        select: { code: true },
      });
      departmentCode = department?.code;
    }

    if (!departmentCode || !allowedDepartmentCodes.includes(departmentCode)) {
      return next(new AppError("Accès réservé au département IT.", 403));
    }

    next();
  };
};

module.exports = restrictToDepartment;

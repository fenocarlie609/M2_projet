// src/common/middlewares/audit.middleware.js
const { prisma } = require("../../config/database");
const catchAsync = require("../utils/catchAsync");
const logger = require("../../config/logger");

/**
 * Middleware global pour enregistrer les actions critiques dans la table AuditLog
 * On cible principalement les méthodes de modification de données
 */
const auditTrail = () => {
  return catchAsync(async (req, res, next) => {
    const methodsToLog = ["POST", "PUT", "DELETE", "PATCH"];

    if (!methodsToLog.includes(req.method)) {
      return next();
    }

    const oldValues = req.oldData || null;
    const originalJson = res.json;

    res.json = function (data) {
      res.json = originalJson;

      // CORRECTION : employeeId au lieu de userId (AuditLog.employeeId dans le nouveau schema)
      const employeeId = req.user ? req.user.id : null;
      const ipAddress = req.ip || req.connection.remoteAddress;

      const action = `${req.method}_${req.originalUrl.split("/")[3]?.toUpperCase() || "UNKNOWN"}`;

      prisma.auditLog
        .create({
          data: {
            employeeId,
            action,
            method: req.method,
            route: req.originalUrl,
            ipAddress,
            payload: req.body ? req.body : null,
            oldValues: oldValues,
            newValues: data ? data : null,
          },
        })
        .catch((err) => {
          logger.error(
            "Échec de l'enregistrement du log d'audit dans PostgreSQL :",
            err,
          );
        });

      return res.json(data);
    };

    next();
  });
};

module.exports = auditTrail;

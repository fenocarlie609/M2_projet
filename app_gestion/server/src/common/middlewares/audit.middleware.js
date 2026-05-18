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
    // 1. On ne logue automatiquement que les méthodes de modification pour ne pas surcharger la BDD
    const methodsToLog = ["POST", "PUT", "DELETE", "PATCH"];

    if (!methodsToLog.includes(req.method)) {
      return next();
    }

    // Capture des anciennes données (Old Values) avant modification
    // Note : Cette étape nécessite de connaître le modèle et l'ID.
    // Pour l'instant, on prépare la structure. Dans un vrai contrôleur,
    // on peut aussi passer ces valeurs via req.oldData.
    const oldValues = req.oldData || null;

    // On intercepte la fin de la requête pour capturer la réponse finale
    const originalJson = res.json;

    res.json = function (data) {
      // On restaure la fonction originale pour envoyer la réponse au client sans bloquer
      res.json = originalJson;

      // On exécute l'enregistrement du log de manière asynchrone en arrière-plan
      // pour ne pas ralentir le temps de réponse de l'utilisateur
      const userId = req.user ? req.user.id : null;
      const ipAddress = req.ip || req.connection.remoteAddress;

      // Détermination de l'action de manière lisible
      const action = `${req.method}_${req.originalUrl.split("/")[3]?.toUpperCase() || "UNKNOWN"}`;

      prisma.auditLog
        .create({
          data: {
            userId,
            action,
            method: req.method,
            route: req.originalUrl,
            ipAddress,
            payload: req.body ? req.body : null,
            oldValues: oldValues,
            newValues: data ? data : null, // La réponse renvoyée par le contrôleur (nouveau state)
          },
        })
        .catch((err) => {
          // Si le log échoue, on écrit dans Winston pour ne pas planter l'application principale
          logger.error(
            "Échec de l'enregistrement du log d'audit dans PostgreSQL :",
            err,
          );
        });

      // On renvoie la réponse au client
      return res.json(data);
    };

    next();
  });
};

module.exports = auditTrail;

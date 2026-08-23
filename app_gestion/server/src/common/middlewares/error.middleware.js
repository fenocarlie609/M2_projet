// src/common/middlewares/error.middleware.js
const logger = require("../../config/logger");

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  // A. Erreurs opérationnelles contrôlées (ex: mauvaise entrée utilisateur) : on envoie le message au client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }
  // B. Erreurs inconnues ou de programmation (ex: bug de code, crash BDD) : on ne fuite aucun détail
  else {
    // 1. On log l'erreur pour l'équipe technique
    logger.error("ERROR 💥:", err);

    // 2. On envoie un message générique au client
    res.status(500).json({
      status: "error",
      message: "Quelque chose a mal tourné sur le serveur.",
    });
  }
};

const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === "production") {
    let error = { ...err };
    error.message = err.message;
    error.stack = err.stack;

    // Intercepteurs pour erreurs Prisma courantes
    if (err && err.code) {
      // Violation d'unicité (ex: P2002)
      if (err.code === "P2002") {
        // err.meta.target peut être ['code'] ou ['table.column'] selon la version
        const targets = err.meta && err.meta.target ? err.meta.target : [];

        // Mapping DB column -> friendly field key (frontend s'attend à ces clefs)
        const columnMap = {
          code: "code",
          email: "email",
          matricule: "matricule",
        };

        // Construire un objet fields lisible pour le frontend
        const fields = {};
        (targets || []).forEach((t) => {
          const short = String(t).split(".").pop();
          const fieldKey = columnMap[short] || short;
          fields[fieldKey] = `Ce ${fieldKey} est déjà utilisé.`;
        });

        error.statusCode = 400;
        error.status = "fail";
        error.isOperational = true;
        error.message = Object.values(fields).join(" ");

        return res
          .status(400)
          .json({ status: error.status, message: error.message, fields });
      }

      // Record not found for an operation (ex: P2025)
      if (err.code === "P2025") {
        error.statusCode = 404;
        error.status = "fail";
        error.isOperational = true;
        error.message =
          "Ressource introuvable (opération sur un enregistrement manquant).";
        return res
          .status(404)
          .json({ status: error.status, message: error.message });
      }
    }

    if (err.name === "ZodError" || err.errors) {
      error.statusCode = 400;
      error.status = "fail";
      error.isOperational = true;
      // On transmet les erreurs de champs formatées au client en prod
      error.message = err.message;
      return res.status(400).json({
        status: error.status,
        message: error.message,
        errors: err.errors,
      });
    }

    sendErrorProd(error, res);
  }
};

module.exports = { errorHandler };

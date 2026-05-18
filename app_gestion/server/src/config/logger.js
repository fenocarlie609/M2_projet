// src/config/logger.js
const { createLogger, format, transports } = require("winston");
const { combine, timestamp, printf, colorize, errors } = format;

// Format personnalisé pour la console et les fichiers
const logFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}]: ${stack || message}`;
});

const logger = createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: combine(
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    errors({ stack: true }), // Capture la stack trace si c'est une erreur
    logFormat,
  ),
  transports: [
    // En production, on enregistre les erreurs dans un fichier dédié
    new transports.File({ filename: "logs/errors.log", level: "error" }),
    new transports.File({ filename: "logs/combined.log" }),
  ],
});

// Si on est en développement, on ajoute aussi l'affichage dans la console avec des couleurs
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new transports.Console({
      format: combine(colorize(), logFormat),
    }),
  );
}

module.exports = logger;

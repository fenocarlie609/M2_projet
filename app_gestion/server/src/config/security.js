// src/config/security.js
const rateLimit = require("express-rate-limit");
const logger = require("./logger");

const appLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // Fenêtre de 15 minutes
  max: 100, // Limite chaque IP à 100 requêtes par fenêtre
  standardHeaders: true, // Retourne les infos de limite dans les headers RateLimit-*
  legacyHeaders: false, // Désactive les anciens headers X-RateLimit-*
  message: {
    status: "fail",
    message:
      "Trop de requêtes provenant de cette IP, veuillez réessayer dans 15 minutes.",
  },
  handler: (req, res, next, options) => {
    logger.warn(
      `Rate limit atteint pour l'IP: ${req.ip} sur la route ${req.originalUrl}`,
    );
    res.status(options.statusCode).json(options.message);
  },
});

module.exports = {
  appLimiter,
};

// src/config/security.js
const rateLimit = require("express-rate-limit");
const logger = require("./logger");

const isDevelopment = process.env.NODE_ENV === "development";

// Fenetre et volume du limiteur global. Le volume par defaut tient compte du
// fonctionnement reel de l'interface : chaque ecran declenche plusieurs
// appels (tableau de bord, listes, references), si bien qu'un seuil trop bas
// interromprait une simple consultation. Le forcage brutal reste couvert par
// le limiteur de connexion, qui ne compte que les tentatives infructueuses.
const FENETRE = Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000);
const VOLUME = Number(
  process.env.RATE_LIMIT_MAX || (isDevelopment ? 500 : 600),
);

const appLimiter = rateLimit({
  windowMs: FENETRE, // Fenêtre de 15 minutes par défaut
  max: VOLUME,
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

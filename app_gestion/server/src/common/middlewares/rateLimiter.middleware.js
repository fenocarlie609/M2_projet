// src/common/middlewares/rateLimiter.middleware.js
const rateLimit = require("express-rate-limit");
const logger = require("../../config/logger");

// Limiteur destine au forcage brutal (connexion, reinitialisation de mot de
// passe). Seules les tentatives infructueuses sont comptees : une connexion
// reussie ne doit jamais Consommer le quota de l'utilisateur.
const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  // Une reponse moins de 400 rend la tentative au quota.
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: "fail",
    message:
      "Trop de tentatives de connexion infructueuses. Veuillez réessayer dans une minute.",
  },
  handler: (req, res, next, options) => {
    logger.warn(
      `[BRUTE-FORCE DETECTED] Trop de tentatives sur l'authentification depuis l'IP: ${req.ip}`,
    );
    res.status(options.statusCode).json(options.message);
  },
});

module.exports = {
  authLimiter,
};

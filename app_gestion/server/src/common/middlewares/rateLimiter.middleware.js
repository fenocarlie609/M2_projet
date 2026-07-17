// src/common/middlewares/rateLimiter.middleware.js
const rateLimit = require("express-rate-limit");
const logger = require("../../config/logger");

// Limiteur ultra strict pour le brute-force (Login, Register, Password Reset)
const authLimiter = rateLimit({
  // windowMs: 15 * 60 * 1000, // 15 minutes
  windowMs: 60 * 1000, // 60 secondes pour les tests
  max: 5, // Seulement 5 tentatives autorisées !
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: "fail",
    message:
      // "Trop de tentatives de connexion. Veuillez réessayer dans 15 minutes.",
      "Trop de tentatives de connexion. Veuillez réessayer dans 1 minutes.",
  },
  handler: (req, res, next, options) => {
    logger.warn(
      `[BRUTE-FORCE DETECTED] Trop de requêtes sur l'authentification depuis l'IP: ${req.ip}`,
    );
    res.status(options.statusCode).json(options.message);
  },
});

module.exports = {
  authLimiter,
};

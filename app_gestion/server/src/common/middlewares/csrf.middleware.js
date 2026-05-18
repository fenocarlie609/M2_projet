// src/common/middlewares/csrf.middleware.js
const crypto = require("crypto");
const AppError = require("../utils/AppError");

// Génère un token CSRF unique
const generateCsrfToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

// Middleware de vérification du jeton CSRF
const verifyCsrf = (req, res, next) => {
  // On ne protège que les méthodes qui modifient l'état (les requêtes GET, HEAD, OPTIONS sont sûres)
  const safeMethods = ["GET", "HEAD", "OPTIONS"];
  if (safeMethods.includes(req.method)) {
    return next();
  }

  // Récupération du token envoyé dans le cookie de session CSRF et celui envoyé dans le header par le Front
  const csrfCookie = req.signedCookies ? req.signedCookies["xsrf-token"] : null;
  const csrfHeader = req.headers["x-csrf-token"];

  if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
    return next(
      new AppError("Action non autorisée : Échec de la validation CSRF.", 403),
    );
  }

  next();
};

module.exports = {
  generateCsrfToken,
  verifyCsrf,
};

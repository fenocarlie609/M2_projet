// src/common/middlewares/csrf.middleware.js
const crypto = require("crypto");
const AppError = require("../utils/AppError");

const generateCsrfToken = () => crypto.randomBytes(32).toString("hex");

const verifyCsrf = (req, res, next) => {
  const safeMethods = ["GET", "HEAD", "OPTIONS"];
  const exemptedPaths = ["/auth/login", "/auth/csrf-token", "/health"];

  if (safeMethods.includes(req.method) || exemptedPaths.includes(req.path)) {
    return next();
  }

  const csrfCookie = req.cookies ? req.cookies["xsrf-token"] : null;
  const csrfHeader = req.headers["x-csrf-token"];

  if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
    return next(
      new AppError("Action non autorisée : échec de la validation CSRF.", 403),
    );
  }

  next();
};

module.exports = {
  generateCsrfToken,
  verifyCsrf,
};

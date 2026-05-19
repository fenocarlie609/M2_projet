// src/common/middlewares/auth.middleware.js
const jwt = require("jsonwebtoken");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const { prisma } = require("../../config/database"); // Câblé sur ton Prisma !

const protect = catchAsync(async (req, res, next) => {
  let token;

  // 1. Récupération du token depuis les cookies signés
  if (req.signedCookies && req.signedCookies.token) {
    token = req.signedCookies.token;
  }

  // Fallback sur le header Authorization (Pratique pour Postman)
  if (
    !token &&
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(
      new AppError(
        "Vous n'êtes pas connecté. Veuillez vous connecter pour accéder à cette ressource.",
        401,
      ),
    );
  }

  // 2. Vérification de la validité du token
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  // 3. Vérification de l'existence de l'utilisateur en BDD + Soft Delete check
  const currentUser = await prisma.user.findUnique({
    where: { id: decoded.id },
  });

  if (!currentUser) {
    return next(
      new AppError(
        "L'utilisateur propriétaire de ce token n'existe plus.",
        401,
      ),
    );
  }

  // Sécurité additionnelle : Si l'utilisateur est archivé (Soft Deleted), on refuse l'accès
  if (currentUser.deletedAt) {
    return next(new AppError("Ce compte a été supprimé ou désactivé.", 401));
  }

  // 4. Injection des données complètes de l'utilisateur dans la requête
  // On récupère req.ip pour que l'extension d'audit récupère l'IP réelle du client
  req.user = {
    id: currentUser.id,
    role: currentUser.role,
    email: currentUser.email,
    ip: req.ip || req.headers["x-forwarded-for"] || "127.0.0.1",
  };

  next();
});

// Middleware pour restreindre l'accès à certains rôles (ex: admin)
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          "Vous n'avez pas la permission d'effectuer cette action.",
          403,
        ),
      );
    }
    next();
  };
};

module.exports = {
  protect,
  restrictTo,
};

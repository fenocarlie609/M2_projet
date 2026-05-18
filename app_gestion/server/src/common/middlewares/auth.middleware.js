// src/common/middlewares/auth.middleware.js
const jwt = require("jsonwebtoken");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
// const { prisma } = require('../../config/database'); // Prêt pour plus tard

const protect = catchAsync(async (req, res, next) => {
  let token;

  // 1. Récupération du token depuis les cookies signés
  if (req.signedCookies && req.signedCookies.token) {
    token = req.signedCookies.token;
  }

  // Sécurité additionnelle : acceptation optionnelle du header Authorization (Utile pour les tests ou outils comme Postman)
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
  // jwt.verify est synchrone par défaut, mais catchAsync attrapera l'erreur si le token est expiré ou invalide
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  // 3. Plus tard : Vérifier si l'utilisateur existe toujours en BDD
  // const currentUser = await prisma.user.findUnique({ where: { id: decoded.id } });
  // if (!currentUser) return next(new AppError('L\'utilisateur propriétaire de ce token n\'existe plus.', 401));

  // Pour l'instant, on simule l'injection des données décodées du token dans la requête
  req.user = { id: decoded.id, role: decoded.role };

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

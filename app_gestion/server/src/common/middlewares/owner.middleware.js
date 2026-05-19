// src/common/middlewares/owner.middleware.js
const AppError = require("../utils/AppError");

/**
 * Gestion fine des droits d'accès et de la hiérarchie des rôles
 * Propriétaire OR Admin (avec restrictions) OR Superadmin
 */
const isOwnerOrAdmin = (req, res, next) => {
  const currentUserId = req.user.id;
  const currentUserRole = req.user.role;
  const targetUserId = req.params.id;

  // IMPORTANT : Pour savoir quel rôle on s'apprête à modifier,
  // on a besoin de connaître la cible. Dans Express, si tu as chargé
  // l'utilisateur cible dans un middleware précédent, utilise-le.
  // Sinon, on applique une logique hiérarchique basée sur les actions.

  // 1. Un SUPERADMIN a un pass illimité sur absolument tout le monde
  if (currentUserRole === "SUPERADMIN") {
    return next();
  }

  // 2. Un utilisateur (quel que soit son rôle) a le droit de modifier son PROPRE profil
  if (currentUserId === targetUserId) {
    // Sécurité additionnelle : Un ADMIN ou USER ne peut pas s'auto-promouvoir SUPERADMIN
    if (req.body.role === "SUPERADMIN" && currentUserRole !== "SUPERADMIN") {
      return next(
        new AppError(
          "Vous ne pouvez pas vous accorder le rôle SUPERADMIN.",
          403,
        ),
      );
    }
    return next();
  }

  // 3. Si l'utilisateur connecté est un ADMIN classique
  if (currentUserRole === "ADMIN") {
    // Un ADMIN peut interagir avec les autres, MAIS dans ton contrôleur ou un middleware dédié,
    // il faudra bloquer si la cible est un autre ADMIN ou un SUPERADMIN.
    // Pour l'instant, on l'autorise à passer à la condition qu'il ne tente pas de créer/passer quelqu'un en SUPERADMIN
    if (req.body.role === "SUPERADMIN") {
      return next(
        new AppError(
          "Un administrateur ne peut pas nommer de SUPERADMIN.",
          403,
        ),
      );
    }

    return next();
  }

  // 4. Si aucun cas ne match (ex: un USER qui tente de toucher au profil de quelqu'un d'autre)
  return next(
    new AppError(
      "Vous n'avez pas les privilèges requis pour modifier ou supprimer cette ressource.",
      403,
    ),
  );
};

module.exports = { isOwnerOrAdmin };

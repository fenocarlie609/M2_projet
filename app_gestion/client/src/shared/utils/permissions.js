// src/shared/utils/permissions.js

/**
 * Vérifie si un utilisateur possède une permission spécifique.
 * @param {Object} user - L'objet utilisateur du AuthContext
 * @param {Object|null} requiredPermission - La permission requise { module, action }
 * @returns {boolean} - true si l'utilisateur a l'accès, sinon false
 */
export const hasPermission = (user, requiredPermission) => {
  // 1. Si aucune permission n'est requise pour cette route, tout le monde connecté y a accès
  if (!requiredPermission) return true;

  // 2. Sécurité : si pas d'utilisateur ou pas de tableau de permissions, accès refusé
  if (!user || !user.permissions || !Array.isArray(user.permissions))
    return false;

  // 3. Vérifier si l'utilisateur a un accès global ("*" sur module ET action)
  const hasSuperAdminAccess = user.permissions.some(
    (p) => p.module === "*" && p.action === "*",
  );
  if (hasSuperAdminAccess) return true;

  // 4. Vérification stricte du module et de l'action requise
  return user.permissions.some(
    (p) =>
      p.module === requiredPermission.module &&
      (p.action === requiredPermission.action || p.action === "*"),
  );
};

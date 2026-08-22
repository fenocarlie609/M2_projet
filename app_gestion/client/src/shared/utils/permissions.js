// src/shared/utils/permissions.js

export const normalizePermissions = (permissions = []) => {
  if (!Array.isArray(permissions)) return [];

  return permissions
    .filter(Boolean)
    .map((permission) => {
      if (typeof permission === "string") {
        return { module: permission, action: "*" };
      }

      if (!permission || typeof permission !== "object") {
        return null;
      }

      const { module, action } = permission;
      if (!module) return null;

      return {
        module: String(module),
        action: action ? String(action) : "*",
      };
    })
    .filter(Boolean);
};

/**
 * Vérifie si un utilisateur possède une permission spécifique.
 * @param {Object} user - L'objet utilisateur du AuthContext
 * @param {Object|null} requiredPermission - La permission requise { module, action }
 * @returns {boolean} - true si l'utilisateur a l'accès, sinon false
 */
export const hasPermission = (user, requiredPermission) => {
  if (!requiredPermission) return true;

  const permissions = normalizePermissions(user?.permissions);
  if (!permissions.length) return false;

  const hasSuperAdminAccess = permissions.some(
    (permission) => permission.module === "*" && permission.action === "*",
  );
  if (hasSuperAdminAccess) return true;

  return permissions.some(
    (permission) =>
      permission.module === requiredPermission.module &&
      (permission.action === requiredPermission.action ||
        permission.action === "*"),
  );
};

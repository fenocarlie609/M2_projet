// src/shared/utils/getApiErrorMessage.js

/**
 * Extrait un message d'erreur lisible depuis une erreur Axios.
 *
 * Le backend (catchAsync + AppError + error.middleware) peut renvoyer
 * plusieurs formats selon le contexte :
 * - Erreur métier standard (AppError) : { status, message }
 * - Erreur de validation Zod en PRODUCTION : { status, message, errors: [...] }
 *   (voir error.middleware.js, branche `err.name === "ZodError" || err.errors`)
 * - Erreur de validation Zod en DEV (sendErrorDev) : { status, error, message, stack }
 *   où error.errors contient le détail des champs (attaché par validate.middleware)
 */
export function getApiErrorMessage(
  error,
  fallback = "Une erreur est survenue. Veuillez réessayer.",
) {
  const data = error?.response?.data;
  if (!data) return fallback;

  // Si le backend renvoie un objet 'fields': { code: 'message' }
  if (data.fields && typeof data.fields === "object") {
    // Retourne le premier message de champ disponible
    const firstKey = Object.keys(data.fields)[0];
    if (firstKey && typeof data.fields[firstKey] === "string") {
      return data.fields[firstKey];
    }
  }

  // Détail de validation Zod : soit à la racine (prod), soit sous error (dev)
  const validationErrors = data.errors || data.error?.errors;
  if (Array.isArray(validationErrors) && validationErrors[0]?.message) {
    return validationErrors[0].message;
  }

  // Erreur métier standard : { status, message }
  if (typeof data.message === "string" && data.message.trim()) {
    return data.message;
  }

  return fallback;
}

// Retourne l'objet fields envoyé par l'API (utile pour assigner erreurs par champ)
export function getApiErrorFields(error) {
  const data = error?.response?.data;
  if (!data) return null;
  if (data.fields && typeof data.fields === "object") return data.fields;
  return null;
}

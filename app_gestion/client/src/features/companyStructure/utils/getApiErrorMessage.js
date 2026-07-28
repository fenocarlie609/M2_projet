// src/features/companyStructure/utils/getApiErrorMessage.js

/**
 * Extrait un message d'erreur lisible depuis une erreur Axios.
 * Le backend (catchAsync + AppError + error handler global) renvoie
 * généralement { status, message } dans le body en cas d'erreur 4xx.
 * Zod (middleware validate) renvoie lui un message de validation
 * dans response.data.message ou response.data.errors[0].message.
 */
export function getApiErrorMessage(
  error,
  fallback = "Une erreur est survenue. Veuillez réessayer.",
) {
  const data = error?.response?.data;

  if (!data) return fallback;

  if (typeof data.message === "string" && data.message.trim()) {
    return data.message;
  }

  if (Array.isArray(data.errors) && data.errors[0]?.message) {
    return data.errors[0].message;
  }

  return fallback;
}

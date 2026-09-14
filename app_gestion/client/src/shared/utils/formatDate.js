// src/shared/utils/formatDate.js

/**
 * Formate une date au format court français (ex: 14/09/2026).
 * Retourne "-" si la valeur est absente ou invalide.
 *
 * @param {string|number|Date} value - Date ISO, timestamp ou objet Date.
 * @param {object} [options] - Options Intl.DateTimeFormat pour surcharger le format par défaut.
 * @returns {string}
 */
export function formatDate(value, options) {
  if (!value) return "-";

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat(
    "fr-FR",
    options || {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    },
  ).format(date);
}

/**
 * Formate une heure au format court français (ex: 14:05).
 * Retourne "-" si la valeur est absente ou invalide.
 *
 * @param {string|number|Date} value - Date ISO, timestamp ou objet Date.
 * @param {object} [options] - Options Intl.DateTimeFormat pour surcharger le format par défaut.
 * @returns {string}
 */
export function formatTime(value, options) {
  if (!value) return "-";

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat(
    "fr-FR",
    options || {
      hour: "2-digit",
      minute: "2-digit",
    },
  ).format(date);
}

/**
 * Formate une date et une heure ensemble (ex: 14/09/2026 14:05).
 *
 * @param {string|number|Date} value - Date ISO, timestamp ou objet Date.
 * @returns {string}
 */
export function formatDateTime(value) {
  if (!value) return "-";

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return `${formatDate(date)} ${formatTime(date)}`;
}

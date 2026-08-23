import { getApiErrorMessage, getApiErrorFields } from "./getApiErrorMessage";

// Apply API error payload to a React setErrors state function.
// setErrors should accept an object of the form { field: msg }
export function applyApiErrors(setErrors, error, defaultErrors = {}) {
  const fields = getApiErrorFields(error);
  if (fields) {
    // Merge server field messages with existing default errors
    setErrors((prev) => ({ ...prev, ...defaultErrors, ...fields }));
    return;
  }

  // Fallback to general message
  const message = getApiErrorMessage(error);
  setErrors((prev) => ({ ...prev, ...defaultErrors, general: message }));
}

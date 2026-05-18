// src/common/utils/AppError.js
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;
    // Si le code commence par 4, c'est un échec client (fail), si c'est 500 c'est une erreur interne (error)
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true; // Permet de savoir si c'est une erreur contrôlée

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;

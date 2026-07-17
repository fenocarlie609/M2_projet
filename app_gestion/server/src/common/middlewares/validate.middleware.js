// src/common/middlewares/validate.middleware.js
const AppError = require("../utils/AppError");

/**
 * Middleware de validation générique pour Zod
 * @param {Object} schemas - Un objet contenant les schémas pour body, query, et/ou params
 */
const validate = (schemas) => {
  return async (req, res, next) => {
    try {
      // Validation du Body si un schéma est fourni
      if (schemas.body) {
        req.body = await schemas.body.parseAsync(req.body);
      }

      // Validation des Query Parameters (ex: ?page=1)
      if (schemas.query) {
        req.query = await schemas.query.parseAsync(req.query);
      }

      // Validation des Route Parameters (ex: /users/:id)
      if (schemas.params) {
        req.params = await schemas.params.parseAsync(req.params);
      }

      // Si tout est valide, on passe au middleware/contrôleur suivant
      next();
    } catch (error) {
      // Si c'est une erreur de validation Zod, on extrait proprement les messages
      if (error.name === "ZodError") {
        const errorsFormatted = error.issues.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }));

        // On crée une erreur 400 (Bad Request) propre avec le détail des champs
        const validationError = new AppError(
          "Erreur de validation des données entrantes",
          400,
        );
        validationError.errors = errorsFormatted; // On attache le détail pour le gestionnaire d'erreurs

        return next(validationError);
      }

      // Pour toute autre erreur inattendue
      next(error);
    }
  };
};

module.exports = validate;

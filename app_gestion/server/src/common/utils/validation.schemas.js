// src/common/utils/validation.schemas.js
const { z } = require("zod");

const schemas = {
  user: {
    // Schéma pour la création / inscription
    register: {
      body: z.object({
        email: z
          .string({ required_error: "L'email est obligatoire." })
          .email("L'adresse email doit être valide.")
          .trim(),
        password: z
          .string({ required_error: "Le mot de passe est obligatoire." })
          .min(8, "Le mot de passe doit contenir au moins 8 caractères."),
        name: z.string().max(50).trim().optional().nullable(),
        role: z
          .enum(["USER", "ADMIN", "SUPERADMIN"])
          .optional()
          .default("USER"),
      }),
    },

    // Schéma pour la mise à jour (tous les champs du body deviennent optionnels)
    update: {
      params: z.object({
        id: z.string().uuid("L'identifiant fourni n'est pas un UUID valide."),
      }),
      body: z.object({
        email: z
          .string()
          .email("L'adresse email doit être valide.")
          .trim()
          .optional(),
        password: z
          .string()
          .min(8, "Le mot de passe doit contenir au moins 8 caractères.")
          .optional(),
        name: z.string().max(50).trim().optional().nullable(),
        role: z.enum(["USER", "ADMIN", "SUPERADMIN"]).optional(),
      }),
    },

    // Schéma pour la suppression ou récupération par ID seul
    delete: {
      params: z.object({
        id: z.string().uuid("L'identifiant fourni n'est pas un UUID valide."),
      }),
    },
  },

  // ---------------------------------------------------------
  // Exemple futur pour l'authentification
  // ---------------------------------------------------------
  auth: {
    login: {
      body: z.object({
        email: z.string().email("Email invalide.").trim(),
        password: z.string().min(1, "Mot de passe requis."),
      }),
    },
  },
};

module.exports = schemas;

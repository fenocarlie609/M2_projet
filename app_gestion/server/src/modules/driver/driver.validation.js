// src/features/driver/driver.validation.js
const { z } = require("zod");

const createDriverSchema = z.object({
  name: z.string().min(1, "Le nom du chauffeur est requis"),
  type: z.enum(["COMPANY", "INDIVIDUAL"]).default("INDIVIDUAL"),
  licensePlate: z.string().min(1, "La plaque d'immatriculation est requise"),
  phone: z.string().optional().nullable(),
});

const updateDriverSchema = z
  .object({
    name: z.string().min(1).optional(),
    type: z.enum(["COMPANY", "INDIVIDUAL"]).optional(),
    licensePlate: z.string().min(1).optional(),
    phone: z.string().optional().nullable(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Au moins un champ doit être fourni pour la mise à jour.",
  });

const driverValidation = {
  create: { body: createDriverSchema },
  update: { body: updateDriverSchema },
};

module.exports = { driverValidation };

// src/modules/warehouse/warehouse.validation.js
const { z } = require("zod");

const nonEmptyString = (message) => z.string().trim().min(1, message);

const STATUTS_ARTICLE = ["IN_STOCK", "EMBARKED", "PICKED_UP"];

const warehouseCreate = z.object({
  code: nonEmptyString("Le code de l'entrepôt est requis").toUpperCase(),
  name: nonEmptyString("Le nom de l'entrepôt est requis"),
  address: z.string().trim().optional().nullable(),
  city: z.string().trim().optional().nullable(),
  capacityTons: z.number().positive().optional().nullable(),
  isActive: z.boolean().optional(),
});

const warehouseUpdate = warehouseCreate
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Au moins un champ doit être fourni pour la mise à jour.",
  });

const itemCreate = z.object({
  warehouseId: nonEmptyString("L'entrepôt est requis"),
  clientId: nonEmptyString("Le client est requis"),
  description: nonEmptyString("La description de la marchandise est requise"),
  packageCount: z.coerce.number().int().positive("Le nombre de colis doit être positif"),
  weightKg: z.coerce.number().positive("Le poids doit être positif"),
  loadId: z.string().trim().optional().nullable(),
  arrivalDate: z.coerce.date().optional(),
  note: z.string().trim().max(500).optional().nullable(),
});

const pickupCreate = z.object({
  note: z.string().trim().max(500).optional().nullable(),
});

const embarkCreate = z.object({
  loadingPlanId: nonEmptyString("Le plan de chargement est requis"),
  note: z.string().trim().max(500).optional().nullable(),
});

module.exports = {
  STATUTS_ARTICLE,
  warehouseValidation: {
    create: { body: warehouseCreate },
    update: { body: warehouseUpdate },
    item: { body: itemCreate },
    pickup: { body: pickupCreate },
    embark: { body: embarkCreate },
  },
};

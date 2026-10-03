const { z } = require("zod");

const nonEmptyString = (message) => z.string().trim().min(1, message);

const loadFields = z.object({
  loadingPlanId: nonEmptyString("Le plan de chargement est requis"),
  clientId: nonEmptyString("Le client est requis"),
  packageCount: z.coerce
    .number()
    .int()
    .min(1, "Le nombre de colis doit être d'au moins 1"),
  description: nonEmptyString("La description est requise"),
  weightKg: z.coerce.number().positive("Le poids doit être positif"),
  driverName: z.string().trim().optional().nullable(),
  vehiclePlate: z.string().trim().optional().nullable(),
  loadedById: z.string().trim().optional().nullable(),
  loadingDate: z.coerce.date().optional().nullable(),
  anomaly: z.string().trim().optional().nullable(),
  loadingPosition: z.string().trim().optional().nullable(),
  isHazardous: z.coerce.boolean().default(false),
  status: z.enum(["PENDING", "LOADED", "CANCELLED"]).default("PENDING"),
});

const loadCreate = loadFields;

const loadUpdate = loadFields
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Au moins un champ doit être fourni pour la mise à jour.",
  });

module.exports = {
  loadValidation: {
    create: { body: loadCreate },
    update: { body: loadUpdate },
  },
};

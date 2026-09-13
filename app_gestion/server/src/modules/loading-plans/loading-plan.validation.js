const { z } = require("zod");

const planCreate = z.object({
  reference: z.string().trim().min(1, "La référence du plan est requise"),
  voyageId: z.string().trim().min(1, "Le voyage est requis"),
  status: z.enum(["DRAFT", "SUBMITTED"]).default("DRAFT"),
});

const planUpdate = z
  .object({
    reference: z.string().trim().min(1).optional(),
    voyageId: z.string().trim().min(1).optional(),
    status: z.enum(["DRAFT", "SUBMITTED"]).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Au moins un champ doit être fourni pour la mise à jour.",
  });

const lineCreate = z.object({
  clientId: z.string().trim().min(1, "Le client est requis"),
  driverId: z.string().trim().optional().nullable(),
  vehicleId: z.string().trim().optional().nullable(),
  loadingDate: z.coerce.date().optional().nullable(),
  packageCount: z.coerce
    .number()
    .int()
    .positive("Le nombre de colis doit être positif"),
  description: z.string().trim().min(1, "La description est requise"),
  weightKg: z.coerce.number().positive("Le poids doit être positif"),
  anomaly: z.string().trim().optional().nullable(),
  loadingPosition: z.string().trim().optional().nullable(),
  isHazardous: z.boolean().default(false),
});

const lineUpdate = lineCreate
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Au moins un champ doit être fourni pour la mise à jour.",
  });

module.exports = {
  planValidation: {
    create: { body: planCreate },
    update: { body: planUpdate },
  },
  lineValidation: {
    create: { body: lineCreate },
    update: { body: lineUpdate },
  },
};

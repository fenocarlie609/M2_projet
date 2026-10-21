const { z } = require("zod");
const { QUAIS_TOAMASINA } = require("../../common/utils/constants");

// La position est le quai de chargement au port de Toamasina.
const quai = z
  .enum(QUAIS_TOAMASINA, {
    errorMap: () => ({
      message: `Le quai doit être l'un des suivants : ${QUAIS_TOAMASINA.join(", ")}`,
    }),
  })
  .optional()
  .nullable();

const planCreate = z
  .object({
    reference: z.string().trim().min(1, "La référence du plan est requise"),
    voyageId: z.string().trim().min(1, "Le voyage est requis"),
    status: z.boolean().default(false),
    operationType: z.enum(["LOAD", "UNLOAD"]).default("LOAD"),
  })
  .refine((data) => data.operationType === "LOAD", {
    message:
      "Les plans de déchargement sont générés automatiquement après validation du chargement.",
    path: ["operationType"],
  });

const planUpdate = z
  .object({
    reference: z.string().trim().min(1).optional(),
    voyageId: z.string().trim().min(1).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Au moins un champ doit être fourni pour la mise à jour.",
  });

const loadCreate = z.object({
  clientId: z.string().trim().min(1, "Le client est requis"),
  driverName: z.string().trim().optional().nullable(),
  vehiclePlate: z.string().trim().optional().nullable(),
  loadingDate: z.coerce.date().optional().nullable(),
  packageCount: z.coerce
    .number()
    .int()
    .positive("Le nombre de colis doit être positif"),
  description: z.string().trim().min(1, "La description est requise"),
  weightKg: z.coerce.number().positive("Le poids doit être positif"),
  anomaly: z.string().trim().optional().nullable(),
  loadingPosition: quai,
  isHazardous: z.boolean().default(false),
  status: z.enum(["PENDING", "LOADED", "CANCELLED"]).default("PENDING"),
});

const loadUpdate = loadCreate
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Au moins un champ doit être fourni pour la mise à jour.",
  });

module.exports = {
  LoadValidation: {
    create: { body: planCreate },
    update: { body: planUpdate },
  },
  loadValidation: {
    create: { body: loadCreate },
    update: { body: loadUpdate },
  },
};

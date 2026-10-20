const { z } = require("zod");

const nonEmptyString = (message) => z.string().trim().min(1, message);
const optionalPositiveNumber = z.number().positive().optional().nullable();

const vesselCreate = z.object({
  name: nonEmptyString("Le nom du navire est requis"),
  operatorName: z.string().trim().optional().nullable(),
  registrationNumber: z.string().trim().optional().nullable(),
  capacityTons: optionalPositiveNumber,
  status: z.enum(["ACTIVE", "INACTIVE", "MAINTENANCE"]).default("ACTIVE"),
});

const vesselUpdate = vesselCreate
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Au moins un champ doit être fourni pour la mise à jour.",
  });

const portCreate = z.object({
  code: nonEmptyString("Le code du port est requis").toUpperCase(),
  name: nonEmptyString("Le nom du port est requis"),
  country: z.string().trim().optional().nullable(),
});

const portUpdate = portCreate
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Au moins un champ doit être fourni pour la mise à jour.",
  });

module.exports = {
  vesselValidation: {
    create: { body: vesselCreate },
    update: { body: vesselUpdate },
  },
  portValidation: {
    create: { body: portCreate },
    update: { body: portUpdate },
  },
};

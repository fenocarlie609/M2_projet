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

const voyageFields = z.object({
  vesselId: nonEmptyString("Le navire est requis"),
  departurePortId: nonEmptyString("Le port de départ est requis"),
  arrivalPortId: nonEmptyString("Le port d'arrivée est requis"),
  voyageNumber: nonEmptyString("Le numéro de voyage est requis"),
  departureDate: z.coerce.date().optional().nullable(),
  arrivalDate: z.coerce.date().optional().nullable(),
  status: z.enum(["DRAFT", "OPEN", "CLOSED"]).default("DRAFT"),
});

const validateVoyageDates = (data) =>
  !data.departureDate ||
  !data.arrivalDate ||
  data.arrivalDate >= data.departureDate;

const voyageDateError = {
  message: "La date d'arrivée doit être postérieure à la date de départ.",
  path: ["arrivalDate"],
};

const voyageCreate = voyageFields.refine(validateVoyageDates, voyageDateError);

const voyageUpdate = voyageFields
  .partial()
  .refine(validateVoyageDates, voyageDateError)
  .refine((data) => Object.keys(data).length > 0, {
    message: "Au moins un champ doit être fourni pour la mise à jour.",
  });

const vehicleCreate = z.object({
  licensePlate: nonEmptyString("L'immatriculation est requise").toUpperCase(),
  type: z.string().trim().optional().nullable(),
  capacityTons: optionalPositiveNumber,
  status: z.enum(["ACTIVE", "INACTIVE", "MAINTENANCE"]).default("ACTIVE"),
});

const vehicleUpdate = vehicleCreate
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
  voyageValidation: {
    create: { body: voyageCreate },
    update: { body: voyageUpdate },
  },
  vehicleValidation: {
    create: { body: vehicleCreate },
    update: { body: vehicleUpdate },
  },
};

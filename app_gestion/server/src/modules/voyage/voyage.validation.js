const { z } = require("zod");

const nonEmptyString = (message) => z.string().trim().min(1, message);

const voyageFields = z.object({
  vesselId: nonEmptyString("Le navire est requis"),
  departurePortId: nonEmptyString("Le port de départ est requis"),
  arrivalPortId: nonEmptyString("Le port d'arrivée est requis"),
  voyageNumber: nonEmptyString("Le numéro de voyage est requis"),
  departureDate: z.coerce.date().optional().nullable(),
  arrivalDate: z.coerce.date().optional().nullable(),
  status: z
    .enum(["SCHEDULED", "IN_TRANSIT", "ARRIVED", "CANCELLED"])
    .default("SCHEDULED"),
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

module.exports = {
  voyageValidation: {
    create: { body: voyageCreate },
    update: { body: voyageUpdate },
  },
};

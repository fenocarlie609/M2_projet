const { z } = require("zod");

const clientFields = {
  name: z.string().trim().min(1, "Le nom du client est requis"),
  type: z.enum(["COMPANY", "INDIVIDUAL"]),
  email: z
    .string()
    .trim()
    .email("L'email est invalide")
    .optional()
    .nullable(),
  phone: z.string().trim().optional().nullable(),
  address: z.string().trim().optional().nullable(),
};

const createClientSchema = z
  .object({
    ...clientFields,
    type: clientFields.type.default("INDIVIDUAL"),
  })
  .strict();

const updateClientSchema = z
  .object(clientFields)
  .partial()
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Au moins un champ doit être fourni pour la mise à jour.",
  });

const clientValidation = {
  create: { body: createClientSchema },
  update: { body: updateClientSchema },
};

module.exports = { clientValidation };
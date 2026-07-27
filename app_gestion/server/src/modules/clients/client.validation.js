// src/features/client/client.validation.js
const { z } = require("zod");

const createClientSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  type: z.enum(["COMPANY", "INDIVIDUAL"]).default("INDIVIDUAL"),
  phone: z.string().optional().nullable(),
});

const updateClientSchema = z
  .object({
    name: z.string().min(1).optional(),
    type: z.enum(["COMPANY", "INDIVIDUAL"]).optional(),
    phone: z.string().optional().nullable(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Au moins un champ doit être fourni pour la mise à jour.",
  });

const clientValidation = {
  create: { body: createClientSchema },
  update: { body: updateClientSchema },
};

module.exports = { clientValidation };

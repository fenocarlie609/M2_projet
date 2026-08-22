const { z } = require("zod");

const createModuleSchema = z.object({
  code: z
    .string()
    .min(1)
    .transform((v) => v.trim().toUpperCase()), // normalise : "employees" -> "EMPLOYEES"
  label: z.string().min(1),
});

const updateModuleSchema = z
  .object({
    code: z
      .string()
      .min(1)
      .transform((v) => v.trim().toUpperCase())
      .optional(),
    label: z.string().min(1).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Au moins un champ doit être fourni pour la mise à jour.",
  });

const moduleValidation = {
  create: { body: createModuleSchema },
  update: { body: updateModuleSchema },
};

module.exports = { moduleValidation };

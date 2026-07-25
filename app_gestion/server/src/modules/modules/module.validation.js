const { z } = require("zod");

const createModuleSchema = z.object({
  code: z
    .string()
    .min(1)
    .transform((v) => v.trim().toUpperCase()), // normalise : "employees" -> "EMPLOYEES"
  label: z.string().min(1),
});

const moduleValidation = {
  create: { body: createModuleSchema },
};

module.exports = { moduleValidation };

const { z } = require("zod");

const loginSchema = z
  .object({
    identifier: z.string().min(1), // email OU matricule
    password: z.string().min(1),
  })
  .strict();

const authValidation = {
  login: { body: loginSchema },
};

module.exports = { authValidation };

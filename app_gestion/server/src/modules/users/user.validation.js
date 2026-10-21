const { z } = require("zod");
const { APP_ACTIONS } = require("../../common/utils/constants");

const permissionSchema = z.object({
  module: z.string().min(1, "Le module est obligatoire"),
  action: z.enum(Object.values(APP_ACTIONS)),
});

const grantAccessSchema = z.object({
  email: z.string().email().optional(), // optionnel : login possible par matricule
  password: z.string().min(8),
  permissions: z.array(permissionSchema).default([]),
});

const updateAccessSchema = z
  .object({
    email: z.string().email().optional(),
    password: z.string().min(8).optional(),
    isActive: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Au moins un champ doit être fourni pour la mise à jour.",
  });

const revokeManySchema = z.object({
  permissionIds: z.array(z.string().min(1)).min(1),
});

const userValidation = {
  grantAccess: { body: grantAccessSchema },
  updateAccess: { body: updateAccessSchema },
  assignPermission: { body: permissionSchema },
  revokeMany: { body: revokeManySchema },
};

module.exports = { userValidation };

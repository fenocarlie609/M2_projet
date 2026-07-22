const { z } = require("zod");
const { APP_MODULES, APP_ACTIONS } = require("../../common/utils/constants");

const permissionSchema = z.object({
  // Zod vérifie que la chaîne envoyée fait obligatoirement partie de ta liste officielle
  module: z.enum(Object.values(APP_MODULES)),
  action: z.enum(Object.values(APP_ACTIONS)),
});

const createEmployeeSchema = z
  .object({
    name: z.string().min(1),
    cin: z.string().min(1).optional().nullable(),
    matricule: z.string().min(1),
    phone: z.string().optional().nullable(),
    avatarUrl: z.string().url().optional().nullable(),
    department: z.string().min(1),
    position: z.string().min(1),
    hasAppAccess: z.boolean().default(false),
    email: z.string().email().optional(),
    password: z.string().min(8).optional(),
    // Permissions initiales optionnelles à la création
    permissions: z.array(permissionSchema).default([]),
  })
  .superRefine((data, ctx) => {
    if (data.hasAppAccess) {
      if (!data.email) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["email"],
          message: "L'email est requis si l'employé a accès à l'application.",
        });
      }
      if (!data.password) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["password"],
          message:
            "Le mot de passe est requis si l'employé a accès à l'application.",
        });
      }
    } else if (data.email || data.password) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["hasAppAccess"],
        message:
          "email/password ne doivent être fournis que si hasAppAccess = true.",
      });
    }
  });

const updateEmployeeSchema = z
  .object({
    name: z.string().min(1).optional(),
    cin: z.string().min(1).optional().nullable(),
    matricule: z.string().min(1).optional(),
    phone: z.string().optional().nullable(),
    avatarUrl: z.string().url().optional().nullable(),
    department: z.string().min(1).optional(),
    position: z.string().min(1).optional(),
    hasAppAccess: z.boolean().optional(),
    isActive: z.boolean().optional(),
    email: z.string().email().optional().nullable(),
    password: z.string().min(8).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Au moins un champ doit être fourni pour la mise à jour.",
  });

const employeeValidation = {
  create: { body: createEmployeeSchema },
  update: { body: updateEmployeeSchema },
  assignPermission: { body: permissionSchema },
};

module.exports = { employeeValidation };

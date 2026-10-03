const { z } = require("zod");
const { APP_ACTIONS } = require("../../common/utils/constants");

const permissionSchema = z.object({
  module: z.string().min(1, "Le module est obligatoire"),
  action: z.enum(Object.values(APP_ACTIONS)),
});

const createEmployeeSchema = z.object({
  name: z.string().min(1, "Le nom est obligatoire"),
  cin: z.string().min(1).optional().nullable(),
  matricule: z.string().optional().nullable(), // 🔥 Optionnel : généré par le backend
  phone: z.string().optional().nullable(),
  avatarUrl: z.string().url().optional().nullable(),
  departmentId: z.string().uuid("ID de département invalide"),
  positionId: z.string().uuid("ID de poste invalide"),
  hasAppAccess: z.boolean().default(false),
  email: z.string().email().optional(),
  password: z.string().min(8).optional(),
  permissions: z.array(permissionSchema).default([]),
});

const updateEmployeeSchema = z
  .object({
    name: z.string().min(1).optional(),
    cin: z.string().min(1).optional().nullable(),
    matricule: z.string().min(1).optional(),
    phone: z.string().optional().nullable(),
    avatarUrl: z.string().url().optional().nullable(),
    departmentId: z.string().uuid("ID de département invalide").optional(),
    positionId: z.string().uuid("ID de poste invalide").optional(),
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

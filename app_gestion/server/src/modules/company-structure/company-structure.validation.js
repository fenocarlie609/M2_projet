// src/modules/company-structure/company-structure.validation.js
const { z } = require("zod");

const createDepartmentSchema = z.object({
  code: z
    .string()
    .min(2)
    .regex(/^[A-Z_]+$/, "Le code doit être en majuscules (ex: TECH_SUPPORT)"),
  label: z.string().min(2),
});

const updateDepartmentSchema = createDepartmentSchema.partial();

const createPositionSchema = z.object({
  code: z
    .string()
    .min(2)
    .regex(/^[A-Z_]+$/, "Le code doit être en majuscules (ex: LEAD_DEV)"),
  label: z.string().min(2),
  departmentId: z.string().uuid("departmentId invalide"),
});

const updatePositionSchema = createPositionSchema
  .omit({ departmentId: true })
  .partial();

module.exports = {
  companyStructureValidation: {
    createDepartment: { body: createDepartmentSchema },
    updateDepartment: { body: updateDepartmentSchema },
    createPosition: { body: createPositionSchema },
    updatePosition: { body: updatePositionSchema },
  },
};

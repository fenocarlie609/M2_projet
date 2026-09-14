// src/features/client/client.validation.js
const { z } = require("zod");

const addressSchema = z.object({
  type: z.enum(["BILLING", "DELIVERY", "BOTH"]),
  label: z.string().trim().optional().nullable(),
  addressLine1: z.string().trim().min(1, "L'adresse est requise"),
  addressLine2: z.string().trim().optional().nullable(),
  city: z.string().trim().optional().nullable(),
  region: z.string().trim().optional().nullable(),
  postalCode: z.string().trim().optional().nullable(),
  country: z.string().trim().default("Madagascar"),
  isDefault: z.boolean().default(false),
});

const documentSchema = z.object({
  documentType: z.string().trim().min(1, "Le type de document est requis"),
  documentNumber: z.string().trim().optional().nullable(),
  fileName: z.string().trim().optional().nullable(),
  fileUrl: z.string().trim().optional().nullable(),
  issuedAt: z.coerce.date().optional().nullable(),
  expiresAt: z.coerce.date().optional().nullable(),
  notes: z.string().trim().optional().nullable(),
});

const clientFields = {
  reference: z.string().trim().optional().nullable(),
  name: z.string().trim().min(1, "Le nom ou la raison sociale est requis"),
  type: z.enum(["COMPANY", "INDIVIDUAL"]).default("INDIVIDUAL"),
  firstName: z.string().trim().optional().nullable(),
  lastName: z.string().trim().optional().nullable(),
  cin: z.string().trim().optional().nullable(),
  cinIssuedAt: z.coerce.date().optional().nullable(),
  cinIssuedPlace: z.string().trim().optional().nullable(),
  legalName: z.string().trim().optional().nullable(),
  tradeName: z.string().trim().optional().nullable(),
  nif: z.string().trim().optional().nullable(),
  stat: z.string().trim().optional().nullable(),
  rcs: z.string().trim().optional().nullable(),
  legalForm: z.string().trim().optional().nullable(),
  activity: z.string().trim().optional().nullable(),
  email: z.string().email("L'email est invalide").optional().nullable(),
  phone: z.string().trim().optional().nullable(),
  secondaryPhone: z.string().trim().optional().nullable(),
  paymentTerms: z.string().trim().optional().nullable(),
  currency: z.string().trim().length(3).default("MGA"),
  taxExempt: z.boolean().default(false),
  taxExemptionReason: z.string().trim().optional().nullable(),
  contractNumber: z.string().trim().optional().nullable(),
  habitualCargoType: z.string().trim().optional().nullable(),
  receptionContactName: z.string().trim().optional().nullable(),
  receptionContactPhone: z.string().trim().optional().nullable(),
  receptionContactEmail: z
    .string()
    .email("L'email du réceptionnaire est invalide")
    .optional()
    .nullable(),
  isActive: z.boolean().default(true),
  notes: z.string().trim().optional().nullable(),
  addresses: z.array(addressSchema).optional(),
  documents: z.array(documentSchema).optional(),
};

const validateClientIdentity = (data, context) => {
  if (data.type === "COMPANY" && data.taxExempt && !data.taxExemptionReason) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["taxExemptionReason"],
      message: "Le motif d'exonération fiscale est requis.",
    });
  }
};

const createClientSchema = z
  .object(clientFields)
  .superRefine(validateClientIdentity);

const updateClientSchema = z
  .object(
    Object.fromEntries(
      Object.entries(clientFields).map(([key, schema]) => [
        key,
        schema.optional(),
      ]),
    ),
  )
  .superRefine(validateClientIdentity)
  .refine((data) => Object.keys(data).length > 0, {
    message: "Au moins un champ doit être fourni pour la mise à jour.",
  });

const clientValidation = {
  create: { body: createClientSchema },
  update: { body: updateClientSchema },
};

module.exports = { clientValidation };

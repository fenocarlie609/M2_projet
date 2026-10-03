-- CreateEnum
CREATE TYPE "ClientAddressType" AS ENUM ('BILLING', 'DELIVERY', 'BOTH');

-- AlterTable
ALTER TABLE "clients" ADD COLUMN "activity" TEXT,
ADD COLUMN "cin" TEXT,
ADD COLUMN "cinIssuedAt" TIMESTAMP(3),
ADD COLUMN "cinIssuedPlace" TEXT,
ADD COLUMN "contractNumber" TEXT,
ADD COLUMN "currency" TEXT NOT NULL DEFAULT 'MGA',
ADD COLUMN "deletedAt" TIMESTAMP(3),
ADD COLUMN "email" TEXT,
ADD COLUMN "firstName" TEXT,
ADD COLUMN "habitualCargoType" TEXT,
ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "lastName" TEXT,
ADD COLUMN "legalForm" TEXT,
ADD COLUMN "legalName" TEXT,
ADD COLUMN "nif" TEXT,
ADD COLUMN "notes" TEXT,
ADD COLUMN "paymentTerms" TEXT,
ADD COLUMN "rcs" TEXT,
ADD COLUMN "receptionContactEmail" TEXT,
ADD COLUMN "receptionContactName" TEXT,
ADD COLUMN "receptionContactPhone" TEXT,
ADD COLUMN "reference" TEXT,
ADD COLUMN "secondaryPhone" TEXT,
ADD COLUMN "stat" TEXT,
ADD COLUMN "taxExempt" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "taxExemptionReason" TEXT,
ADD COLUMN "tradeName" TEXT;

-- CreateTable
CREATE TABLE "client_addresses" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "type" "ClientAddressType" NOT NULL,
    "label" TEXT,
    "addressLine1" TEXT NOT NULL,
    "addressLine2" TEXT,
    "city" TEXT,
    "region" TEXT,
    "postalCode" TEXT,
    "country" TEXT NOT NULL DEFAULT 'Madagascar',
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    CONSTRAINT "client_addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client_documents" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "documentType" TEXT NOT NULL,
    "documentNumber" TEXT,
    "fileName" TEXT,
    "fileUrl" TEXT,
    "issuedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "verifiedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    CONSTRAINT "client_documents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "client_addresses_clientId_type_idx" ON "client_addresses"("clientId", "type");
CREATE INDEX "client_addresses_deletedAt_idx" ON "client_addresses"("deletedAt");
CREATE INDEX "client_documents_clientId_documentType_idx" ON "client_documents"("clientId", "documentType");
CREATE INDEX "client_documents_expiresAt_idx" ON "client_documents"("expiresAt");
CREATE INDEX "client_documents_deletedAt_idx" ON "client_documents"("deletedAt");
CREATE UNIQUE INDEX "clients_reference_key" ON "clients"("reference");
CREATE UNIQUE INDEX "clients_cin_key" ON "clients"("cin");
CREATE UNIQUE INDEX "clients_nif_key" ON "clients"("nif");
CREATE UNIQUE INDEX "clients_stat_key" ON "clients"("stat");
CREATE INDEX "clients_type_idx" ON "clients"("type");
CREATE INDEX "clients_name_idx" ON "clients"("name");
CREATE INDEX "clients_deletedAt_idx" ON "clients"("deletedAt");

-- AddForeignKey
ALTER TABLE "client_addresses" ADD CONSTRAINT "client_addresses_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "client_documents" ADD CONSTRAINT "client_documents_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

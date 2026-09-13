-- CreateTable
CREATE TABLE "loading_plans" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "voyageId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "totalWeightKg" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "validatedAt" TIMESTAMP(3),
    "validatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "loading_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cargo_lines" (
    "id" TEXT NOT NULL,
    "loadingPlanId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "driverId" TEXT,
    "vehicleId" TEXT,
    "loadedById" TEXT,
    "loadingDate" TIMESTAMP(3),
    "packageCount" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "weightKg" DECIMAL(65,30) NOT NULL,
    "anomaly" TEXT,
    "loadingPosition" TEXT,
    "isHazardous" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "cargo_lines_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "loading_plans_reference_key" ON "loading_plans"("reference");

-- CreateIndex
CREATE INDEX "loading_plans_voyageId_idx" ON "loading_plans"("voyageId");

-- CreateIndex
CREATE INDEX "loading_plans_status_idx" ON "loading_plans"("status");

-- CreateIndex
CREATE INDEX "loading_plans_deletedAt_idx" ON "loading_plans"("deletedAt");

-- CreateIndex
CREATE INDEX "cargo_lines_loadingPlanId_idx" ON "cargo_lines"("loadingPlanId");

-- CreateIndex
CREATE INDEX "cargo_lines_clientId_idx" ON "cargo_lines"("clientId");

-- CreateIndex
CREATE INDEX "cargo_lines_loadingDate_idx" ON "cargo_lines"("loadingDate");

-- CreateIndex
CREATE INDEX "cargo_lines_status_idx" ON "cargo_lines"("status");

-- CreateIndex
CREATE INDEX "cargo_lines_deletedAt_idx" ON "cargo_lines"("deletedAt");

-- AddForeignKey
ALTER TABLE "loading_plans" ADD CONSTRAINT "loading_plans_voyageId_fkey" FOREIGN KEY ("voyageId") REFERENCES "voyages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loading_plans" ADD CONSTRAINT "loading_plans_validatedById_fkey" FOREIGN KEY ("validatedById") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cargo_lines" ADD CONSTRAINT "cargo_lines_loadingPlanId_fkey" FOREIGN KEY ("loadingPlanId") REFERENCES "loading_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cargo_lines" ADD CONSTRAINT "cargo_lines_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cargo_lines" ADD CONSTRAINT "cargo_lines_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "drivers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cargo_lines" ADD CONSTRAINT "cargo_lines_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cargo_lines" ADD CONSTRAINT "cargo_lines_loadedById_fkey" FOREIGN KEY ("loadedById") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

/*
  Warnings:

  - You are about to drop the `cargo_lines` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "cargo_lines" DROP CONSTRAINT "cargo_lines_clientId_fkey";

-- DropForeignKey
ALTER TABLE "cargo_lines" DROP CONSTRAINT "cargo_lines_loadedById_fkey";

-- DropForeignKey
ALTER TABLE "cargo_lines" DROP CONSTRAINT "cargo_lines_loadingPlanId_fkey";

-- DropTable
DROP TABLE "cargo_lines";

-- CreateTable
CREATE TABLE "loads" (
    "id" TEXT NOT NULL,
    "loadingPlanId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "driverName" TEXT,
    "vehiclePlate" TEXT,
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

    CONSTRAINT "loads_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "loads_loadingPlanId_idx" ON "loads"("loadingPlanId");

-- CreateIndex
CREATE INDEX "loads_clientId_idx" ON "loads"("clientId");

-- CreateIndex
CREATE INDEX "loads_loadingDate_idx" ON "loads"("loadingDate");

-- CreateIndex
CREATE INDEX "loads_status_idx" ON "loads"("status");

-- CreateIndex
CREATE INDEX "loads_deletedAt_idx" ON "loads"("deletedAt");

-- AddForeignKey
ALTER TABLE "loads" ADD CONSTRAINT "loads_loadingPlanId_fkey" FOREIGN KEY ("loadingPlanId") REFERENCES "loading_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loads" ADD CONSTRAINT "loads_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loads" ADD CONSTRAINT "loads_loadedById_fkey" FOREIGN KEY ("loadedById") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Entreposage : sites de stockage, marchandises en stock et trace des mouvements.

-- CreateTable
CREATE TABLE "warehouses" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "city" TEXT,
    "capacityTons" DECIMAL(65,30),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "warehouses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "warehouse_items" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "warehouseId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "loadId" TEXT,
    "description" TEXT NOT NULL,
    "packageCount" INTEGER NOT NULL,
    "weightKg" DECIMAL(65,30) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'IN_STOCK',
    "arrivalDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "departureDate" TIMESTAMP(3),
    "departureReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "warehouse_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "warehouse_movements" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "warehouseId" TEXT NOT NULL,
    "employeeId" TEXT,
    "type" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "warehouse_movements_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "loads" ADD COLUMN "stockItemId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "warehouses_code_key" ON "warehouses"("code");

-- CreateIndex
CREATE UNIQUE INDEX "warehouse_items_reference_key" ON "warehouse_items"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "warehouse_items_loadId_key" ON "warehouse_items"("loadId");

-- CreateIndex
CREATE UNIQUE INDEX "loads_stockItemId_key" ON "loads"("stockItemId");

-- CreateIndex
CREATE INDEX "warehouses_deletedAt_idx" ON "warehouses"("deletedAt");

-- CreateIndex
CREATE INDEX "warehouse_items_warehouseId_idx" ON "warehouse_items"("warehouseId");

-- CreateIndex
CREATE INDEX "warehouse_items_clientId_idx" ON "warehouse_items"("clientId");

-- CreateIndex
CREATE INDEX "warehouse_items_status_idx" ON "warehouse_items"("status");

-- CreateIndex
CREATE INDEX "warehouse_items_deletedAt_idx" ON "warehouse_items"("deletedAt");

-- CreateIndex
CREATE INDEX "warehouse_movements_itemId_idx" ON "warehouse_movements"("itemId");

-- CreateIndex
CREATE INDEX "warehouse_movements_warehouseId_idx" ON "warehouse_movements"("warehouseId");

-- CreateIndex
CREATE INDEX "warehouse_movements_createdAt_idx" ON "warehouse_movements"("createdAt");

-- AddForeignKey
ALTER TABLE "warehouse_items" ADD CONSTRAINT "warehouse_items_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "warehouses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "warehouse_items" ADD CONSTRAINT "warehouse_items_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "warehouse_items" ADD CONSTRAINT "warehouse_items_loadId_fkey" FOREIGN KEY ("loadId") REFERENCES "loads"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "warehouse_movements" ADD CONSTRAINT "warehouse_movements_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "warehouse_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "warehouse_movements" ADD CONSTRAINT "warehouse_movements_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "warehouses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "warehouse_movements" ADD CONSTRAINT "warehouse_movements_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loads" ADD CONSTRAINT "loads_stockItemId_fkey" FOREIGN KEY ("stockItemId") REFERENCES "warehouse_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

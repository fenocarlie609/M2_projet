/*
  Warnings:

  - You are about to drop the column `driverId` on the `cargo_lines` table. All the data in the column will be lost.
  - You are about to drop the column `vehicleId` on the `cargo_lines` table. All the data in the column will be lost.
  - You are about to drop the `drivers` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `vehicles` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "cargo_lines" DROP CONSTRAINT "cargo_lines_driverId_fkey";

-- DropForeignKey
ALTER TABLE "cargo_lines" DROP CONSTRAINT "cargo_lines_vehicleId_fkey";

-- AlterTable
ALTER TABLE "cargo_lines" DROP COLUMN "driverId",
DROP COLUMN "vehicleId",
ADD COLUMN     "driverName" TEXT,
ADD COLUMN     "vehiclePlate" TEXT;

-- DropTable
DROP TABLE "drivers";

-- DropTable
DROP TABLE "vehicles";

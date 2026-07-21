/*
  Warnings:

  - A unique constraint covering the columns `[matricule]` on the table `employees` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `matricule` to the `employees` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "employees" ADD COLUMN     "matricule" TEXT NOT NULL,
ALTER COLUMN "cin" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "employees_matricule_key" ON "employees"("matricule");

/*
  Warnings:

  - The `status` column on the `loading_plans` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "loading_plans" DROP COLUMN "status",
ADD COLUMN     "status" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "loading_plans_status_idx" ON "loading_plans"("status");

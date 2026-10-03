ALTER TABLE "loading_plans"
ADD COLUMN "sourceLoadingPlanId" TEXT;

CREATE UNIQUE INDEX "loading_plans_sourceLoadingPlanId_key"
ON "loading_plans"("sourceLoadingPlanId");

ALTER TABLE "loading_plans"
ADD CONSTRAINT "loading_plans_sourceLoadingPlanId_fkey"
FOREIGN KEY ("sourceLoadingPlanId")
REFERENCES "loading_plans"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;
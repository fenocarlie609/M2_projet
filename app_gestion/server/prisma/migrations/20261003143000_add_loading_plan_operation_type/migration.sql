CREATE TYPE "LoadingPlanOperation" AS ENUM ('LOAD', 'UNLOAD');

ALTER TABLE "loading_plans"
ADD COLUMN "operationType" "LoadingPlanOperation" NOT NULL DEFAULT 'LOAD';
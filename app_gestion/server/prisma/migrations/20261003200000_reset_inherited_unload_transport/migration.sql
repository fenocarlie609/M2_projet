UPDATE "loads" AS unloadLoad
SET
    "driverName" = CASE
        WHEN unloadLoad."driverName" IS NOT DISTINCT FROM sourceLoad."driverName"
        THEN NULL
        ELSE unloadLoad."driverName"
    END,
    "vehiclePlate" = CASE
        WHEN unloadLoad."vehiclePlate" IS NOT DISTINCT FROM sourceLoad."vehiclePlate"
        THEN NULL
        ELSE unloadLoad."vehiclePlate"
    END
FROM "loading_plans" AS unloadPlan
JOIN "loading_plans" AS sourcePlan
  ON sourcePlan."id" = unloadPlan."sourceLoadingPlanId"
JOIN "loads" AS sourceLoad
  ON sourceLoad."loadingPlanId" = sourcePlan."id"
WHERE unloadLoad."loadingPlanId" = unloadPlan."id"
  AND unloadPlan."operationType" = 'UNLOAD'
  AND unloadLoad."deletedAt" IS NULL
  AND sourceLoad."deletedAt" IS NULL
  AND unloadLoad."clientId" = sourceLoad."clientId"
  AND unloadLoad."packageCount" = sourceLoad."packageCount"
  AND unloadLoad."description" = sourceLoad."description"
  AND unloadLoad."weightKg" = sourceLoad."weightKg"
  AND (
      unloadLoad."driverName" IS NOT DISTINCT FROM sourceLoad."driverName"
      OR unloadLoad."vehiclePlate" IS NOT DISTINCT FROM sourceLoad."vehiclePlate"
  );
INSERT INTO "loading_plans" (
    "id",
    "reference",
    "voyageId",
    "status",
    "operationType",
    "totalWeightKg",
    "sourceLoadingPlanId",
    "createdAt",
    "updatedAt"
)
SELECT
    'unload-' || source."id",
    'DECH-' || source."reference",
    source."voyageId",
    false,
    'UNLOAD',
    totals."totalWeightKg",
    source."id",
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "loading_plans" AS source
CROSS JOIN LATERAL (
    SELECT
        COALESCE(SUM(load."weightKg"), 0) AS "totalWeightKg",
        COUNT(*) AS "loadCount",
        COUNT(*) FILTER (WHERE load."status" = 'LOADED') AS "loadedCount"
    FROM "loads" AS load
    WHERE load."loadingPlanId" = source."id"
      AND load."deletedAt" IS NULL
      AND load."status" <> 'CANCELLED'
) AS totals
WHERE source."operationType" = 'LOAD'
  AND source."status" = true
  AND source."deletedAt" IS NULL
  AND totals."loadCount" > 0
  AND totals."loadCount" = totals."loadedCount"
  AND NOT EXISTS (
      SELECT 1
      FROM "loading_plans" AS existing
      WHERE existing."sourceLoadingPlanId" = source."id"
  )
ON CONFLICT ("reference") DO NOTHING;

INSERT INTO "loads" (
    "id",
    "loadingPlanId",
    "clientId",
    "driverName",
    "vehiclePlate",
    "loadingDate",
    "packageCount",
    "description",
    "weightKg",
    "anomaly",
    "loadingPosition",
    "isHazardous",
    "status",
    "createdAt",
    "updatedAt"
)
SELECT
    'unload-' || sourceLoad."id",
    unloadPlan."id",
    sourceLoad."clientId",
    sourceLoad."driverName",
    sourceLoad."vehiclePlate",
    NULL,
    sourceLoad."packageCount",
    sourceLoad."description",
    sourceLoad."weightKg",
    sourceLoad."anomaly",
    sourceLoad."loadingPosition",
    sourceLoad."isHazardous",
    'PENDING',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "loading_plans" AS unloadPlan
JOIN "loading_plans" AS source
  ON source."id" = unloadPlan."sourceLoadingPlanId"
JOIN "loads" AS sourceLoad
  ON sourceLoad."loadingPlanId" = source."id"
WHERE unloadPlan."operationType" = 'UNLOAD'
  AND sourceLoad."deletedAt" IS NULL
  AND sourceLoad."status" <> 'CANCELLED'
  AND NOT EXISTS (
      SELECT 1
      FROM "loads" AS existingLoad
      WHERE existingLoad."loadingPlanId" = unloadPlan."id"
  )
ON CONFLICT ("id") DO NOTHING;
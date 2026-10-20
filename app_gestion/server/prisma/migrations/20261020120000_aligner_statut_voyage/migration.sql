-- Aligne la valeur par defaut du statut de voyage sur les statuts reellement
-- utilises par l'interface de programmation (SCHEDULED, IN_TRANSIT, ARRIVED,
-- CANCELLED). Les lignes encore marquees DRAFT sont replanifiees.

-- AlterTable
ALTER TABLE "voyages" ALTER COLUMN "status" SET DEFAULT 'SCHEDULED';

-- Data correction
UPDATE "voyages" SET "status" = 'SCHEDULED' WHERE "status" = 'DRAFT';

-- Retrait de la table des documents clients, non exploitee par l'application,
-- et index sur la date du journal d'audit, qui sert aux lectures du tableau
-- de bord et a l'ecran des mouvements.

-- DropTable
DROP TABLE "client_documents";

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

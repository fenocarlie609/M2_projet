import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiCheckCircle } from "react-icons/fi";
import { Alert, Button, PageHeader } from "@/shared/components/ui";
import { useAuth } from "@/features/auth";
import { clientService } from "@/features/client";
import { loadingPlanService } from "@/features/plans";
import {
  LoadingManifestPdf,
  UnloadingManifestPdf,
} from "../components/LoadingManifestPdf";
import { LoadEditorModal } from "../components/LoadEditorModal";
import { PlanOverview } from "../components/PlanOverview";
import { PlanLoadsSection } from "../components/PlanLoadsSection";

const getErrorMessage = (error, fallback) => {
  const response = error?.response?.data;
  const issues = response?.errors || response?.error?.errors || [];
  if (issues.length) {
    return issues
      .map((issue) => {
        const field = issue.field || issue.path?.join(".");
        return field ? `${field} : ${issue.message}` : issue.message;
      })
      .join(" | ");
  }
  return response?.message || fallback;
};

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString("fr-FR") : "-";

function LoadPage({ operationType = "LOAD" }) {
  const { reference } = useParams();
  const navigate = useNavigate();
  const { checkPermission } = useAuth();
  const [plan, setPlan] = useState(null);
  const [clients, setClients] = useState([]);
  const [editingLoad, setEditingLoad] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState("");

  const isUnload = operationType === "UNLOAD";
  const operationLabel = isUnload ? "Déchargement" : "Chargement";
  const isLocked = Boolean(plan?.validatedAt);
  const canManageLoads = checkPermission("CARGO", "CREATE");
  const canUpdateLoads = checkPermission("CARGO", "UPDATE");
  const canDeleteLoads = checkPermission("CARGO", "DELETE");
  const canValidate = checkPermission("LOADING_PLANS", "UPDATE");

  const loadData = async () => {
    setIsLoading(true);
    try {
      const planResponse = await loadingPlanService.getPlanByReference(reference);
      const nextPlan = planResponse?.data?.loadingPlan;
      if (!nextPlan || (nextPlan.operationType || "LOAD") !== operationType) {
        setPlan(null);
        setError(
          `Aucun plan de ${operationLabel.toLowerCase()} trouvé pour cette référence.`,
        );
        return;
      }
      setPlan(nextPlan);
      setError("");
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Impossible de charger le plan."));
    } finally {
      setIsLoading(false);
    }

    // La liste des clients est une donnee annexe : elle alimente le choix
    // du client dans l'editeur de ligne. Un compte qui n'a pas le droit
    // de lire les clients doit pouvoir consulter le manifeste sans que
    // l'ecran soit bloque.
    try {
      const clientsResponse = await clientService.getClients();
      setClients(clientsResponse?.data?.clients || []);
    } catch {
      setClients([]);
    }
  };

  useEffect(() => {
    loadData();
  }, [reference, operationType]);

  const openCreateModal = () => {
    setEditingLoad(null);
    setError("");
    setIsModalOpen(true);
  };

  const openEditModal = (load) => {
    setEditingLoad(load);
    setError("");
    setIsModalOpen(true);
  };

  const handleSaveLoad = async (payload) => {
    if (!plan) return;
    setIsSaving(true);
    setError("");
    try {
      if (editingLoad) {
        await loadingPlanService.updateLoad(plan.id, editingLoad.id, payload);
      } else {
        await loadingPlanService.addLoad(plan.id, payload);
      }
      setIsModalOpen(false);
      await loadData();
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
          "Impossible d'enregistrer la marchandise.",
        ),
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteLoad = async (load) => {
    if (
      !plan ||
      !window.confirm(`Supprimer la marchandise « ${load.description} » ?`)
    )
      return;
    setIsSaving(true);
    setError("");
    try {
      await loadingPlanService.deleteLoad(plan.id, load.id);
      await loadData();
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
          "Impossible de supprimer la marchandise.",
        ),
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleValidate = async () => {
    if (
      !plan ||
      !window.confirm(
        `Valider définitivement ce plan de ${operationLabel.toLowerCase()} ?`,
      )
    )
      return;
    setIsSaving(true);
    setError("");
    try {
      const response = await loadingPlanService.validatePlan(plan.id);
      setPlan(response?.data?.loadingPlan || plan);
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Impossible de valider le plan."));
    } finally {
      setIsSaving(false);
    }
  };

  const loads = plan?.loads || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${operationLabel} · ${reference}`}
        subtitle={`${plan?.voyage?.vessel?.name || "Navire"} · Voyage ${plan?.voyage?.voyageNumber || "-"} · ${plan?.voyage?.departurePort?.name || "?"} → ${plan?.voyage?.arrivalPort?.name || "?"}`}
      >
        <Button
          variant="secondary"
          icon={FiArrowLeft}
          onClick={() => navigate(`/plans?tab=${operationType}`)}
        >
          Retour aux plans
        </Button>
        {operationType === "LOAD" && isLocked && (
          <LoadingManifestPdf plan={plan} onError={setError} />
        )}
        {operationType === "UNLOAD" && isLocked && (
          <UnloadingManifestPdf plan={plan} onError={setError} />
        )}
        {operationType === "LOAD" && plan?.unloadPlan && (
          <Button
            variant="secondary"
            onClick={() =>
              navigate(
                `/plans/unload/${encodeURIComponent(plan.unloadPlan.reference)}`,
              )
            }
          >
            Ouvrir le déchargement
          </Button>
        )}
        {!isLocked && canValidate && (
          <Button
            variant="primary"
            icon={FiCheckCircle}
            onClick={handleValidate}
            disabled={isSaving}
          >
            Valider le plan
          </Button>
        )}
      </PageHeader>

      {error && (
        <Alert variant="error" title="Erreur">
          {error}
        </Alert>
      )}
      {isLoading ? (
        <div className="py-12 text-center text-slate-500">
          Chargement du plan...
        </div>
      ) : plan ? (
        <>
          <PlanOverview plan={plan} loads={loads} />
          <PlanLoadsSection
            loads={loads}
            operationType={operationType}
            isLocked={isLocked}
            isSaving={isSaving}
            canCreate={canManageLoads}
            canUpdate={canUpdateLoads}
            canDelete={canDeleteLoads}
            onCreate={openCreateModal}
            onEdit={openEditModal}
            onDelete={handleDeleteLoad}
            subtitle={
              isLocked
                ? `Validé le ${formatDate(plan.validatedAt)}${plan.validatedBy?.name ? ` par ${plan.validatedBy.name}` : ""}`
                : "Le total et la capacité sont contrôlés par le serveur."
            }
          />
        </>
      ) : null}

      <LoadEditorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        load={editingLoad}
        clients={clients}
        operationType={operationType}
        isSaving={isSaving}
        error={error}
        onSubmit={handleSaveLoad}
      />
    </div>
  );
}

export default LoadPage;

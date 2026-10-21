// src/features/PlanPage/pages/PlanPage.jsx
import React, { useEffect, useState } from "react";
import { FiPlus } from "react-icons/fi";
import { Alert, Button, PageHeader, Tabs } from "@/shared/components/ui";
import {
  loadingPlanService,
  LoadPlanModal,
  LoadPlanTable,
} from "@/features/plans";
import { voyageService } from "@/features/voyages";
import { socket } from "@/shared/services/";
import { useAuth } from "@/features/auth";
import { useNavigate, useSearchParams } from "react-router-dom";

const TABS = [
  { id: "LOAD", label: "Chargement" },
  { id: "UNLOAD", label: "Déchargement" },
];

const getErrorMessage = (error, fallback) => {
  const responseData = error?.response?.data;
  const validationErrors =
    responseData?.errors || responseData?.error?.errors || [];

  if (validationErrors.length > 0) {
    return validationErrors
      .map((validationError) => {
        const field = validationError.field || validationError.path?.join(".");
        return field
          ? `${field} : ${validationError.message}`
          : validationError.message;
      })
      .join(" | ");
  }

  return responseData?.message || fallback;
};

function PlansPage() {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(() =>
    searchParams.get("tab") === "UNLOAD" ? "UNLOAD" : "LOAD",
  );
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [voyages, setVoyages] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { checkPermission } = useAuth();
  const visiblePlans = plans.filter(
    (plan) => (plan.operationType || "LOAD") === activeTab,
  );

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [plansRes, voyagesRes] = await Promise.all([
        loadingPlanService.getPlans(),
        voyageService.getVoyages(),
      ]);

      setPlans(Array.isArray(plansRes) ? plansRes : []);
      setVoyages(voyagesRes?.data?.voyages || voyagesRes || []);
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
          "Impossible de charger les données du plan de chargement.",
        ),
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Temps reel : la modification d'une ligne de marchandise par un autre
  // utilisateur (ajout, validation, generation du plan de dechargement)
  // declenche le rechargement de la liste des plans.
  useEffect(() => {
    const onLoadChanged = () => loadData();

    socket.on("load:changed", onLoadChanged);
    return () => {
      socket.off("load:changed", onLoadChanged);
    };
  }, []);

  const handleOpenModal = (plan = null) => {
    setSelectedPlan(plan);
    setError("");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPlan(null);
    setError("");
  };

  const handleOpenPlan = (plan) => {
    navigate(
      `/plans/${activeTab === "UNLOAD" ? "unload" : "load"}/${encodeURIComponent(plan.reference)}`,
    );
  };

  const handleSavePlan = async (planId, formData) => {
    setIsSaving(true);
    try {
      if (planId) {
        const response = await loadingPlanService.updatePlan(
          planId,
          formData,
        );
        const updated = response?.data?.loadingPlan;
        setPlans((prev) =>
          prev.map((p) => (p.id === updated.id ? updated : p)),
        );
      } else {
        const response = await loadingPlanService.createPlan(formData);
        const created = response?.data?.loadingPlan;
        setPlans((prev) => [created, ...prev]);
      }
      handleCloseModal();
    } catch (requestError) {
      setError(
        getErrorMessage(requestError, "Impossible d'enregistrer le plan."),
      );
      throw requestError;
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreatePlan = (formData) => handleSavePlan(null, formData);
  const handleUpdatePlan = (planId, formData) =>
    handleSavePlan(planId, formData);

  const handleDeletePlan = async (plan) => {
    if (!window.confirm(`Voulez-vous supprimer le plan "${plan.reference}" ?`))
      return;
    try {
      await loadingPlanService.deletePlan(plan.id);
      setPlans((prev) => prev.filter((p) => p.id !== plan.id));
    } catch (requestError) {
      setError(
        getErrorMessage(requestError, "Impossible de supprimer le plan."),
      );
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={
          activeTab === "UNLOAD"
            ? "Plans de déchargement"
            : "Plans de chargement"
        }
        subtitle="Consultez les opérations et le manifeste associés à chaque voyage."
      >
        {activeTab === "LOAD" && checkPermission("LOADING_PLANS", "CREATE") && (
          <Button
            variant="primary"
            icon={FiPlus}
            onClick={() => handleOpenModal()}
          >
            {activeTab === "UNLOAD"
              ? "Nouveau plan de déchargement"
              : "Nouveau plan de chargement"}
          </Button>
        )}
      </PageHeader>

      {error && (
        <Alert variant="error" title="Erreur">
          {error}
        </Alert>
      )}

      <Tabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />

      <LoadPlanTable
        data={visiblePlans}
        isLoading={isLoading}
        operationType={activeTab}
        onOpen={handleOpenPlan}
        onEdit={(plan) => handleOpenModal(plan)}
        onDelete={(plan) => handleDeletePlan(plan)}
      />

      <LoadPlanModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        voyages={voyages}
        selectedPlan={selectedPlan}
        operationType={activeTab}
        onLoadCreated={handleCreatePlan}
        onPlanUpdated={handleUpdatePlan}
      />
    </div>
  );
}

export default PlansPage;

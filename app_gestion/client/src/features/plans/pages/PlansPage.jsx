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
import { clientService } from "@/features/client";
import { useNavigate } from "react-router-dom";

const TABS = [
  { id: "loadPlans", label: "Chargement" },
  { id: "unloadPlans", label: "Déchargement" },
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
  const [activeTab, setActiveTab] = useState("loadPlans");
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [voyages, setVoyages] = useState([]);
  const [clients, setClients] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [plansRes, voyagesRes, clientsRes] = await Promise.all([
        loadingPlanService.getPlans(),
        voyageService.getVoyages(),
        clientService.getClients(),
      ]);

      setPlans(plansRes?.data?.loadingPlans || plansRes || []);
      setVoyages(voyagesRes?.data?.voyages || voyagesRes || []);
      setClients(clientsRes?.data?.clients || []);
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

  const handleOpenLoad = (plan) => {
  navigate(`/plans/load/${plan.reference}`);
};

  const handleSavePlan = async (formData) => {
    setIsSaving(true);
    try {
      if (selectedPlan) {
        // En cas de mise à jour
        const response = await loadingPlanService.updatePlan(
          selectedPlan.id,
          formData,
        );
        const updated = response?.data?.loadingPlan;
        setPlans((prev) =>
          prev.map((p) => (p.id === updated.id ? updated : p)),
        );
      } else {
        // En cas de création
        const response = await loadingPlanService.createPlan(formData);
        console.log(response);
        const created = response?.data?.loadingPlan;
        setPlans((prev) => [created, ...prev]);
      }
      handleCloseModal();
    } catch (requestError) {
      setError(
        getErrorMessage(requestError, "Impossible d'enregistrer le plan."),
      );
    } finally {
      setIsSaving(false);
    }
  };

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
        title="Plans de chargement"
        subtitle="Créez un manifeste maritime et suivez le poids total des marchandises."
      >
        <Button
          variant="primary"
          icon={FiPlus}
          onClick={() => handleOpenModal()}
        >
          Nouveau plan
        </Button>
      </PageHeader>

      {error && (
        <Alert variant="error" title="Erreur">
          {error}
        </Alert>
      )}

      <Tabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === "loadPlans" ? (
        <LoadPlanTable
          data={plans}
          isLoading={isLoading}
          onOpen={(plan) => handleOpenLoad(plan)}
          onEdit={(plan) => handleOpenModal(plan)}
          onDelete={(plan) => handleDeletePlan(plan)}
        />
      ) : (
        <div className="p-4 text-center text-slate-500">
          Module de déchargement à venir.
        </div>
      )}

      <LoadPlanModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        voyages={voyages}
        selectedLoad={selectedPlan}
        onLoadCreated={handleSavePlan}
        onLoadUpdate={handleSavePlan}
        isLoading={isSaving}
        error={error}
      />
    </div>
  );
}

export default PlansPage;

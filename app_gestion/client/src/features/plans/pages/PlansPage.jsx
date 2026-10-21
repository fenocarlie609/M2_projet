// src/features/PlanPage/pages/PlanPage.jsx
import React, { useEffect, useState } from "react";
import { FiPlus } from "react-icons/fi";
import { Alert, Button, PageHeader, Tabs } from "@/shared/components/ui";
import {
  loadingPlanService,
  LoadPlanModal,
  LoadPlanTable,
  LoadPlanCard,
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
  // La liste des voyages est une donnee annexe : son absence ne doit pas
  // empecher la consultation des plans.
  const [voyagesDisponibles, setVoyagesDisponibles] = useState(true);

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
    setError("");

    // Les plans de manutention sont l'objet de l'ecran. La liste des
    // voyages n'est qu'une donnee annexe : elle alimente le choix du
    // voyage dans le formulaire de creation. Un compte qui n'a pas le
    // droit de lire les voyages doit donc pouvoir consulter les plans
    // sans que l'ecran soit bloque par une erreur de droit.
    try {
      const plansRes = await loadingPlanService.getPlans();
      setPlans(Array.isArray(plansRes) ? plansRes : []);
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

    try {
      const voyagesRes = await voyageService.getVoyages();
      setVoyages(voyagesRes?.data?.voyages || voyagesRes || []);
      setVoyagesDisponibles(true);
    } catch {
      // Le compte n'a pas le droit de lire les voyages : les plans
      // restent consultables, la creation ne l'est pas.
      setVoyages([]);
      setVoyagesDisponibles(false);
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
        {activeTab === "LOAD" &&
          checkPermission("LOADING_PLANS", "CREATE") &&
          voyagesDisponibles && (
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

      {!voyagesDisponibles && (
        <Alert variant="info" title="Création indisponible">
          Vous pouvez consulter les plans de manutention, mais pas les
          voyages : la création d'un plan n'est donc pas proposée.
        </Alert>
      )}

      <Tabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />

      <div className="hidden md:block">
        <LoadPlanTable
          data={visiblePlans}
          isLoading={isLoading}
          operationType={activeTab}
          onOpen={handleOpenPlan}
          onEdit={(plan) => handleOpenModal(plan)}
          onDelete={(plan) => handleDeletePlan(plan)}
        />
      </div>

      <div className="grid md:hidden gap-3">
        {isLoading && (
          <p className="text-sm text-slate-400 font-medium">Chargement...</p>
        )}
        {!isLoading && visiblePlans.length === 0 && (
          <p className="text-sm text-slate-400 font-medium">
            Aucun plan de {activeTab === "UNLOAD" ? "déchargement" : "chargement"}.
          </p>
        )}
        {visiblePlans.map((plan) => (
          <LoadPlanCard
            key={plan.id}
            plan={plan}
            operationType={activeTab}
            onOpen={handleOpenPlan}
            onEdit={(element) => handleOpenModal(element)}
            onDelete={(element) => handleDeletePlan(element)}
          />
        ))}
      </div>

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

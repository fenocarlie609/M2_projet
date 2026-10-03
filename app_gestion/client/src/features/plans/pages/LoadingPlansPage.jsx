// src/features/loadingPlans/pages/LoadingPlansPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { FiArrowLeft, FiCheckCircle, FiPlus } from "react-icons/fi";
import {
  Alert,
  Button,
  Card,
  CardContent,
  CardHeader,
  PageHeader,
  Table,
} from "@/shared/components/ui";
import { loadingPlanService } from "@/features/loadingPlans";
import { voyageService } from "@/features/voyages";
import { clientService } from "@/features/client";
import { PlanModal } from "../components/LoadPlanModal";
import { CargoLineModal } from "../components/CargoLineModal";

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

const toTons = (kg) =>
  (Number(kg || 0) / 1000).toLocaleString("fr-FR", {
    maximumFractionDigits: 3,
  });

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString("fr-FR") : "-";

function LoadingPlansPage() {
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [voyages, setVoyages] = useState([]);
  const [clients, setClients] = useState([]);
  const [modal, setModal] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [nextPlans, voyagesRes, clientsRes] = await Promise.all([
        loadingPlanService.getPlans(),
        voyageService.getVoyages(),
        clientService.getClients(),
      ]);
      setPlans(nextPlans?.data?.loadingPlans || nextPlans || []);
      setVoyages(voyagesRes.data?.voyages || voyagesRes || []);
      setClients(clientsRes.data?.clients || []);
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

  const openPlan = async (plan) => {
    try {
      const response = await loadingPlanService.getPlanById(plan.id);
      setSelectedPlan(response.data?.loadingPlan || plan);
      setError("");
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Impossible de charger le plan."));
    }
  };

  const handleCreatePlan = async (data) => {
    setIsSaving(true);
    try {
      const response = await loadingPlanService.createPlan(data);
      const plan = response.data?.loadingPlan;
      setPlans((current) => [plan, ...current]);
      setModal(null);
      setError("");
      setSelectedPlan(plan);
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Impossible de créer le plan."));
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddLine = async (data) => {
    if (!selectedPlan) return;
    setIsSaving(true);
    try {
      const response = await loadingPlanService.addLine(selectedPlan.id, data);
      const line = response.data?.cargoLine;
      const nextPlan = {
        ...selectedPlan,
        cargoLines: [...(selectedPlan.cargoLines || []), line],
        totalWeightKg:
          Number(selectedPlan.totalWeightKg || 0) + Number(data.weightKg),
      };
      setSelectedPlan(nextPlan);
      setPlans((current) =>
        current.map((plan) => (plan.id === nextPlan.id ? nextPlan : plan)),
      );
      setModal(null);
      setError("");
    } catch (requestError) {
      setError(
        getErrorMessage(requestError, "Impossible d'ajouter la marchandise."),
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleValidate = async () => {
    if (
      !selectedPlan ||
      !window.confirm("Valider définitivement ce plan de chargement ?")
    )
      return;
    setIsSaving(true);
    try {
      const response = await loadingPlanService.validatePlan(selectedPlan.id);
      const nextPlan = response.data?.loadingPlan;
      setSelectedPlan(nextPlan);
      setPlans((current) =>
        current.map((plan) => (plan.id === nextPlan.id ? nextPlan : plan)),
      );
      setError("");
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Impossible de valider le plan."));
    } finally {
      setIsSaving(false);
    }
  };

  const planColumns = useMemo(
    () => [
      { key: "reference", header: "Référence" },
      {
        key: "voyage",
        header: "Voyage",
        render: (plan) =>
          plan.voyage
            ? `${plan.voyage.voyageNumber} - ${plan.voyage.vessel?.name || ""}`
            : "-",
      },
      {
        key: "totalWeightKg",
        header: "Poids total",
        render: (plan) => `${toTons(plan.totalWeightKg)} t`,
      },
      { key: "status", header: "Statut" },
      {
        key: "actions",
        header: "Action",
        render: (plan) => (
          <Button variant="secondary" onClick={() => openPlan(plan)}>
            Ouvrir
          </Button>
        ),
      },
    ],
    [],
  );

  if (selectedPlan) {
    const capacityTons = selectedPlan.voyage?.vessel?.capacityTons;
    return (
      <div className="space-y-6">
        <PageHeader
          title={selectedPlan.reference}
          subtitle={`${selectedPlan.voyage?.vessel?.name || "Navire"} · Voyage ${selectedPlan.voyage?.voyageNumber || "-"}`}
        >
          <Button
            variant="secondary"
            icon={FiArrowLeft}
            onClick={() => setSelectedPlan(null)}
          >
            Retour aux plans
          </Button>
          {selectedPlan.status !== "VALIDATED" &&
            selectedPlan.status !== "CLOSED" && (
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader title="Poids total" />
            <CardContent>
              <p className="text-3xl font-bold text-slate-900">
                {toTons(selectedPlan.totalWeightKg)} t
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader title="Capacité navire" />
            <CardContent>
              <p className="text-3xl font-bold text-slate-900">
                {capacityTons ? `${capacityTons} t` : "Non définie"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader title="Lignes" />
            <CardContent>
              <p className="text-3xl font-bold text-slate-900">
                {selectedPlan.cargoLines?.length || 0}
              </p>
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader
            title="Marchandises"
            subtitle="Les poids sont recalculés par le serveur à chaque opération."
          >
            {selectedPlan.status !== "VALIDATED" &&
              selectedPlan.status !== "CLOSED" && (
                <Button
                  variant="primary"
                  icon={FiPlus}
                  onClick={() => {
                    setError("");
                    setModal("line");
                  }}
                >
                  Ajouter une marchandise
                </Button>
              )}
          </CardHeader>
          <CardContent>
            <Table
              columns={[
                {
                  key: "client",
                  header: "Client",
                  render: (line) => line.client?.name || "-",
                },
                { key: "description", header: "Marchandise" },
                { key: "packageCount", header: "Colis" },
                {
                  key: "weightKg",
                  header: "Poids",
                  render: (line) =>
                    `${Number(line.weightKg).toLocaleString("fr-FR")} kg`,
                },
                {
                  key: "loadingDate",
                  header: "Date",
                  render: (line) => formatDate(line.loadingDate),
                },
                { key: "loadingPosition", header: "Position" },
              ]}
              data={selectedPlan.cargoLines || []}
              emptyMessage="Aucune marchandise dans ce plan."
            />
          </CardContent>
        </Card>

        <CargoLineModal
          isOpen={modal === "line"}
          onClose={() => setModal(null)}
          clients={clients}
          onSubmit={handleAddLine}
          isSaving={isSaving}
          error={error}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Plans de chargement"
        subtitle="Créez un manifeste maritime et suivez le poids total des marchandises."
      >
        <Button
          variant="primary"
          icon={FiPlus}
          onClick={() => {
            setError("");
            setModal("plan");
          }}
        >
          Nouveau plan
        </Button>
      </PageHeader>
      {error && (
        <Alert variant="error" title="Erreur">
          {error}
        </Alert>
      )}
      <Table
        columns={planColumns}
        data={plans}
        isLoading={isLoading}
        emptyMessage="Aucun plan de chargement enregistré."
      />

      <PlanModal
        isOpen={modal === "plan"}
        onClose={() => setModal(null)}
        voyages={voyages}
        onSubmit={handleCreatePlan}
        isSaving={isSaving}
        error={error}
      />
    </div>
  );
}

export default LoadingPlansPage;

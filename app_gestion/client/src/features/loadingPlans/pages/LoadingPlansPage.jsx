import React, { useEffect, useMemo, useState } from "react";
import {
  FiArrowLeft,
  FiCheckCircle,
  FiEdit2,
  FiPlus,
  FiTrash2,
} from "react-icons/fi";
import { MdScale } from "react-icons/md";
import {
  Alert,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  Input,
  Modal,
  PageHeader,
  Select,
  Table,
} from "@/shared/components/ui";
import { loadingPlanService } from "@/features/loadingPlans";
import { maritimeService } from "@/features/maritime";
import { clientService } from "@/features/client";
import { driverService } from "@/features/driver";

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

const statusOptions = [
  { value: "DRAFT", label: "Brouillon" },
  { value: "SUBMITTED", label: "Soumis" },
];

function PlanForm({ voyages, onSubmit, onClose, isSaving, error }) {
  const [formData, setFormData] = useState({
    reference: "",
    voyageId: "",
    status: "DRAFT",
  });

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(formData);
      }}
    >
      {error && (
        <Alert variant="error" title="Création impossible">
          {error}
        </Alert>
      )}
      <Input
        label="Référence du plan"
        placeholder="Ex: PL-2026-001"
        value={formData.reference}
        onChange={(event) =>
          setFormData({ ...formData, reference: event.target.value })
        }
        required
      />
      <Select
        label="Voyage maritime"
        value={formData.voyageId}
        onChange={(event) =>
          setFormData({ ...formData, voyageId: event.target.value })
        }
        options={voyages.map((voyage) => ({
          value: voyage.id,
          label: `${voyage.voyageNumber} - ${voyage.vessel?.name || "Navire"}`,
        }))}
        required
      />
      <Select
        label="Statut initial"
        value={formData.status}
        onChange={(event) =>
          setFormData({ ...formData, status: event.target.value })
        }
        options={statusOptions}
      />
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onClose}>
          Annuler
        </Button>
        <Button type="submit" variant="primary" disabled={isSaving}>
          {isSaving ? "Création..." : "Créer le plan"}
        </Button>
      </div>
    </form>
  );
}

function CargoLineForm({
  clients,
  drivers,
  vehicles,
  onSubmit,
  onClose,
  isSaving,
  error,
}) {
  const [formData, setFormData] = useState({
    clientId: "",
    driverId: "",
    vehicleId: "",
    loadingDate: "",
    packageCount: "",
    description: "",
    weightKg: "",
    anomaly: "",
    loadingPosition: "",
    isHazardous: false,
  });
  const update = (name, value) =>
    setFormData((current) => ({ ...current, [name]: value }));

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit({
          ...formData,
          driverId: formData.driverId || null,
          vehicleId: formData.vehicleId || null,
          loadingDate: formData.loadingDate || null,
          packageCount: Number(formData.packageCount),
          weightKg: Number(formData.weightKg),
        });
      }}
    >
      {error && (
        <Alert variant="error" title="Ajout impossible">
          {error}
        </Alert>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          label="Client"
          value={formData.clientId}
          onChange={(event) => update("clientId", event.target.value)}
          options={clients.map((client) => ({
            value: client.id,
            label: client.name,
          }))}
          required
        />
        <Input
          label="Description de la marchandise"
          value={formData.description}
          onChange={(event) => update("description", event.target.value)}
          required
        />
        <Input
          label="Nombre de colis"
          type="number"
          min="1"
          step="1"
          value={formData.packageCount}
          onChange={(event) => update("packageCount", event.target.value)}
          required
        />
        <Input
          label="Poids total (kg)"
          type="number"
          min="0.01"
          step="0.01"
          value={formData.weightKg}
          onChange={(event) => update("weightKg", event.target.value)}
          required
        />
        <Select
          label="Chauffeur"
          value={formData.driverId}
          onChange={(event) => update("driverId", event.target.value)}
          options={[
            { value: "", label: "Non affecté" },
            ...drivers.map((driver) => ({
              value: driver.id,
              label: driver.name,
            })),
          ]}
        />
        <Select
          label="Véhicule"
          value={formData.vehicleId}
          onChange={(event) => update("vehicleId", event.target.value)}
          options={[
            { value: "", label: "Non affecté" },
            ...vehicles.map((vehicle) => ({
              value: vehicle.id,
              label: vehicle.licensePlate,
            })),
          ]}
        />
        <Input
          label="Date de chargement"
          type="date"
          value={formData.loadingDate}
          onChange={(event) => update("loadingDate", event.target.value)}
        />
        <Input
          label="Position de chargement"
          placeholder="Ex: C2"
          value={formData.loadingPosition}
          onChange={(event) => update("loadingPosition", event.target.value)}
        />
        <Input
          label="Anomalie"
          placeholder="Facultatif"
          value={formData.anomaly}
          onChange={(event) => update("anomaly", event.target.value)}
        />
        <label className="flex items-center gap-3 text-sm font-medium text-slate-700 pt-7">
          <input
            type="checkbox"
            checked={formData.isHazardous}
            onChange={(event) => update("isHazardous", event.target.checked)}
          />{" "}
          Marchandise dangereuse
        </label>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onClose}>
          Annuler
        </Button>
        <Button type="submit" variant="primary" disabled={isSaving}>
          {isSaving ? "Ajout..." : "Ajouter la marchandise"}
        </Button>
      </div>
    </form>
  );
}

function LoadingPlansPage() {
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [voyages, setVoyages] = useState([]);
  const [clients, setClients] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [modal, setModal] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [nextPlans, nextVoyages, nextClients, nextDrivers, nextVehicles] =
        await Promise.all([
          loadingPlanService.getPlans(),
          maritimeService.getAll("voyages"),
          clientService
            .getClients()
            .then((response) => response.data?.clients || []),
          driverService
            .getDrivers()
            .then((response) => response.data?.drivers || []),
          maritimeService.getAll("vehicles"),
        ]);
      setPlans(nextPlans);
      setVoyages(nextVoyages);
      setClients(nextClients);
      setDrivers(nextDrivers);
      setVehicles(nextVehicles);
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
        <Modal
          isOpen={modal === "line"}
          onClose={() => setModal(null)}
          title="Ajouter une marchandise"
          maxWidth="max-w-3xl"
        >
          <CargoLineForm
            clients={clients}
            drivers={drivers}
            vehicles={vehicles}
            onSubmit={handleAddLine}
            onClose={() => setModal(null)}
            isSaving={isSaving}
            error={error}
          />
        </Modal>
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
      <Modal
        isOpen={modal === "plan"}
        onClose={() => setModal(null)}
        title="Créer un plan de chargement"
      >
        <PlanForm
          voyages={voyages}
          onSubmit={handleCreatePlan}
          onClose={() => setModal(null)}
          isSaving={isSaving}
          error={error}
        />
      </Modal>
    </div>
  );
}

export default LoadingPlansPage;

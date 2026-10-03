import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FiArrowLeft,
  FiCheckCircle,
  FiEdit3,
  FiPlus,
  FiTrash2,
} from "react-icons/fi";
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
import { useAuth } from "@/features/auth";
import { clientService } from "@/features/client";
import { loadingPlanService } from "@/features/plans";
import {
  LoadingManifestPdf,
  UnloadingManifestPdf,
} from "../components/LoadingManifestPdf";

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

const toTons = (kg) =>
  (Number(kg || 0) / 1000).toLocaleString("fr-FR", {
    maximumFractionDigits: 3,
  });

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString("fr-FR") : "-";

const toDateInput = (value) => {
  if (!value) return "";
  const date = new Date(value);
  const pad = (part) => String(part).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

const emptyLoad = {
  clientId: "",
  packageCount: "",
  description: "",
  weightKg: "",
  driverName: "",
  vehiclePlate: "",
  loadingDate: "",
  loadingPosition: "",
  anomaly: "",
  isHazardous: false,
  status: "PENDING",
};

const statusLabel = (status, operationType) => {
  if (status === "CANCELLED") return "Annulé";
  if (status === "LOADED")
    return operationType === "UNLOAD" ? "Déchargé" : "Chargé";
  return operationType === "UNLOAD" ? "À décharger" : "À charger";
};

const formatLoader = (load) => {
  const loader = load.loadedBy;
  if (!loader?.name) return "Chargeur non renseigné";
  return loader.matricule
    ? `${loader.name} (${loader.matricule})`
    : loader.name;
};

function LoadPage({ operationType = "LOAD" }) {
  const { reference } = useParams();
  const navigate = useNavigate();
  const { checkPermission } = useAuth();
  const [plan, setPlan] = useState(null);
  const [clients, setClients] = useState([]);
  const [formData, setFormData] = useState(emptyLoad);
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
      const [planResponse, clientsResponse] = await Promise.all([
        loadingPlanService.getPlanByReference(reference),
        clientService.getClients(),
      ]);
      const nextPlan = planResponse?.data?.loadingPlan;
      if (!nextPlan || (nextPlan.operationType || "LOAD") !== operationType) {
        setPlan(null);
        setError(
          `Aucun plan de ${operationLabel.toLowerCase()} trouvé pour cette référence.`,
        );
        return;
      }
      setPlan(nextPlan);
      setClients(clientsResponse?.data?.clients || []);
      setError("");
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Impossible de charger le plan."));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [reference, operationType]);

  const openCreateModal = () => {
    setEditingLoad(null);
    setFormData({ ...emptyLoad });
    setError("");
    setIsModalOpen(true);
  };

  const openEditModal = (load) => {
    setEditingLoad(load);
    setFormData({
      clientId: load.clientId || "",
      packageCount: String(load.packageCount ?? ""),
      description: load.description || "",
      weightKg: String(load.weightKg ?? ""),
      driverName: load.driverName || "",
      vehiclePlate: load.vehiclePlate || "",
      loadingDate: toDateInput(load.loadingDate),
      loadingPosition: load.loadingPosition || "",
      anomaly: load.anomaly || "",
      isHazardous: Boolean(load.isHazardous),
      status: load.status || "PENDING",
    });
    setError("");
    setIsModalOpen(true);
  };

  const updateField = (name, value) =>
    setFormData((current) => ({ ...current, [name]: value }));

  const handleSaveLoad = async (event) => {
    event.preventDefault();
    if (!plan) return;
    setIsSaving(true);
    setError("");
    const payload = {
      ...formData,
      packageCount: Number(formData.packageCount),
      weightKg: Number(formData.weightKg),
      driverName: formData.driverName || null,
      vehiclePlate: formData.vehiclePlate || null,
      loadingDate: formData.loadingDate || null,
      loadingPosition: formData.loadingPosition || null,
      anomaly: formData.anomaly || null,
    };
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
  const capacityTons = Number(plan?.voyage?.vessel?.capacityTons || 0);
  const capacityKg = capacityTons * 1000;
  const loadColumns = [
    {
      key: "client",
      header: "Client",
      render: (load) => load.client?.name || "-",
    },
    { key: "description", header: "Marchandise" },
    { key: "packageCount", header: "Colis" },
    {
      key: "weightKg",
      header: "Poids",
      render: (load) => `${Number(load.weightKg).toLocaleString("fr-FR")} kg`,
    },
    {
      key: "driverName",
      header: isUnload ? "Chauffeur déchargement" : "Chauffeur",
      render: (load) => load.driverName || "-",
    },
    {
      key: "vehiclePlate",
      header: isUnload ? "Véhicule déchargement" : "Véhicule",
      render: (load) => load.vehiclePlate || "-",
    },
    {
      key: "loadedBy",
      header: isUnload ? "Déchargeur" : "Chargeur",
      render: (load) => formatLoader(load),
    },
    {
      key: "loadingDate",
      header: isUnload ? "Date de déchargement" : "Date de chargement",
      render: (load) => formatDate(load.loadingDate),
    },
    {
      key: "loadingPosition",
      header: "Position",
      render: (load) => load.loadingPosition || "-",
    },
    {
      key: "anomaly",
      header: "Anomalie",
      render: (load) => load.anomaly || "-",
    },
    {
      key: "isHazardous",
      header: "Dangereux",
      render: (load) =>
        load.isHazardous ? <Badge variant="error">Oui</Badge> : "Non",
    },
    {
      key: "status",
      header: "État",
      render: (load) => (
        <Badge
          variant={
            load.status === "LOADED"
              ? "success"
              : load.status === "CANCELLED"
                ? "error"
                : "warning"
          }
        >
          {statusLabel(load.status, operationType)}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (load) => (
        <div className="flex items-center gap-1.5">
          {!isLocked && canUpdateLoads && (
            <Button
              variant="ghost"
              size="sm"
              icon={FiEdit3}
              title="Modifier"
              aria-label="Modifier"
              onClick={() => openEditModal(load)}
            />
          )}
          {!isLocked && canDeleteLoads && (
            <Button
              variant="ghost"
              size="sm"
              icon={FiTrash2}
              title="Supprimer"
              aria-label="Supprimer"
              onClick={() => handleDeleteLoad(load)}
            />
          )}
        </div>
      ),
    },
  ];

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
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card>
              <CardHeader title="Poids total" />
              <CardContent>
                <p className="text-3xl font-bold text-slate-900">
                  {toTons(plan.totalWeightKg)} t
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader title="Capacité navire" />
              <CardContent>
                <p className="text-3xl font-bold text-slate-900">
                  {capacityTons
                    ? `${capacityTons.toLocaleString("fr-FR")} t`
                    : "Non définie"}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader title="Marchandises" />
              <CardContent>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-3xl font-bold text-slate-900">
                    {loads.length}
                  </p>
                  <Badge variant={isLocked ? "success" : "warning"}>
                    {isLocked ? "Validé" : plan.status ? "Terminé" : "En cours"}
                  </Badge>
                </div>
                {capacityKg > 0 && (
                  <>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full bg-emerald-600 transition-[width]"
                        style={{
                          width: `${Math.min((Number(plan.totalWeightKg || 0) / capacityKg) * 100, 100)}%`,
                        }}
                      />
                    </div>
                    <p className="mt-2 text-sm text-slate-500">
                      Utilisation : {toTons(plan.totalWeightKg)} /{" "}
                      {capacityTons.toLocaleString("fr-FR")} t
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader
              title="Manifeste de marchandises"
              subtitle={
                isLocked
                  ? `Validé le ${formatDate(plan.validatedAt)}${plan.validatedBy?.name ? ` par ${plan.validatedBy.name}` : ""}`
                  : "Le total et la capacité sont contrôlés par le serveur."
              }
            >
              {!isLocked && canManageLoads && (
                <Button
                  variant="primary"
                  icon={FiPlus}
                  onClick={openCreateModal}
                  disabled={isSaving}
                >
                  Ajouter une marchandise
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <Table
                columns={loadColumns}
                data={loads}
                isLoading={isSaving}
                emptyMessage="Aucune marchandise dans ce plan."
              />
            </CardContent>
          </Card>
        </>
      ) : null}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          editingLoad ? "Modifier la marchandise" : "Ajouter une marchandise"
        }
        maxWidth="max-w-3xl"
      >
        <form className="space-y-4" onSubmit={handleSaveLoad}>
          {error && (
            <Alert variant="error" title="Enregistrement impossible">
              {error}
            </Alert>
          )}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Select
              label="Client"
              value={formData.clientId}
              onChange={(event) => updateField("clientId", event.target.value)}
              options={clients
                .filter((client) => client.isActive !== false)
                .map((client) => ({ value: client.id, label: client.name }))}
              placeholder="Sélectionner un client"
              required
            />
            <Input
              label="Description"
              value={formData.description}
              onChange={(event) =>
                updateField("description", event.target.value)
              }
              required
            />
            <Input
              label="Nombre de colis"
              type="number"
              min="1"
              step="1"
              value={formData.packageCount}
              onChange={(event) =>
                updateField("packageCount", event.target.value)
              }
              required
            />
            <Input
              label="Poids total (kg)"
              type="number"
              min="0.01"
              step="0.01"
              value={formData.weightKg}
              onChange={(event) => updateField("weightKg", event.target.value)}
              required
            />
            <Input
              label={isUnload ? "Chauffeur au déchargement" : "Chauffeur"}
              value={formData.driverName}
              onChange={(event) =>
                updateField("driverName", event.target.value)
              }
            />
            <Input
              label={isUnload ? "Immatriculation au déchargement" : "Immatriculation"}
              value={formData.vehiclePlate}
              onChange={(event) =>
                updateField("vehiclePlate", event.target.value)
              }
            />
            <Input
              label={isUnload ? "Date de déchargement" : "Date de chargement"}
              type="date"
              value={formData.loadingDate}
              onChange={(event) =>
                updateField("loadingDate", event.target.value)
              }
            />
            <Input
              label="Position"
              value={formData.loadingPosition}
              onChange={(event) =>
                updateField("loadingPosition", event.target.value)
              }
            />
            <Input
              label="Anomalie"
              value={formData.anomaly}
              onChange={(event) => updateField("anomaly", event.target.value)}
            />
            <Select
              label="État"
              value={formData.status}
              onChange={(event) => updateField("status", event.target.value)}
              options={[
                {
                  value: "PENDING",
                  label: isUnload ? "À décharger" : "À charger",
                },
                { value: "LOADED", label: isUnload ? "Déchargé" : "Chargé" },
                { value: "CANCELLED", label: "Annulé" },
              ]}
            />
            <label className="flex items-center gap-3 text-sm font-medium text-slate-700 sm:pt-7">
              <input
                type="checkbox"
                checked={formData.isHazardous}
                onChange={(event) =>
                  updateField("isHazardous", event.target.checked)
                }
              />
              Marchandise dangereuse
            </label>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
            >
              Annuler
            </Button>
            <Button type="submit" variant="primary" isLoading={isSaving}>
              {editingLoad ? "Enregistrer" : "Ajouter"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default LoadPage;

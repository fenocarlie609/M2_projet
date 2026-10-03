import React, { useEffect, useState } from "react";
import { Alert, Button, Input, Modal, Select } from "@/shared/components/ui";

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

const toDateInput = (value) => {
  if (!value) return "";
  const date = new Date(value);
  const pad = (part) => String(part).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

const loadToForm = (load) => ({
  ...emptyLoad,
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

export function LoadEditorModal({
  isOpen,
  onClose,
  load,
  clients,
  operationType,
  isSaving,
  error,
  onSubmit,
}) {
  const [formData, setFormData] = useState(() =>
    load ? loadToForm(load) : { ...emptyLoad },
  );
  const isUnload = operationType === "UNLOAD";

  useEffect(() => {
    setFormData(load ? loadToForm(load) : { ...emptyLoad });
  }, [load, isOpen]);

  const updateField = (name, value) =>
    setFormData((current) => ({ ...current, [name]: value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    await onSubmit({
      ...formData,
      packageCount: Number(formData.packageCount),
      weightKg: Number(formData.weightKg),
      driverName: formData.driverName || null,
      vehiclePlate: formData.vehiclePlate || null,
      loadingDate: formData.loadingDate || null,
      loadingPosition: formData.loadingPosition || null,
      anomaly: formData.anomaly || null,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={load ? "Modifier la marchandise" : "Ajouter une marchandise"}
      maxWidth="max-w-3xl"
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
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
            onChange={(event) => updateField("description", event.target.value)}
            required
          />
          <Input
            label="Nombre de colis"
            type="number"
            min="1"
            step="1"
            value={formData.packageCount}
            onChange={(event) => updateField("packageCount", event.target.value)}
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
            onChange={(event) => updateField("driverName", event.target.value)}
          />
          <Input
            label={
              isUnload ? "Immatriculation au déchargement" : "Immatriculation"
            }
            value={formData.vehiclePlate}
            onChange={(event) => updateField("vehiclePlate", event.target.value)}
          />
          <Input
            label={isUnload ? "Date de déchargement" : "Date de chargement"}
            type="date"
            value={formData.loadingDate}
            onChange={(event) => updateField("loadingDate", event.target.value)}
          />
          <Input
            label="Position"
            value={formData.loadingPosition}
            onChange={(event) => updateField("loadingPosition", event.target.value)}
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
              { value: "PENDING", label: isUnload ? "À décharger" : "À charger" },
              { value: "LOADED", label: isUnload ? "Déchargé" : "Chargé" },
              { value: "CANCELLED", label: "Annulé" },
            ]}
          />
          <label className="flex items-center gap-3 text-sm font-medium text-slate-700 sm:pt-7">
            <input
              type="checkbox"
              checked={formData.isHazardous}
              onChange={(event) => updateField("isHazardous", event.target.checked)}
            />
            Marchandise dangereuse
          </label>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" variant="primary" isLoading={isSaving}>
            {load ? "Enregistrer" : "Ajouter"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

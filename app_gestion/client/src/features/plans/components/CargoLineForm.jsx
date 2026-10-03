// src/features/loadingPlans/components/CargoLineForm.jsx
import React, { useState } from "react";
import { Alert, Button, Input, Select } from "@/shared/components/ui";

export function CargoLineForm({
  clients,
  drivers = [],
  vehicles = [],
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

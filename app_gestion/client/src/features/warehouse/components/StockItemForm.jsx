// src/features/warehouse/components/StockItemForm.jsx
import React, { useEffect, useState } from "react";
import { Input, Select, Button } from "@/shared/components/ui";

const VIDE = {
  warehouseId: "",
  clientId: "",
  description: "",
  packageCount: "",
  weightKg: "",
};

export function StockItemForm({
  warehouses = [],
  clients = [],
  onSubmit,
  onCancel,
  isSubmitting,
}) {
  const [formData, setFormData] = useState(VIDE);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setFormData(VIDE);
    setErrors({});
  }, [warehouses, clients]);

  const updateField = (field, value) =>
    setFormData((precedent) => ({ ...precedent, [field]: value }));

  const handleSubmit = async (event) => {
    event.preventDefault();

    const nouvellesErreurs = {};
    if (!formData.warehouseId) {
      nouvellesErreurs.warehouseId = "L'entrepôt est requis";
    }
    if (!formData.clientId) nouvellesErreurs.clientId = "Le client est requis";
    if (!formData.description.trim()) {
      nouvellesErreurs.description = "La description est requise";
    }
    if (Number(formData.packageCount) <= 0) {
      nouvellesErreurs.packageCount = "Le nombre de colis doit être positif";
    }
    if (Number(formData.weightKg) <= 0) {
      nouvellesErreurs.weightKg = "Le poids doit être positif";
    }
    setErrors(nouvellesErreurs);
    if (Object.keys(nouvellesErreurs).length > 0) return;

    await onSubmit({
      warehouseId: formData.warehouseId,
      clientId: formData.clientId,
      description: formData.description.trim(),
      packageCount: Number(formData.packageCount),
      weightKg: Number(formData.weightKg),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          label="Entrepôt"
          id="stock-warehouse"
          value={formData.warehouseId}
          onChange={(e) => updateField("warehouseId", e.target.value)}
          options={warehouses.map((entrepot) => ({
            value: entrepot.id,
            label: `${entrepot.code} — ${entrepot.name}`,
          }))}
          placeholder="Choisir un entrepôt"
          error={errors.warehouseId}
        />
        <Select
          label="Client"
          id="stock-client"
          value={formData.clientId}
          onChange={(e) => updateField("clientId", e.target.value)}
          options={clients.map((client) => ({
            value: client.id,
            label: client.name,
          }))}
          placeholder="Choisir un client"
          error={errors.clientId}
        />
      </div>

      <Input
        label="Description de la marchandise"
        id="stock-description"
        value={formData.description}
        onChange={(e) => updateField("description", e.target.value)}
        error={errors.description}
        placeholder="Café vert en sacs de 60 kg"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Nombre de colis"
          id="stock-packages"
          type="number"
          min="1"
          value={formData.packageCount}
          onChange={(e) => updateField("packageCount", e.target.value)}
          error={errors.packageCount}
        />
        <Input
          label="Poids (kg)"
          id="stock-weight"
          type="number"
          min="0"
          step="0.01"
          value={formData.weightKg}
          onChange={(e) => updateField("weightKg", e.target.value)}
          error={errors.weightKg}
        />
      </div>

      <p className="text-[11px] text-slate-500 bg-slate-50 border border-slate-200 rounded-xl p-3">
        L'entrée en entrepôt est traceability : un mouvement de type « entrée » est
        enregistré avec la date et l'agent. Les marchandises sorties par un navire
        s'enregistrent automatiquement depuis le plan de déchargement validé.
      </p>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit" variant="primary" isLoading={isSubmitting}>
          Enregistrer l'entrée
        </Button>
      </div>
    </form>
  );
}

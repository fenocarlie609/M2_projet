// src/features/warehouse/components/StockItemForm.jsx
import React, { useEffect, useState } from "react";
import { Input, Select, Button, Alert } from "@/shared/components/ui";
import { formatDate } from "@/shared/utils";

const VIDE = {
  entrepotId: "",
  clientId: "",
  description: "",
  packageCount: "",
  weightKg: "",
};

export function StockItemForm({
  warehouses = [],
  clients = [],
  availableItems = [],
  onSubmit,
  onCancel,
  isSubmitting,
}) {
  const [formData, setFormData] = useState(VIDE);
  const [errors, setErrors] = useState({});
  const [source, setSource] = useState("manuel");

  useEffect(() => {
    setFormData(VIDE);
    setErrors({});
  }, [warehouses, clients]);

  const updateField = (field, value) =>
    setFormData((precedent) => ({ ...precedent, [field]: value }));

  // Selection d'une marchandise dechargee du navire : les valeurs sont
  // reprises telles quelles, l'agent n'a plus qu'a confirmer l'entrepot.
  const choisirDisponible = (identifiant) => {
    const ligne = availableItems.find((item) => item.id === identifiant);
    if (!ligne) {
      setSource("manuel");
      return;
    }
    setSource("disponible");
    setFormData({
      entrepotId: formData.entrepotId,
      clientId: ligne.clientId,
      description: ligne.description,
      packageCount: String(ligne.packageCount),
      weightKg: String(ligne.weightKg),
    });
    setErrors({});
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const nouvellesErreurs = {};
    if (!formData.entrepotId) {
      nouvellesErreurs.entrepotId = "L'entrepôt est requis";
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
      warehouseId: formData.entrepotId,
      clientId: formData.clientId,
      description: formData.description.trim(),
      packageCount: Number(formData.packageCount),
      weightKg: Number(formData.weightKg),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {availableItems.length > 0 && (
        <Alert variant="info" title="Marchandises arrivées par le navire">
          Ces marchandises ont été déchargées d'un plan de déchargement validé.
          Choisissez-en une pour l'enregistrer en entrepôt, ou saisissez une
          marchandise déposée directement par le client.
        </Alert>
      )}

      {availableItems.length > 0 && (
        <Select
          label="Marchandise déchargée"
          id="stock-disponible"
          value={source === "disponible" ? formData.description : ""}
          onChange={(e) => choisirDisponible(e.target.value)}
          options={[
            { value: "", label: "Saisie manuelle" },
            ...availableItems.map((item) => ({
              value: item.id,
              label: `${item.description} — ${item.client} (${item.plan}, ${formatDate(
                item.voyage,
              )})`,
            })),
          ]}
          placeholder="Choisir une marchandise"
        />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          label="Entrepôt"
          id="stock-warehouse"
          value={formData.entrepotId}
          onChange={(e) => updateField("entrepotId", e.target.value)}
          options={warehouses.map((entrepot) => ({
            value: entrepot.id,
            label: `${entrepot.code} — ${entrepot.name}`,
          }))}
          placeholder="Choisir un entrepôt"
          error={errors.entrepotId}
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
        L'entrée en entrepôt est tracée : un mouvement de type « entrée » est
        enregistré avec la date et l'agent. Les marchandises sorties par un
        navire s'enregistrent en un clic depuis le plan de déchargement validé.
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

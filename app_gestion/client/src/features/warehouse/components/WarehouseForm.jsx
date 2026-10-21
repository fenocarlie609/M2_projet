// src/features/warehouse/components/WarehouseForm.jsx
import React, { useEffect, useState } from "react";
import { Input, Button } from "@/shared/components/ui";

const VIDE = {
  code: "",
  name: "",
  address: "",
  city: "",
  capacityTons: "",
};

export function WarehouseForm({
  selectedWarehouse,
  onSubmit,
  onCancel,
  isSubmitting,
}) {
  const [formData, setFormData] = useState(VIDE);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (selectedWarehouse) {
      setFormData({
        code: selectedWarehouse.code || "",
        name: selectedWarehouse.name || "",
        address: selectedWarehouse.address || "",
        city: selectedWarehouse.city || "",
        capacityTons:
          selectedWarehouse.capacityTons === null ||
          selectedWarehouse.capacityTons === undefined
            ? ""
            : String(selectedWarehouse.capacityTons),
      });
    } else {
      setFormData(VIDE);
    }
    setErrors({});
  }, [selectedWarehouse]);

  const updateField = (field, value) =>
    setFormData((precedent) => ({ ...precedent, [field]: value }));

  const handleSubmit = async (event) => {
    event.preventDefault();

    const nouvellesErreurs = {};
    if (!formData.code.trim()) nouvellesErreurs.code = "Le code est requis";
    if (!formData.name.trim()) nouvellesErreurs.name = "Le nom est requis";
    if (
      formData.capacityTons !== "" &&
      Number(formData.capacityTons) <= 0
    ) {
      nouvellesErreurs.capacityTons = "La capacité doit être positive";
    }
    setErrors(nouvellesErreurs);
    if (Object.keys(nouvellesErreurs).length > 0) return;

    await onSubmit({
      code: formData.code.trim().toUpperCase(),
      name: formData.name.trim(),
      address: formData.address.trim() || null,
      city: formData.city.trim() || null,
      capacityTons:
        formData.capacityTons === "" ? null : Number(formData.capacityTons),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Code"
          id="warehouse-code"
          value={formData.code}
          onChange={(e) => updateField("code", e.target.value)}
          error={errors.code}
          placeholder="ANT-01"
        />
        <Input
          label="Nom"
          id="warehouse-name"
          value={formData.name}
          onChange={(e) => updateField("name", e.target.value)}
          error={errors.name}
          placeholder="Dépôt d'Antananarivo"
        />
      </div>

      <Input
        label="Adresse"
        id="warehouse-address"
        value={formData.address}
        onChange={(e) => updateField("address", e.target.value)}
        placeholder="Zone industrielle, Lot 118"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Ville"
          id="warehouse-city"
          value={formData.city}
          onChange={(e) => updateField("city", e.target.value)}
          placeholder="Antananarivo"
        />
        <Input
          label="Capacité (tonnes)"
          id="warehouse-capacity"
          type="number"
          min="0"
          step="0.01"
          value={formData.capacityTons}
          onChange={(e) => updateField("capacityTons", e.target.value)}
          error={errors.capacityTons}
          placeholder="500"
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit" variant="primary" isLoading={isSubmitting}>
          Enregistrer
        </Button>
      </div>
    </form>
  );
}

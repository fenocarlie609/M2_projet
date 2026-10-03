// src/features/ship/components/ShipForm.jsx
import React, { useEffect, useState } from "react";
import { Alert, Button, Form, Input, Select } from "@/shared/components/ui";
import { getApiErrorMessage } from "@/shared/utils/getApiErrorMessage";

const emptyForm = {
  name: "",
  operatorName: "",
  registrationNumber: "",
  capacityTons: "",
  status: "ACTIVE",
};

const clean = (value) => (value === "" ? null : value);

const shipToForm = (ship) => ({
  ...emptyForm,
  ...ship,
  capacityTons:
    ship.capacityTons === null || ship.capacityTons === undefined
      ? ""
      : String(ship.capacityTons),
});

export function ShipForm({
  selectedShip,
  onSubmit,
  onClose,
  isSubmitting,
  serverError,
  submitLabel,
}) {
  const [formData, setFormData] = useState(() =>
    selectedShip ? shipToForm(selectedShip) : { ...emptyForm },
  );
  const [error, setError] = useState("");

  useEffect(() => {
    setFormData(selectedShip ? shipToForm(selectedShip) : { ...emptyForm });
    setError("");
  }, [selectedShip]);

  useEffect(() => {
    setError(serverError || "");
  }, [serverError]);

  const update = (name, value) => {
    setFormData((current) => ({ ...current, [name]: value }));
    setError("");
  };

  const handleSubmit = async () => {
    try {
      await onSubmit({
        ...formData,
        operatorName: clean(formData.operatorName),
        capacityTons: formData.capacityTons
          ? Number(formData.capacityTons)
          : null,
      });
    } catch (submitError) {
      setError(getApiErrorMessage(submitError));
    }
  };

  return (
    <Form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <Alert variant="error" title="Enregistrement impossible">
          {error}
        </Alert>
      )}

      <Input
        label="Nom du navire"
        value={formData.name}
        onChange={(event) => update("name", event.target.value)}
        placeholder="Ex: MV Toamasina Express"
        required
      />

      <Input
        label="Transporteur / Opérateur"
        value={formData.operatorName || ""}
        onChange={(event) => update("operatorName", event.target.value)}
        placeholder="Ex: Madagascar Shipping Co."
      />

      <Input
        label="Numéro d'immatriculation"
        value={formData.registrationNumber}
        onChange={(event) => update("registrationNumber", event.target.value)}
        placeholder="Ex: MDG-2026-0142"
        required
      />

      <Input
        label="Capacité (tonnes)"
        type="number"
        min="0"
        step="0.01"
        value={formData.capacityTons}
        onChange={(event) => update("capacityTons", event.target.value)}
        placeholder="Ex: 12000"
      />

      <Select
        label="Statut"
        value={formData.status}
        onChange={(event) => update("status", event.target.value)}
        options={[
          { value: "ACTIVE", label: "Actif" },
          { value: "INACTIVE", label: "Inactif" },
          { value: "MAINTENANCE", label: "Maintenance" },
        ]}
      />

      <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
        <Button type="button" variant="ghost" onClick={onClose}>
          Annuler
        </Button>
        <Button type="submit" variant="primary" isLoading={isSubmitting}>
          {submitLabel}
        </Button>
      </div>
    </Form>
  );
}

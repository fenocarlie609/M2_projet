// src/features/voyage/components/VoyageForm.jsx
import React, { useEffect, useState } from "react";
import { Alert, Button, Form, Input, Select } from "@/shared/components/ui";
import { getApiErrorMessage } from "@/shared/utils/getApiErrorMessage";
import { shipService } from "@/features/ship";
import { portService } from "@/features/ports";

const emptyForm = {
  voyageNumber: "",
  vesselId: "",
  departurePortId: "",
  arrivalPortId: "",
  departureDate: "",
  arrivalDate: "",
  status: "SCHEDULED",
};

const toDateInput = (value) => (value ? String(value).slice(0, 10) : "");

const voyageToForm = (voyage) => ({
  ...emptyForm,
  ...voyage,
  vesselId: voyage.vesselId || voyage.vessel?.id || "",
  departurePortId: voyage.departurePortId || voyage.departurePort?.id || "",
  arrivalPortId: voyage.arrivalPortId || voyage.arrivalPort?.id || "",
  departureDate: toDateInput(voyage.departureDate),
  arrivalDate: toDateInput(voyage.arrivalDate),
});

const STATUS_OPTIONS = [
  { value: "SCHEDULED", label: "Planifié" },
  { value: "IN_TRANSIT", label: "En transit" },
  { value: "ARRIVED", label: "Arrivé" },
  { value: "CANCELLED", label: "Annulé" },
];

export function VoyageForm({
  selectedVoyage,
  onSubmit,
  onClose,
  isSubmitting,
  serverError,
  submitLabel,
}) {
  const [formData, setFormData] = useState(() =>
    selectedVoyage ? voyageToForm(selectedVoyage) : { ...emptyForm },
  );
  const [error, setError] = useState("");
  const [vessels, setVessels] = useState([]);
  const [ports, setPorts] = useState([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);

  useEffect(() => {
    setFormData(
      selectedVoyage ? voyageToForm(selectedVoyage) : { ...emptyForm },
    );
    setError("");
  }, [selectedVoyage]);

  useEffect(() => {
    setError(serverError || "");
  }, [serverError]);

  useEffect(() => {
    const loadOptions = async () => {
      try {
        setIsLoadingOptions(true);
        const [shipsResponse, portsResponse] = await Promise.all([
          shipService.getShips(),
          portService.getPorts(),
        ]);
        setVessels(shipsResponse.data?.ships || []);
        setPorts(portsResponse.data?.ports || []);
      } catch (loadError) {
        console.error("Erreur lors du chargement des options :", loadError);
      } finally {
        setIsLoadingOptions(false);
      }
    };

    loadOptions();
  }, []);

  const update = (name, value) => {
    setFormData((current) => ({ ...current, [name]: value }));
    setError("");
  };

  const handleSubmit = async () => {
    try {
      await onSubmit({
        ...formData,
        departureDate: formData.departureDate || null,
        arrivalDate: formData.arrivalDate || null,
      });
    } catch (submitError) {
      setError(getApiErrorMessage(submitError));
    }
  };

  const vesselOptions = vessels.map((vessel) => ({
    value: vessel.id,
    label: vessel.name,
  }));

  const portOptions = ports.map((port) => ({
    value: port.id,
    label: `${port.name} (${port.code})`,
  }));

  return (
    <Form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <Alert variant="error" title="Enregistrement impossible">
          {error}
        </Alert>
      )}

      <Input
        label="Numéro de voyage"
        value={formData.voyageNumber}
        onChange={(event) => update("voyageNumber", event.target.value)}
        placeholder="Ex: VY-2026-0142"
        required
      />

      <Select
        label="Navire"
        value={formData.vesselId}
        onChange={(event) => update("vesselId", event.target.value)}
        options={vesselOptions}
        placeholder="Sélectionner un navire"
        disabled={isLoadingOptions}
        required
      />

      <div className="grid grid-cols-2 gap-3">
        <Select
          label="Port de départ"
          value={formData.departurePortId}
          onChange={(event) => update("departurePortId", event.target.value)}
          options={portOptions}
          placeholder="Sélectionner un port"
          disabled={isLoadingOptions}
          required
        />

        <Select
          label="Port d'arrivée"
          value={formData.arrivalPortId}
          onChange={(event) => update("arrivalPortId", event.target.value)}
          options={portOptions}
          placeholder="Sélectionner un port"
          disabled={isLoadingOptions}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Date de départ"
          type="date"
          value={formData.departureDate}
          onChange={(event) => update("departureDate", event.target.value)}
        />

        <Input
          label="Date d'arrivée"
          type="date"
          value={formData.arrivalDate}
          onChange={(event) => update("arrivalDate", event.target.value)}
        />
      </div>

      <Select
        label="Statut"
        value={formData.status}
        onChange={(event) => update("status", event.target.value)}
        options={STATUS_OPTIONS}
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

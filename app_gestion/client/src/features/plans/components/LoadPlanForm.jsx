// src/features/loadingPlans/components/LoadPlanForm.jsx
import React, { useEffect, useState } from "react";
import { Alert, Button, Input, Select, Form } from "@/shared/components/ui";
import { getApiErrorMessage } from "@/shared/utils/getApiErrorMessage";

const emptyForm = {
  reference: "",
  voyageId: "",
  status: false,
};

const planToForm = (plan, operationType) => ({
  ...emptyForm,
  ...plan,
  voyageId: plan.voyageId || plan.voyage?.id || "",
  operationType: plan.operationType || operationType,
  status: Boolean(plan.status),
});

export function LoadPlanForm({
  selectedPlan,
  voyages,
  operationType = "LOAD",
  onSubmit,
  onClose,
  isSubmitting,
  serverError,
  submitLabel,
}) {
  const [formData, setFormData] = useState(() =>
    selectedPlan
      ? planToForm(selectedPlan, operationType)
      : { ...emptyForm, operationType },
  );

  const [error, setError] = useState("");

  useEffect(() => {
    setFormData(
      selectedPlan
        ? planToForm(selectedPlan, operationType)
        : { ...emptyForm, operationType },
    );
    setError("");
  }, [selectedPlan, operationType]);

  useEffect(() => {
    setError(serverError || "");
  }, [serverError]);

  const voyageOption = voyages.map((voyage) => ({
    value: voyage.id,
    label: `${voyage.voyageNumber} - ${voyage.vessel?.name || "Navire"}`,
  }));

  const update = (name, value) => {
    setFormData((current) => ({ ...current, [name]: value }));
    setError("");
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        reference: formData.reference.trim(),
        voyageId: formData.voyageId,
      };
      if (!selectedPlan) payload.operationType = operationType;
      await onSubmit(payload);
    } catch (submitError) {
      setError(getApiErrorMessage(submitError));
    }
  };

  return (
    <Form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <Alert variant="error" title="Création impossible">
          {error}
        </Alert>
      )}
      <Input
        label="Référence du plan"
        placeholder="Ex: PL-2026-001"
        value={formData.reference}
        onChange={(e) => update("reference", e.target.value)}
        required
      />
      <Select
        label="Voyage maritime"
        value={formData.voyageId}
        onChange={(e) => update("voyageId", e.target.value)}
        options={voyageOption}
        placeholder="Sélectionner un voyage"
        required
      />
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onClose}>
          Annuler
        </Button>
        <Button type="submit" variant="primary" isLoading={isSubmitting}>
          {submitLabel}
        </Button>
      </div>
    </Form>
  );
}

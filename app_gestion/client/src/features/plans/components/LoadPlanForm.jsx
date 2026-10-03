// src/features/loadingPlans/components/LoadPlanForm.jsx
import React, { useEffect, useState } from "react";
import { Alert, Button, Input, Select, Form } from "@/shared/components/ui";
import { getApiErrorMessage } from "@/shared/utils/getApiErrorMessage";

const emptyForm = {
  reference: "",
  voyageId: "",
  status: false,
};

const planToform = (plan) => ({
  ...emptyForm,
  ...plan,
  voyageId: plan.voyageId || plan.voyage.id || "",
  status: plan.status || false,
});

export function LoadPlanForm({
  selectedPlan,
  voyages,
  onSubmit,
  onClose,
  isSubmitting,
  serverError,
  submitLabel,
}) {
  const [formData, setFormData] = useState(() =>
    selectedPlan ? planToform(selectedPlan) : { ...emptyForm },
  );

  const [error, setError] = useState("");
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);

  useEffect(() => {
    setFormData(selectedPlan ? planToform(selectedPlan) : { ...emptyForm });
    setError("");
  }, [selectedPlan]);

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
      await onSubmit({
        ...formData,
        status: formData.status || false,
      });
    } catch (submitError) {
      console.log(submitError);
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
        disabled={isLoadingOptions}
        required
      />
      <Select
        label="Voyage maritime"
        value={formData.voyageId}
        onChange={(e) => update("voyageId", e.target.value)}
        options={voyageOption}
        placeholder="Sélectionner un voyage"
        disabled={isLoadingOptions}
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

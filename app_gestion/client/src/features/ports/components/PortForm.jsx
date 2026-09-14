// src/features/port/components/PortForm.jsx
import React, { useEffect, useState } from "react";
import { Alert, Button, Form, Input } from "@/shared/components/ui";
import { getApiErrorMessage } from "@/shared/utils/getApiErrorMessage";

const emptyForm = {
  code: "",
  name: "",
  country: "",
};

const portToForm = (port) => ({
  ...emptyForm,
  ...port,
});

export function PortForm({
  selectedPort,
  onSubmit,
  onClose,
  isSubmitting,
  serverError,
  submitLabel,
}) {
  const [formData, setFormData] = useState(() =>
    selectedPort ? portToForm(selectedPort) : { ...emptyForm },
  );
  const [error, setError] = useState("");

  useEffect(() => {
    setFormData(selectedPort ? portToForm(selectedPort) : { ...emptyForm });
    setError("");
  }, [selectedPort]);

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
        code: formData.code.trim().toUpperCase(),
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
        label="Code du port"
        value={formData.code}
        onChange={(event) => update("code", event.target.value)}
        placeholder="Ex: MDTOA"
        required
      />

      <Input
        label="Nom du port"
        value={formData.name}
        onChange={(event) => update("name", event.target.value)}
        placeholder="Ex: Port de Toamasina"
        required
      />

      <Input
        label="Pays"
        value={formData.country}
        onChange={(event) => update("country", event.target.value)}
        placeholder="Ex: Madagascar"
        required
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

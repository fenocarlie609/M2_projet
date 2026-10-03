import React, { useEffect, useState } from "react";
import { Alert, Button, Form, Input, Select } from "@/shared/components/ui";
import { getApiErrorMessage } from "@/shared/utils/getApiErrorMessage";

const emptyForm = {
  name: "",
  type: "INDIVIDUAL",
  phone: "",
  email: "",
  address: "",
};

const clientToForm = (client) => ({
  ...emptyForm,
  name: client.name || "",
  type: client.type || "INDIVIDUAL",
  phone: client.phone || "",
  email: client.email || "",
  address:
    client.address ||
    client.addresses?.find((address) => address.isDefault)?.addressLine1 ||
    client.addresses?.[0]?.addressLine1 ||
    "",
});

const clean = (value) => value.trim() || null;

export function ClientForm({
  selectedClient,
  onSubmit,
  onClose,
  isSubmitting,
  serverError,
  submitLabel,
}) {
  const [formData, setFormData] = useState(() =>
    selectedClient ? clientToForm(selectedClient) : { ...emptyForm },
  );
  const [error, setError] = useState("");

  useEffect(() => {
    setFormData(
      selectedClient ? clientToForm(selectedClient) : { ...emptyForm },
    );
    setError("");
  }, [selectedClient]);

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
        name: formData.name.trim(),
        type: formData.type,
        phone: clean(formData.phone),
        email: clean(formData.email),
        address: clean(formData.address),
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="Nom ou raison sociale"
          value={formData.name}
          onChange={(event) => update("name", event.target.value)}
          autoFocus
          required
        />
        <Select
          label="Type de client"
          value={formData.type}
          onChange={(event) => update("type", event.target.value)}
          options={[
            { value: "INDIVIDUAL", label: "Particulier" },
            { value: "COMPANY", label: "Entreprise" },
          ]}
          required
        />
        <Input
          label="Téléphone"
          type="tel"
          value={formData.phone}
          onChange={(event) => update("phone", event.target.value)}
        />
        <Input
          label="Email"
          type="email"
          value={formData.email}
          onChange={(event) => update("email", event.target.value)}
        />
        <div className="sm:col-span-2">
          <Input
            label="Adresse"
            value={formData.address}
            onChange={(event) => update("address", event.target.value)}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
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
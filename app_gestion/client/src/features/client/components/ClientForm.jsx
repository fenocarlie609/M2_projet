import React, { useEffect, useState } from "react";
import { Alert, Button, Form, Input, Select } from "@/shared/components/ui";
import { getApiErrorMessage } from "@/shared/utils/getApiErrorMessage";

const emptyAddress = {
  addressLine1: "",
  addressLine2: "",
  city: "",
  region: "",
  postalCode: "",
  country: "Madagascar",
};

const emptyForm = {
  reference: "",
  name: "",
  type: "INDIVIDUAL",
  firstName: "",
  lastName: "",
  cin: "",
  cinIssuedAt: "",
  cinIssuedPlace: "",
  legalName: "",
  tradeName: "",
  nif: "",
  stat: "",
  rcs: "",
  legalForm: "",
  activity: "",
  email: "",
  phone: "",
  secondaryPhone: "",
  paymentTerms: "",
  currency: "MGA",
  taxExempt: false,
  taxExemptionReason: "",
  contractNumber: "",
  habitualCargoType: "",
  receptionContactName: "",
  receptionContactPhone: "",
  receptionContactEmail: "",
  notes: "",
  billingAddress: emptyAddress,
  deliveryAddress: emptyAddress,
};

const toInputDate = (value) => (value ? String(value).slice(0, 10) : "");
const clean = (value) => (value === "" ? null : value);

const addressFromClient = (addresses = [], type) => {
  const address = addresses.find(
    (item) => item.type === type || item.type === "BOTH",
  );
  return address ? { ...emptyAddress, ...address } : { ...emptyAddress };
};

const clientToForm = (client) => ({
  ...emptyForm,
  ...client,
  cinIssuedAt: toInputDate(client.cinIssuedAt),
  billingAddress: addressFromClient(client.addresses, "BILLING"),
  deliveryAddress: addressFromClient(client.addresses, "DELIVERY"),
});

const addressPayload = (address, type) => {
  if (!address.addressLine1.trim()) return null;
  return {
    type,
    ...address,
    addressLine1: address.addressLine1.trim(),
    addressLine2: clean(address.addressLine2),
    city: clean(address.city),
    region: clean(address.region),
    postalCode: clean(address.postalCode),
    country: address.country || "Madagascar",
    isDefault: true,
  };
};

function FieldGroup({ title, children }) {
  return (
    <section className="space-y-3 border-t border-slate-100 pt-4 first:border-t-0 first:pt-0">
      <h4 className="text-sm font-bold text-slate-900">{title}</h4>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}

function AddressFields({ title, address, onChange }) {
  return (
    <FieldGroup title={title}>
      <Input
        label="Adresse"
        value={address.addressLine1}
        onChange={(event) => onChange("addressLine1", event.target.value)}
      />
      <Input
        label="Complément"
        value={address.addressLine2}
        onChange={(event) => onChange("addressLine2", event.target.value)}
      />
      <Input
        label="Ville"
        value={address.city}
        onChange={(event) => onChange("city", event.target.value)}
      />
      <Input
        label="Région"
        value={address.region}
        onChange={(event) => onChange("region", event.target.value)}
      />
      <Input
        label="Code postal"
        value={address.postalCode}
        onChange={(event) => onChange("postalCode", event.target.value)}
      />
      <Input
        label="Pays"
        value={address.country}
        onChange={(event) => onChange("country", event.target.value)}
      />
    </FieldGroup>
  );
}

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
      selectedClient
        ? clientToForm(selectedClient)
        : {
            ...emptyForm,
            billingAddress: { ...emptyAddress },
            deliveryAddress: { ...emptyAddress },
          },
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

  const updateAddress = (type, name, value) => {
    setFormData((current) => ({
      ...current,
      [type]: { ...current[type], [name]: value },
    }));
  };

  const handleSubmit = async () => {
    try {
      const {
        billingAddress,
        deliveryAddress,
        addresses: _addresses,
        documents: _documents,
        ...clientData
      } = formData;
      const addresses = [
        addressPayload(billingAddress, "BILLING"),
        addressPayload(deliveryAddress, "DELIVERY"),
      ].filter(Boolean);
      const documents = formData.nif
        ? [{ documentType: "NIF", documentNumber: formData.nif }]
        : [];

      await onSubmit({
        ...clientData,
        cinIssuedAt: clean(clientData.cinIssuedAt),
        email: clean(clientData.email),
        receptionContactEmail: clean(clientData.receptionContactEmail),
        addresses,
        documents,
      });
    } catch (submitError) {
      setError(getApiErrorMessage(submitError));
    }
  };

  return (
    <Form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="error" title="Enregistrement impossible">
          {error}
        </Alert>
      )}

      <FieldGroup title="Identité">
        <Input
          label="Référence interne"
          value={formData.reference || ""}
          onChange={(event) => update("reference", event.target.value)}
          placeholder="Ex: CLI-0001"
        />
        <Input
          label={formData.type === "COMPANY" ? "Raison sociale" : "Nom complet"}
          value={formData.name}
          onChange={(event) => update("name", event.target.value)}
          required
        />
        <div className="sm:col-span-2 flex flex-wrap gap-5 rounded-xl bg-slate-50 p-3">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <input
              type="radio"
              checked={formData.type === "INDIVIDUAL"}
              onChange={() => update("type", "INDIVIDUAL")}
            />{" "}
            Particulier
          </label>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <input
              type="radio"
              checked={formData.type === "COMPANY"}
              onChange={() => update("type", "COMPANY")}
            />{" "}
            Entreprise
          </label>
        </div>
        {formData.type === "INDIVIDUAL" ? (
          <>
            <Input
              label="Prénom"
              value={formData.firstName || ""}
              onChange={(event) => update("firstName", event.target.value)}
            />
            <Input
              label="Nom"
              value={formData.lastName || ""}
              onChange={(event) => update("lastName", event.target.value)}
            />
            <Input
              label="CIN"
              value={formData.cin || ""}
              onChange={(event) => update("cin", event.target.value)}
            />
            <Input
              label="Lieu de délivrance CIN"
              value={formData.cinIssuedPlace || ""}
              onChange={(event) => update("cinIssuedPlace", event.target.value)}
            />
            <Input
              label="Date de délivrance CIN"
              type="date"
              value={formData.cinIssuedAt || ""}
              onChange={(event) => update("cinIssuedAt", event.target.value)}
            />
          </>
        ) : (
          <>
            <Input
              label="Nom commercial"
              value={formData.tradeName || ""}
              onChange={(event) => update("tradeName", event.target.value)}
            />
            <Input
              label="NIF"
              value={formData.nif || ""}
              onChange={(event) => update("nif", event.target.value)}
            />
            <Input
              label="STAT"
              value={formData.stat || ""}
              onChange={(event) => update("stat", event.target.value)}
            />
            <Input
              label="RCS"
              value={formData.rcs || ""}
              onChange={(event) => update("rcs", event.target.value)}
            />
            <Input
              label="Forme juridique"
              value={formData.legalForm || ""}
              onChange={(event) => update("legalForm", event.target.value)}
              placeholder="SARL, SA..."
            />
            <Input
              label="Activité"
              value={formData.activity || ""}
              onChange={(event) => update("activity", event.target.value)}
            />
          </>
        )}
      </FieldGroup>

      <FieldGroup title="Coordonnées et activité fret">
        <Input
          label="Email"
          type="email"
          value={formData.email || ""}
          onChange={(event) => update("email", event.target.value)}
        />
        <Input
          label="Téléphone"
          value={formData.phone || ""}
          onChange={(event) => update("phone", event.target.value)}
        />
        <Input
          label="Téléphone secondaire"
          value={formData.secondaryPhone || ""}
          onChange={(event) => update("secondaryPhone", event.target.value)}
        />
        <Input
          label="Type de marchandise habituel"
          value={formData.habitualCargoType || ""}
          onChange={(event) => update("habitualCargoType", event.target.value)}
        />
        <Input
          label="Numéro de contrat"
          value={formData.contractNumber || ""}
          onChange={(event) => update("contractNumber", event.target.value)}
        />
        <Input
          label="Conditions de paiement"
          value={formData.paymentTerms || ""}
          onChange={(event) => update("paymentTerms", event.target.value)}
          placeholder="Ex: 30 jours"
        />
        <Select
          label="Devise"
          value={formData.currency || "MGA"}
          onChange={(event) => update("currency", event.target.value)}
          options={[
            { value: "MGA", label: "MGA - Ariary" },
            { value: "EUR", label: "EUR - Euro" },
            { value: "USD", label: "USD - Dollar" },
          ]}
        />
        <label className="flex items-center gap-2 pt-7 text-sm font-medium text-slate-700">
          <input
            type="checkbox"
            checked={Boolean(formData.taxExempt)}
            onChange={(event) => update("taxExempt", event.target.checked)}
          />{" "}
          Exonération fiscale
        </label>
        {formData.taxExempt && (
          <Input
            label="Motif d'exonération"
            value={formData.taxExemptionReason || ""}
            onChange={(event) =>
              update("taxExemptionReason", event.target.value)
            }
            required
          />
        )}
      </FieldGroup>

      <FieldGroup title="Réception de la marchandise">
        <Input
          label="Nom du responsable"
          value={formData.receptionContactName || ""}
          onChange={(event) =>
            update("receptionContactName", event.target.value)
          }
        />
        <Input
          label="Téléphone du responsable"
          value={formData.receptionContactPhone || ""}
          onChange={(event) =>
            update("receptionContactPhone", event.target.value)
          }
        />
        <Input
          label="Email du responsable"
          type="email"
          value={formData.receptionContactEmail || ""}
          onChange={(event) =>
            update("receptionContactEmail", event.target.value)
          }
        />
      </FieldGroup>

      <AddressFields
        title="Adresse de facturation"
        address={formData.billingAddress}
        onChange={(name, value) => updateAddress("billingAddress", name, value)}
      />
      <AddressFields
        title="Adresse de livraison"
        address={formData.deliveryAddress}
        onChange={(name, value) =>
          updateAddress("deliveryAddress", name, value)
        }
      />

      <FieldGroup title="Notes">
        <div className="sm:col-span-2">
          <Input
            label="Notes internes"
            value={formData.notes || ""}
            onChange={(event) => update("notes", event.target.value)}
            placeholder="Informations utiles pour le suivi du client"
          />
        </div>
      </FieldGroup>

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

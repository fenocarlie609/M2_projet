// src/features/client/components/ClientEditModal.jsx
import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Button } from "@/shared/components/ui";

export function ClientEditModal({
  isOpen,
  onClose,
  onClientUpdated,
  selectedClient,
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    type: "INDIVIDUAL",
    phone: "",
  });

  useEffect(() => {
    if (selectedClient) {
      setFormData({
        name: selectedClient.name || "",
        type: selectedClient.type || "INDIVIDUAL",
        phone: selectedClient.phone || "",
      });
    }
  }, [selectedClient, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      const payload = { ...formData, phone: formData.phone || null };
      await onClientUpdated(selectedClient.id, payload);
      onClose();
    } catch (error) {
      console.error("Erreur modification client :", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Modifier le client : ${selectedClient?.name || ""}`}
    >
      <Form onSubmit={handleSubmit}>
        <div className="w-full flex flex-col gap-1.5">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 px-0.5">
            Type de client
          </label>
          <div className="flex items-center gap-6 px-0.5 py-1">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
              <input
                type="radio"
                name="type"
                value="INDIVIDUAL"
                checked={formData.type === "INDIVIDUAL"}
                onChange={handleInputChange}
                className="w-4 h-4 accent-brand-primary cursor-pointer"
              />
              Particulier
            </label>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
              <input
                type="radio"
                name="type"
                value="COMPANY"
                checked={formData.type === "COMPANY"}
                onChange={handleInputChange}
                className="w-4 h-4 accent-brand-primary cursor-pointer"
              />
              Entreprise
            </label>
          </div>
        </div>

        <Input
          label="Nom ou Raison Sociale"
          name="name"
          required
          value={formData.name}
          onChange={handleInputChange}
        />

        <Input
          label="Téléphone (optionnel)"
          name="phone"
          value={formData.phone}
          onChange={handleInputChange}
        />

        <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
          <Button type="button" variant="ghost" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            Enregistrer les modifications
          </Button>
        </div>
      </Form>
    </Modal>
  );
}

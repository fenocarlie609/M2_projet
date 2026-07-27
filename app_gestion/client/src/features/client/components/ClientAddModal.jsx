// src/features/client/components/ClientAddModal.jsx
import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Button } from "@/shared/components/ui";

const emptyForm = { name: "", type: "INDIVIDUAL", phone: "" };

export function ClientAddModal({ isOpen, onClose, onClientCreated }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    if (!isOpen) setFormData(emptyForm);
  }, [isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      const payload = { ...formData, phone: formData.phone || null };
      await onClientCreated(payload);
      onClose();
    } catch (error) {
      console.error("Erreur lors de la création du client :", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Ajouter un nouveau client">
      <Form onSubmit={handleSubmit}>
        {/* Sélecteur visuel du Type de Client */}
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
              Entreprise / Société
            </label>
          </div>
        </div>

        <Input
          label="Nom complet ou Raison Sociale"
          name="name"
          required
          value={formData.name}
          onChange={handleInputChange}
          placeholder="Ex: Établissement Razafy ou Jean Dupont"
        />

        <Input
          label="Téléphone (optionnel)"
          name="phone"
          value={formData.phone}
          onChange={handleInputChange}
          placeholder="Ex: 034 00 000 00"
        />

        <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
          <Button type="button" variant="ghost" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            Créer le client
          </Button>
        </div>
      </Form>
    </Modal>
  );
}

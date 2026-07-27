// src/features/driver/components/DriverModal.jsx
import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Button } from "@/shared/components/ui";

const emptyForm = { name: "", type: "INDIVIDUAL", licensePlate: "", phone: "" };

export function DriverModal({ isOpen, onClose, onSave, selectedDriver }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const isEditMode = !!selectedDriver;

  useEffect(() => {
    if (isOpen) {
      setFormData(
        selectedDriver
          ? {
              name: selectedDriver.name || "",
              type: selectedDriver.type || "INDIVIDUAL",
              licensePlate: selectedDriver.licensePlate || "",
              phone: selectedDriver.phone || "",
            }
          : emptyForm,
      );
    }
  }, [selectedDriver, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      const payload = { ...formData, phone: formData.phone || null };
      await onSave(payload);
      onClose();
    } catch (error) {
      console.error("Erreur enregistrement chauffeur :", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? `Modifier le chauffeur` : "Ajouter un chauffeur"}
    >
      <Form onSubmit={handleSubmit}>
        <div className="w-full flex flex-col gap-1.5">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 px-0.5">
            Type
          </label>
          <div className="flex items-center gap-6 py-1">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
              <input
                type="radio"
                name="type"
                value="INDIVIDUAL"
                checked={formData.type === "INDIVIDUAL"}
                onChange={handleInputChange}
                className="w-4 h-4 accent-brand-primary"
              />
              Indépendant
            </label>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
              <input
                type="radio"
                name="type"
                value="COMPANY"
                checked={formData.type === "COMPANY"}
                onChange={handleInputChange}
                className="w-4 h-4 accent-brand-primary"
              />
              Rattaché à une société
            </label>
          </div>
        </div>

        <Input
          label="Nom complet du chauffeur"
          name="name"
          required
          value={formData.name}
          onChange={handleInputChange}
          placeholder="Ex: Rakoto Jean"
        />
        <Input
          label="Numéro d'immatriculation du véhicule"
          name="licensePlate"
          required
          value={formData.licensePlate}
          onChange={handleInputChange}
          placeholder="Ex: 1234 TAB"
          className="uppercase"
        />
        <Input
          label="Téléphone (optionnel)"
          name="phone"
          value={formData.phone}
          onChange={handleInputChange}
          placeholder="Ex: 032 00 000 00"
        />

        <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
          <Button type="button" variant="ghost" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            {isEditMode
              ? "Enregistrer les modifications"
              : "Créer le chauffeur"}
          </Button>
        </div>
      </Form>
    </Modal>
  );
}

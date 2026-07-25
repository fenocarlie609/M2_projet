// src/features/companyStructure/components/PositionEditModal.jsx
import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Button } from "@/shared/components/ui";

export function PositionEditModal({
  isOpen,
  onClose,
  selectedPosition,
  onPositionUpdated,
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ code: "", label: "" });

  useEffect(() => {
    if (selectedPosition) {
      setFormData({
        code: selectedPosition.code || "",
        label: selectedPosition.label || "",
      });
    }
  }, [selectedPosition, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "code" ? value.toUpperCase() : value,
    }));
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      await onPositionUpdated(selectedPosition.id, formData);
      onClose();
    } catch (error) {
      console.error("Erreur lors de la modification du poste :", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Modifier le poste : ${selectedPosition?.label || ""}`}
    >
      <Form onSubmit={handleSubmit}>
        <Input
          label="Code"
          name="code"
          required
          value={formData.code}
          onChange={handleInputChange}
        />
        <Input
          label="Libellé"
          name="label"
          required
          value={formData.label}
          onChange={handleInputChange}
        />

        <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
          <Button type="button" variant="ghost" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            Enregistrer
          </Button>
        </div>
      </Form>
    </Modal>
  );
}

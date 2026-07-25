// src/features/companyStructure/components/DepartmentAddModal.jsx
import React, { useState } from "react";
import { Modal, Form, Input, Button } from "@/shared/components/ui";

const emptyForm = { code: "", label: "" };

export function DepartmentAddModal({ isOpen, onClose, onDepartmentCreated }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(emptyForm);

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
      await onDepartmentCreated(formData);
      setFormData(emptyForm);
    } catch (error) {
      console.error("Erreur lors de la création du département :", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Créer un département">
      <Form onSubmit={handleSubmit}>
        <Input
          label="Code"
          name="code"
          required
          value={formData.code}
          onChange={handleInputChange}
          placeholder="Ex: TECH"
        />
        <Input
          label="Libellé"
          name="label"
          required
          value={formData.label}
          onChange={handleInputChange}
          placeholder="Ex: Technologie & Systèmes"
        />

        <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
          <Button type="button" variant="ghost" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            Créer
          </Button>
        </div>
      </Form>
    </Modal>
  );
}

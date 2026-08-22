// src/features/module/components/ModuleAddModal.jsx
import React, { useState } from "react";
import { Modal, Form, Input, Button } from "@/shared/components/ui";
import { getApiErrorMessage } from "@/shared/utils/getApiErrorMessage";

const emptyForm = { code: "", label: "" };
const emptyErrors = { code: "", label: "", general: "" };

export function ModuleAddModal({ isOpen, onClose, onModuleCreated }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [errors, setErrors] = useState(emptyErrors);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "code"
          ? value.toUpperCase().replace(/[^A-Z0-9_]/g, "")
          : value,
    }));
    setErrors(emptyErrors);
  };

  const handleClose = () => {
    setFormData(emptyForm);
    setErrors(emptyErrors);
    onClose();
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      await onModuleCreated(formData);
      setFormData(emptyForm);
      setErrors(emptyErrors);
    } catch (error) {
      console.error("Erreur lors de la création du module :", error);
      const message = getApiErrorMessage(error);
      const lower = message.toLowerCase();
      const isCodeError = lower.includes("code") || lower.includes("module");
      setErrors({
        code: isCodeError ? message : "",
        label: "",
        general: isCodeError ? "" : message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Créer un module">
      <Form onSubmit={handleSubmit}>
        <Input
          label="Code"
          name="code"
          required
          value={formData.code}
          onChange={handleInputChange}
          placeholder="Ex: EMPLOYEES"
          error={errors.code}
        />
        <Input
          label="Libellé"
          name="label"
          required
          value={formData.label}
          onChange={handleInputChange}
          placeholder="Ex: Gestion des employés"
          error={errors.label}
        />

        {errors.general && (
          <p className="text-xs sm:text-sm font-medium text-rose-500 px-0.5">
            {errors.general}
          </p>
        )}

        <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
          <Button type="button" variant="ghost" onClick={handleClose}>
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

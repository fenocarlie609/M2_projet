// src/features/module/components/ModuleEditModal.jsx
import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Button } from "@/shared/components/ui";
import { getApiErrorMessage } from "@/shared/utils/getApiErrorMessage";

const emptyErrors = { code: "", label: "", general: "" };

export function ModuleEditModal({
  isOpen,
  onClose,
  selectedModule,
  onModuleUpdated,
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ code: "", label: "" });
  const [errors, setErrors] = useState(emptyErrors);

  useEffect(() => {
    if (selectedModule) {
      setFormData({
        code: selectedModule.code || "",
        label: selectedModule.label || "",
      });
      setErrors(emptyErrors);
    }
  }, [selectedModule, isOpen]);

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
    setErrors(emptyErrors);
    onClose();
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      await onModuleUpdated(selectedModule.id, formData);
      setErrors(emptyErrors);
      onClose();
    } catch (error) {
      console.error("Erreur lors de la modification du module :", error);
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
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Modifier le module : ${selectedModule?.label || ""}`}
    >
      <Form onSubmit={handleSubmit}>
        <Input
          label="Code"
          name="code"
          required
          value={formData.code}
          onChange={handleInputChange}
          error={errors.code}
        />
        <Input
          label="Libellé"
          name="label"
          required
          value={formData.label}
          onChange={handleInputChange}
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
            Enregistrer
          </Button>
        </div>
      </Form>
    </Modal>
  );
}

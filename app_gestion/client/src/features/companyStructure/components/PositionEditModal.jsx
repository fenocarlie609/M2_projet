// src/features/companyStructure/components/PositionEditModal.jsx
import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Button } from "@/shared/components/ui";
import { getApiErrorMessage } from "../utils/getApiErrorMessage";

const emptyErrors = { code: "", label: "", general: "" };

export function PositionEditModal({
  isOpen,
  onClose,
  selectedPosition,
  onPositionUpdated,
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ code: "", label: "" });
  const [errors, setErrors] = useState(emptyErrors);

  useEffect(() => {
    if (selectedPosition) {
      setFormData({
        code: selectedPosition.code || "",
        label: selectedPosition.label || "",
      });
      setErrors(emptyErrors);
    }
  }, [selectedPosition, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "code"
          ? value.toUpperCase().replace(/[^A-Z0-9_]/g, "")
          : value,
    }));
    setErrors((prev) => ({ ...prev, [name]: "", general: "" }));
  };

  const validate = () => {
    const nextErrors = { code: "", label: "", general: "" };

    if (!formData.code || formData.code.length < 2) {
      nextErrors.code = "Le code doit contenir au moins 2 caractères.";
    }
    if (!formData.label || formData.label.length < 2) {
      nextErrors.label = "Le libellé doit contenir au moins 2 caractères.";
    }

    setErrors(nextErrors);
    return !nextErrors.code && !nextErrors.label;
  };

  const handleClose = () => {
    setErrors(emptyErrors);
    onClose();
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      setIsSubmitting(true);
      await onPositionUpdated(selectedPosition.id, formData);
      setErrors(emptyErrors);
      onClose();
    } catch (error) {
      console.error("Erreur lors de la modification du poste :", error);
      const message = getApiErrorMessage(error);
      const isCodeError = message.toLowerCase().includes("code");
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
      title={`Modifier le poste : ${selectedPosition?.label || ""}`}
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

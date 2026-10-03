import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Button } from "@/shared/components/ui";
import { getApiErrorMessage } from "@/shared/utils/getApiErrorMessage";

const emptyForm = { code: "", label: "" };
const emptyErrors = { code: "", label: "", general: "" };

export function ModuleModal({
  isOpen,
  onClose,
  selectedModule,
  onModuleCreated,
  onModuleUpdated,
}) {
  const isEditing = Boolean(selectedModule);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [errors, setErrors] = useState(emptyErrors);

  useEffect(() => {
    setFormData(
      selectedModule
        ? { code: selectedModule.code || "", label: selectedModule.label || "" }
        : emptyForm,
    );
    setErrors(emptyErrors);
  }, [selectedModule, isOpen]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]:
        name === "code"
          ? value.toUpperCase().replace(/[^A-Z0-9_]/g, "")
          : value,
    }));
    setErrors(emptyErrors);
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      if (isEditing) await onModuleUpdated(selectedModule.id, formData);
      else await onModuleCreated(formData);
      onClose();
    } catch (error) {
      const message = getApiErrorMessage(error);
      const isCodeError =
        message.toLowerCase().includes("code") ||
        message.toLowerCase().includes("module");
      setErrors({
        code: isCodeError ? message : "",
        label: "",
        general: isCodeError ? "" : message,
      });
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        isEditing
          ? `Modifier le module : ${selectedModule.label}`
          : "Créer un module"
      }
    >
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
          <Button type="button" variant="ghost" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            {isEditing ? "Enregistrer" : "Créer"}
          </Button>
        </div>
      </Form>
    </Modal>
  );
}

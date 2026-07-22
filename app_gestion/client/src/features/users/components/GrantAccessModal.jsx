// src/features/users/components/GrantAccessModal.jsx
import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Select, Button } from "@/shared/components/ui";

export function GrantAccessModal({
  isOpen,
  onClose,
  employees,
  onAccessGranted,
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    employeeId: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    if (!isOpen) {
      setFormData({ employeeId: "", email: "", password: "" });
    }
  }, [isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      await onAccessGranted(formData.employeeId, {
        email: formData.email,
        password: formData.password,
      });
      setFormData({ employeeId: "", email: "", password: "" });
    } catch (error) {
      console.error("Erreur lors de l'attribution de l'accès :", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const employeeOptions = [
    { value: "", label: "Sélectionner un employé sans accès..." },
    ...employees.map((emp) => ({
      value: emp.id,
      // position est désormais un objet { code, label }
      label: `${emp.name} — ${emp.position?.label || "Poste inconnu"} (${emp.matricule})`,
    })),
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Donner l'accès à l'application"
    >
      <Form onSubmit={handleSubmit}>
        <Select
          label="Employé"
          name="employeeId"
          required
          value={formData.employeeId}
          onChange={handleInputChange}
          options={employeeOptions}
        />
        {employees.length === 0 && (
          <p className="text-xs text-slate-500 -mt-2">
            Tous les employés ont déjà un accès, ou aucun employé n'existe
            encore.
          </p>
        )}

        <Input
          label="Adresse Email"
          type="email"
          name="email"
          required
          value={formData.email}
          onChange={handleInputChange}
          placeholder="Ex: john.doe@example.com"
        />

        <Input
          label="Mot de passe initial"
          type="password"
          name="password"
          required
          minLength={8}
          value={formData.password}
          onChange={handleInputChange}
          placeholder="8 caractères minimum"
        />

        <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
          <Button type="button" variant="ghost" onClick={onClose}>
            Annuler
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            disabled={!formData.employeeId}
          >
            Donner l'accès
          </Button>
        </div>
      </Form>
    </Modal>
  );
}

// src/features/employee/components/EmployeeAddModal.jsx
import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Select, Button } from "@/shared/components/ui";
import axiosInstance from "@/shared/services/axiosInstance";

const emptyForm = {
  name: "",
  matricule: "",
  cin: "",
  phone: "",
  departmentId: "",
  positionId: "",
};

export function EmployeeAddModal({ isOpen, onClose, onEmployeeCreated }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(emptyForm);

  const [departments, setDepartments] = useState([]);
  const [isLoadingStructure, setIsLoadingStructure] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const fetchStructure = async () => {
      try {
        setIsLoadingStructure(true);
        const response = await axiosInstance.get("/company-structure");
        setDepartments(response.data?.data?.structure || []);
      } catch (error) {
        console.error(
          "Impossible de charger la structure de l'entreprise :",
          error,
        );
      } finally {
        setIsLoadingStructure(false);
      }
    };

    fetchStructure();
  }, [isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === "departmentId") {
        updated.positionId = "";
      }
      return updated;
    });
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      const payload = { ...formData, cin: formData.cin || undefined };
      await onEmployeeCreated(payload);
      setFormData(emptyForm);
    } catch (error) {
      console.error("Erreur lors de la création de l'employé :", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedDepartment = departments.find(
    (d) => d.id === formData.departmentId,
  );
  const availablePositions = selectedDepartment
    ? selectedDepartment.positions
    : [];

  const departmentOptions = [
    {
      value: "",
      label: isLoadingStructure
        ? "Chargement des départements..."
        : "Sélectionnez un département",
    },
    ...departments.map((dept) => ({ value: dept.id, label: dept.label })),
  ];

  const positionOptions = [
    {
      value: "",
      label: formData.departmentId
        ? "Sélectionnez un poste"
        : "Choisissez d'abord un département",
    },
    ...availablePositions.map((pos) => ({ value: pos.id, label: pos.label })),
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Créer un nouvel employé">
      <Form onSubmit={handleSubmit}>
        <Input
          label="Nom complet"
          name="name"
          required
          value={formData.name}
          onChange={handleInputChange}
          placeholder="Ex: John Doe"
        />

        <Input
          label="Matricule"
          name="matricule"
          required
          value={formData.matricule}
          onChange={handleInputChange}
          placeholder="Ex: MAT-2026-014"
        />

        <Input
          label="CIN (optionnel)"
          name="cin"
          value={formData.cin}
          onChange={handleInputChange}
          placeholder="Ex: 101112013014"
        />

        <Input
          label="Téléphone (optionnel)"
          name="phone"
          value={formData.phone}
          onChange={handleInputChange}
          placeholder="Ex: 034 00 000 00"
        />

        <Select
          label="Département"
          name="departmentId"
          required
          disabled={isLoadingStructure}
          value={formData.departmentId}
          onChange={handleInputChange}
          options={departmentOptions}
        />

        <Select
          label="Poste"
          name="positionId"
          required
          disabled={!formData.departmentId || isLoadingStructure}
          value={formData.positionId}
          onChange={handleInputChange}
          options={positionOptions}
        />

        <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
          <Button type="button" variant="ghost" onClick={onClose}>
            Annuler
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            disabled={isLoadingStructure}
          >
            Créer l'employé
          </Button>
        </div>
      </Form>
    </Modal>
  );
}

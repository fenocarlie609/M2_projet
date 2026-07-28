// src/features/employee/components/EmployeeAddModal.jsx
import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Select, Button } from "@/shared/components/ui";
import axiosInstance from "@/shared/services/axiosInstance";
import { employeeService } from "@/features/employee/";

const emptyForm = {
  name: "",
  matricule: "",
  cin: "",
  phone: "",
  departmentId: "",
  positionId: "",
  hasAppAccess: false,
  avatarUrl: "",
};

export function EmployeeAddModal({ isOpen, onClose, onEmployeeCreated }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(emptyForm);

  const [departments, setDepartments] = useState([]);
  const [isLoadingStructure, setIsLoadingStructure] = useState(false);

  // Aperçu local instantané (avant que l'upload réseau ne soit terminé)
  const [avatarPreview, setAvatarPreview] = useState("");
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

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

  useEffect(() => {
    if (!isOpen) {
      setFormData(emptyForm);
      setAvatarPreview("");
    }
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

  const handleAppAccessChange = (value) => {
    setFormData((prev) => ({ ...prev, hasAppAccess: value }));
  };

  // Upload réel : aperçu local immédiat, puis remplacement par l'URL hébergée
  // renvoyée par POST /uploads/avatar une fois l'upload terminé.
  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarPreview(URL.createObjectURL(file));

    try {
      setIsUploadingAvatar(true);
      const response = await employeeService.uploadAvatar(file, {
        matricule: formData.matricule,
      });
      setFormData((prev) => ({ ...prev, avatarUrl: response.data.url }));
    } catch (error) {
      console.error("Erreur lors de l'upload de la photo :", error);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      const payload = {
        ...formData,
        cin: formData.cin || undefined,
        avatarUrl: formData.avatarUrl || undefined,
      };
      await onEmployeeCreated(payload);
      setFormData(emptyForm);
      setAvatarPreview("");
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
        {/* Photo d'identité */}
        <div className="w-full flex flex-col gap-1.5">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 px-0.5">
            Photo d'identité (badge, format 4x4)
          </label>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-lg border border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center shrink-0">
              {avatarPreview || formData.avatarUrl ? (
                <img
                  src={avatarPreview || formData.avatarUrl}
                  alt="Aperçu"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-[10px] text-slate-400 text-center px-1">
                  4x4
                </span>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleAvatarChange}
                className="text-xs text-slate-600 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer"
              />
              {isUploadingAvatar && (
                <span className="text-[11px] text-slate-400">
                  Envoi de la photo...
                </span>
              )}
            </div>
          </div>
        </div>

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

        {/* Accès à l'application (radio) */}
        <div className="w-full flex flex-col gap-1.5">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 px-0.5">
            Accès à l'application
          </label>
          <div className="flex items-center gap-6 px-0.5 py-1">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
              <input
                type="radio"
                name="hasAppAccess"
                checked={formData.hasAppAccess === true}
                onChange={() => handleAppAccessChange(true)}
                className="w-4 h-4 accent-brand-primary cursor-pointer"
              />
              Oui
            </label>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
              <input
                type="radio"
                name="hasAppAccess"
                checked={formData.hasAppAccess === false}
                onChange={() => handleAppAccessChange(false)}
                className="w-4 h-4 accent-brand-primary cursor-pointer"
              />
              Non
            </label>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
          <Button type="button" variant="ghost" onClick={onClose}>
            Annuler
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            disabled={isLoadingStructure || isUploadingAvatar}
          >
            Créer l'employé
          </Button>
        </div>
      </Form>
    </Modal>
  );
}

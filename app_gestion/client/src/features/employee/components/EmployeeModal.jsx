import React, { useEffect, useState } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  Button,
  Alert,
} from "@/shared/components/ui";
import { axiosInstance } from "@/shared/services/";
import { employeeService } from "@/features/employee/";
import { getApiErrorMessage } from "@/shared/utils/getApiErrorMessage";

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

export function EmployeeModal({
  isOpen,
  onClose,
  selectedEmployee,
  onEmployeeCreated,
  onEmployeeUpdated,
}) {
  const isEditing = Boolean(selectedEmployee);
  const [formData, setFormData] = useState(emptyForm);
  const [departments, setDepartments] = useState([]);
  const [isLoadingStructure, setIsLoadingStructure] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    const loadStructure = async () => {
      try {
        setIsLoadingStructure(true);
        const response = await axiosInstance.get("/company-structure");
        setDepartments(response.data?.data?.structure || []);
      } catch (requestError) {
        setError(
          getApiErrorMessage(
            requestError,
            "Impossible de charger la structure.",
          ),
        );
      } finally {
        setIsLoadingStructure(false);
      }
    };
    loadStructure();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    setFormData(
      selectedEmployee
        ? {
            name: selectedEmployee.name || "",
            matricule: selectedEmployee.matricule || "",
            cin: selectedEmployee.cin || "",
            phone: selectedEmployee.phone || "",
            departmentId:
              selectedEmployee.department?.id ||
              selectedEmployee.departmentId ||
              "",
            positionId:
              selectedEmployee.position?.id ||
              selectedEmployee.positionId ||
              "",
            hasAppAccess: selectedEmployee.hasAppAccess ?? false,
            avatarUrl: selectedEmployee.avatarUrl || "",
          }
        : { ...emptyForm },
    );
    setAvatarPreview("");
    setError("");
  }, [isOpen, selectedEmployee]);

  const selectedDepartment = departments.find(
    (department) => department.id === formData.departmentId,
  );
  const positions = selectedDepartment?.positions || [];

  const update = (name, value) => {
    setFormData((current) => ({
      ...current,
      [name]: value,
      ...(name === "departmentId" ? { positionId: "" } : {}),
    }));
    setError("");
  };

  const handleAvatarChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setAvatarPreview(URL.createObjectURL(file));
    try {
      setIsUploadingAvatar(true);
      const response = await employeeService.uploadAvatar(file, {
        matricule: formData.matricule,
        previousUrl: formData.avatarUrl,
      });
      setFormData((current) => ({ ...current, avatarUrl: response.data.url }));
    } catch (requestError) {
      setError(
        getApiErrorMessage(requestError, "Impossible d'envoyer la photo."),
      );
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setError("");

      const payload = {
        ...formData,
        matricule: isEditing ? formData.matricule : undefined, // N'envoie pas le matricule si création
        cin: formData.cin || undefined,
        avatarUrl: formData.avatarUrl || undefined,
      };

      if (isEditing) await onEmployeeUpdated(selectedEmployee.id, payload);
      else await onEmployeeCreated(payload);
      onClose();
    } catch (requestError) {
      setError(
        getApiErrorMessage(
          requestError,
          `Impossible de ${isEditing ? "modifier" : "créer"} l'employé.`,
        ),
      );
      throw requestError;
    } finally {
      setIsSubmitting(false);
    }
  };

  const departmentOptions = [
    {
      value: "",
      label: isLoadingStructure
        ? "Chargement..."
        : "Sélectionnez un département",
    },
    ...departments.map((department) => ({
      value: department.id,
      label: department.label,
    })),
  ];

  const positionOptions = [
    {
      value: "",
      label: formData.departmentId
        ? "Sélectionnez un poste"
        : "Choisissez d'abord un département",
    },
    ...positions.map((position) => ({
      value: position.id,
      label: position.label,
    })),
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        isEditing
          ? `Modifier l'employé : ${selectedEmployee.name}`
          : "Créer un nouvel employé"
      }
      maxWidth="max-w-2xl"
    >
      <Form onSubmit={handleSubmit}>
        {error && (
          <Alert variant="error" title="Enregistrement impossible">
            {error}
          </Alert>
        )}
        <div className="flex items-center gap-4">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
            {avatarPreview || formData.avatarUrl ? (
              <img
                src={avatarPreview || formData.avatarUrl}
                alt="Aperçu"
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-[10px] text-slate-400">4x4</span>
            )}
          </div>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleAvatarChange}
            className="text-xs text-slate-600"
          />
        </div>
        <Input
          label="Nom complet"
          value={formData.name}
          onChange={(event) => update("name", event.target.value)}
          required
        />

        {/* Champ Matricule dynamique */}
        {isEditing ? (
          <Input
            label="Matricule"
            value={formData.matricule}
            onChange={(event) => update("matricule", event.target.value)}
            required
          />
        ) : (
          <Input
            label="Matricule"
            value="Généré automatiquement à la création"
            disabled
            className="bg-slate-100 text-slate-500 cursor-not-allowed italic"
          />
        )}

        <Input
          label="CIN (optionnel)"
          value={formData.cin}
          onChange={(event) => update("cin", event.target.value)}
        />
        <Input
          label="Téléphone (optionnel)"
          value={formData.phone}
          onChange={(event) => update("phone", event.target.value)}
        />
        <Select
          label="Département"
          value={formData.departmentId}
          onChange={(event) => update("departmentId", event.target.value)}
          options={departmentOptions}
          required
          disabled={isLoadingStructure}
        />
        <Select
          label="Poste"
          value={formData.positionId}
          onChange={(event) => update("positionId", event.target.value)}
          options={positionOptions}
          required
          disabled={!formData.departmentId || isLoadingStructure}
        />
        <div className="flex items-center gap-6 text-sm font-medium text-slate-700">
          <span>Accès à l'application</span>
          <label>
            <input
              type="radio"
              checked={formData.hasAppAccess}
              onChange={() => update("hasAppAccess", true)}
            />{" "}
            Oui
          </label>
          <label>
            <input
              type="radio"
              checked={!formData.hasAppAccess}
              onChange={() => update("hasAppAccess", false)}
            />{" "}
            Non
          </label>
        </div>
        <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
          <Button type="button" variant="ghost" onClick={onClose}>
            Annuler
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            disabled={isLoadingStructure || isUploadingAvatar}
          >
            {isEditing ? "Enregistrer" : "Créer l'employé"}
          </Button>
        </div>
      </Form>
    </Modal>
  );
}

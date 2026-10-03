// src/features/loadingPlans/components/PlanModal.jsx
import React, { useEffect, useState } from "react";
import { Modal } from "@/shared/components/ui";
import { showToast } from "@/shared/utils/toast";
import { LoadPlanForm } from "@/features/plans";

export function LoadPlanModal({
  isOpen,
  onClose,
  selectedPlan,
  onLoadCreated,
  onPlanUpdated,
  voyages,
  onSubmit,
  isSaving,
  error,
}) {
  const isEditing = Boolean(selectedPlan);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  useEffect(() => {
    if (isOpen) setServerError("");
  }, [isOpen, selectedPlan]);

  const handleSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      setServerError("");

      if (isEditing) {
        await onPlanUpdated(selectedPlan.id, data);
        showToast.success("Plan de chargement modifié avec succès !");
      } else {
        await onLoadCreated(data);
        showToast.success("Plan de chargement créé avec succès !");
      }

      onClose();
    } catch (error) {
      setServerError(
        error?.response?.data?.message ||
          `La ${isEditing ? "modification" : "création"} du plan de chargement a échoué.`,
      );
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
          ? `Modifier le Plan de chargement : ${selectedPlan.reference}`
          : "Ajouter un nouveau Plan de chargement"
      }
    >
      <LoadPlanForm
        selectedPlan={selectedPlan}
        voyages={voyages}
        onSubmit={handleSubmit}
        onClose={onClose}
        isSubmitting={isSubmitting}
        serverError={serverError}
        submitLabel={
          isEditing
            ? "Enregistrer les modifications"
            : "Créer le Plan de chargement"
        }
      />
    </Modal>
  );
}

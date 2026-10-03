// src/features/voyage/components/VoyageModal.jsx
import React, { useEffect, useState } from "react";
import { Modal } from "@/shared/components/ui";
import { showToast } from "@/shared/utils/toast";
import { VoyageForm } from "./VoyageForm";

export function VoyageModal({
  isOpen,
  onClose,
  selectedVoyage,
  onVoyageCreated,
  onVoyageUpdated,
}) {
  const isEditing = Boolean(selectedVoyage);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  useEffect(() => {
    if (isOpen) setServerError("");
  }, [isOpen, selectedVoyage]);

  const handleSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      setServerError("");

      if (isEditing) {
        await onVoyageUpdated(selectedVoyage.id, data);
        showToast.success("Voyage modifié avec succès !");
      } else {
        await onVoyageCreated(data);
        showToast.success("Voyage créé avec succès !");
      }

      onClose();
    } catch (error) {
      setServerError(
        error?.response?.data?.message ||
          `La ${isEditing ? "modification" : "création"} du voyage a échoué.`,
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
          ? `Modifier le voyage : ${selectedVoyage.voyageNumber}`
          : "Ajouter un nouveau voyage"
      }
      maxWidth="max-w-lg"
    >
      <VoyageForm
        selectedVoyage={selectedVoyage}
        onSubmit={handleSubmit}
        onClose={onClose}
        isSubmitting={isSubmitting}
        serverError={serverError}
        submitLabel={
          isEditing ? "Enregistrer les modifications" : "Créer le voyage"
        }
      />
    </Modal>
  );
}

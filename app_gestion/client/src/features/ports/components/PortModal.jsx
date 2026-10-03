// src/features/port/components/PortModal.jsx
import React, { useEffect, useState } from "react";
import { Modal } from "@/shared/components/ui";
import { showToast } from "@/shared/utils/toast";
import { PortForm } from "./PortForm";

export function PortModal({
  isOpen,
  onClose,
  selectedPort,
  onPortCreated,
  onPortUpdated,
}) {
  const isEditing = Boolean(selectedPort);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  useEffect(() => {
    if (isOpen) setServerError("");
  }, [isOpen, selectedPort]);

  const handleSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      setServerError("");

      if (isEditing) {
        await onPortUpdated(selectedPort.id, data);
        showToast.success("Port modifié avec succès !");
      } else {
        await onPortCreated(data);
        showToast.success("Port créé avec succès !");
      }

      onClose();
    } catch (error) {
      setServerError(
        error?.response?.data?.message ||
          `La ${isEditing ? "modification" : "création"} du port a échoué.`,
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
          ? `Modifier le port : ${selectedPort.name}`
          : "Ajouter un nouveau port"
      }
      maxWidth="max-w-lg"
    >
      <PortForm
        selectedPort={selectedPort}
        onSubmit={handleSubmit}
        onClose={onClose}
        isSubmitting={isSubmitting}
        serverError={serverError}
        submitLabel={
          isEditing ? "Enregistrer les modifications" : "Créer le port"
        }
      />
    </Modal>
  );
}

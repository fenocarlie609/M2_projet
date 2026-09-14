import React, { useEffect, useState } from "react";
import { Modal } from "@/shared/components/ui";
import { showToast } from "@/shared/utils/toast";
import { ClientForm } from "./ClientForm";

export function ClientModal({
  isOpen,
  onClose,
  selectedClient,
  onClientCreated,
  onClientUpdated,
}) {
  const isEditing = Boolean(selectedClient);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  useEffect(() => {
    if (isOpen) setServerError("");
  }, [isOpen, selectedClient]);

  const handleSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      setServerError("");

      if (isEditing) {
        await onClientUpdated(selectedClient.id, data);
        showToast.success("Client modifié avec succès !");
      } else {
        await onClientCreated(data);
        showToast.success("Client créé avec succès !");
      }

      onClose();
    } catch (error) {
      setServerError(
        error?.response?.data?.message ||
          `La ${isEditing ? "modification" : "création"} du client a échoué.`,
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
          ? `Modifier le client : ${selectedClient.name}`
          : "Ajouter un nouveau client"
      }
      maxWidth="max-w-4xl"
    >
      <ClientForm
        selectedClient={selectedClient}
        onSubmit={handleSubmit}
        onClose={onClose}
        isSubmitting={isSubmitting}
        serverError={serverError}
        submitLabel={
          isEditing ? "Enregistrer les modifications" : "Créer le client"
        }
      />
    </Modal>
  );
}

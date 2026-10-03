// src/features/ship/components/ShipModal.jsx
import React, { useEffect, useState } from "react";
import { Modal } from "@/shared/components/ui";
import { showToast } from "@/shared/utils/toast";
import { ShipForm } from "./ShipForm";

export function ShipModal({
  isOpen,
  onClose,
  selectedShip,
  onShipCreated,
  onShipUpdated,
}) {
  const isEditing = Boolean(selectedShip);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  useEffect(() => {
    if (isOpen) setServerError("");
  }, [isOpen, selectedShip]);

  const handleSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      setServerError("");

      if (isEditing) {
        await onShipUpdated(selectedShip.id, data);
        showToast.success("Navire modifié avec succès !");
      } else {
        await onShipCreated(data);
        showToast.success("Navire créé avec succès !");
      }

      onClose();
    } catch (error) {
      setServerError(
        error?.response?.data?.message ||
          `La ${isEditing ? "modification" : "création"} du navire a échoué.`,
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
          ? `Modifier le navire : ${selectedShip.name}`
          : "Ajouter un nouveau navire"
      }
      maxWidth="max-w-lg"
    >
      <ShipForm
        selectedShip={selectedShip}
        onSubmit={handleSubmit}
        onClose={onClose}
        isSubmitting={isSubmitting}
        serverError={serverError}
        submitLabel={
          isEditing ? "Enregistrer les modifications" : "Créer le navire"
        }
      />
    </Modal>
  );
}

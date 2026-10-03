// src/features/loadingPlans/components/CargoLineModal.jsx
import React from "react";
import { Modal } from "@/shared/components/ui";
import { CargoLineForm } from "./CargoLineForm";

export function CargoLineModal({
  isOpen,
  onClose,
  clients,
  drivers = [],
  vehicles = [],
  onSubmit,
  isSaving,
  error,
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Ajouter une marchandise"
      maxWidth="max-w-3xl"
    >
      <CargoLineForm
        clients={clients}
        drivers={drivers}
        vehicles={vehicles}
        onSubmit={onSubmit}
        onClose={onClose}
        isSaving={isSaving}
        error={error}
      />
    </Modal>
  );
}

// src/features/driver/pages/DriverPage.jsx
import React, { useEffect, useState } from "react";
import { PageHeader, Button, AlertDialog } from "@/shared/components/ui";
import { FiPlus } from "react-icons/fi";
import { driverService } from "../service/driver.service";
import { DriverTable } from "../components/DriverTable";
import { DriverCard } from "../components/DriverCard";
import { DriverModal } from "../components/DriverModal";

function DriverPage() {
  const [drivers, setDrivers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchDrivers = async () => {
    try {
      setIsLoading(true);
      const response = await driverService.getDrivers();
      setDrivers(response.data?.drivers || []);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const handleOpenAdd = () => {
    setSelectedDriver(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (driver) => {
    setSelectedDriver(driver);
    setIsModalOpen(true);
  };

  const handleSaveDriver = async (formData) => {
    if (selectedDriver) {
      const response = await driverService.updateDriver(
        selectedDriver.id,
        formData,
      );
      if (response?.data?.driver) {
        setDrivers((prev) =>
          prev.map((d) =>
            d.id === selectedDriver.id ? response.data.driver : d,
          ),
        );
      }
    } else {
      const response = await driverService.createDriver(formData);
      if (response?.data?.driver) {
        setDrivers((prev) => [response.data.driver, ...prev]);
      }
    }
  };

  const handleOpenDelete = (driver) => {
    setSelectedDriver(driver);
    setIsDeleteAlertOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedDriver) return;
    try {
      setIsDeleting(true);
      await driverService.deleteDriver(selectedDriver.id);
      setDrivers((prev) => prev.filter((d) => d.id !== selectedDriver.id));
      setIsDeleteAlertOpen(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsDeleting(false);
      setSelectedDriver(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Chauffeurs"
        subtitle="Suivi des transporteurs et des plaques d'immatriculation."
      >
        <Button variant="primary" icon={FiPlus} onClick={handleOpenAdd}>
          Ajouter un chauffeur
        </Button>
      </PageHeader>

      <div className="hidden md:block">
        <DriverTable
          data={drivers}
          isLoading={isLoading}
          onEdit={handleOpenEdit}
          onDelete={handleOpenDelete}
        />
      </div>

      <div className="block md:hidden grid grid-cols-1 sm:grid-cols-2 gap-4">
        {drivers.length === 0 && !isLoading && (
          <p className="text-sm text-slate-400 text-center py-6">
            Aucun chauffeur enregistré.
          </p>
        )}
        {drivers.map((driver) => (
          <DriverCard
            key={driver.id}
            driver={driver}
            onEdit={handleOpenEdit}
            onDelete={handleOpenDelete}
          />
        ))}
      </div>

      <DriverModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveDriver}
        selectedDriver={selectedDriver}
      />

      <AlertDialog
        isOpen={isDeleteAlertOpen}
        onClose={() => setIsDeleteAlertOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Supprimer définitivement ce chauffeur"
        description={`Supprimer le chauffeur ${selectedDriver?.name} (${selectedDriver?.licensePlate}) ?`}
        confirmText={isDeleting ? "Suppression..." : "Oui, supprimer"}
        isDanger
      />
    </div>
  );
}

export default DriverPage;

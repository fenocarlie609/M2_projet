// src/features/port/pages/PortPage.jsx
import React, { useEffect, useState } from "react";
import { socket } from "@/shared/services/socket";
import { PageHeader, Button, AlertDialog } from "@/shared/components/ui";
import { FiPlus } from "react-icons/fi";
import { portService, PortTable, PortCard, PortModal } from "@/features/ports";

function PortPage() {
  const [ports, setPorts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [isPortModalOpen, setIsPortModalOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);

  const [selectedPort, setSelectedPort] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchPorts = async () => {
    try {
      setIsLoading(true);
      const response = await portService.getPorts();
      setPorts(response.data?.ports || []);
    } catch (error) {
      console.error("Erreur lors de la récupération des ports :", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPorts();
  }, []);

  // Temps réel : diffusé par port.service.js (backend) sur create/update/delete,
  // y compris par un autre utilisateur connecté.
  useEffect(() => {
    const onPortsChanged = (payload) => {
      if (!payload || !payload.action) return fetchPorts();

      const { action } = payload;
      if (action === "created" && payload.port) {
        setPorts((prev) => [payload.port, ...prev]);
      } else if (action === "updated" && payload.port) {
        setPorts((prev) =>
          prev.map((p) => (p.id === payload.port.id ? payload.port : p)),
        );
      } else if (action === "deleted" && payload.id) {
        setPorts((prev) => prev.filter((p) => p.id !== payload.id));
      } else {
        fetchPorts();
      }
    };

    socket.on("ports:changed", onPortsChanged);
    return () => {
      socket.off("ports:changed", onPortsChanged);
    };
  }, []);

  const handleCreatePort = async (newPortData) => {
    const response = await portService.createPort(newPortData);
    if (response?.data?.port) {
      setPorts((prev) => [response.data.port, ...prev]);
    } else {
      fetchPorts();
    }
  };

  const handleOpenEdit = (port) => {
    setSelectedPort(port);
    setIsPortModalOpen(true);
  };

  const handleUpdatePort = async (portId, updatedData) => {
    try {
      const response = await portService.updatePort(portId, updatedData);
      if (response?.data?.port) {
        setPorts((prev) =>
          prev.map((p) => (p.id === portId ? response.data.port : p)),
        );
      } else {
        fetchPorts();
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour du port :", error);
      throw error;
    }
  };

  const handleOpenDelete = (port) => {
    setSelectedPort(port);
    setIsDeleteAlertOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedPort) return;
    try {
      setIsDeleting(true);
      await portService.deletePort(selectedPort.id);
      setPorts(ports.filter((p) => p.id !== selectedPort.id));
      setIsDeleteAlertOpen(false);
    } catch (error) {
      console.error("Erreur suppression port :", error);
    } finally {
      setIsDeleting(false);
      setSelectedPort(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Ports" subtitle="Gérez le registre des ports.">
        <Button
          variant="primary"
          icon={FiPlus}
          onClick={() => {
            setSelectedPort(null);
            setIsPortModalOpen(true);
          }}
        >
          Ajouter un port
        </Button>
      </PageHeader>

      <div className="hidden md:block">
        <PortTable
          data={ports}
          isLoading={isLoading}
          onEdit={handleOpenEdit}
          onDelete={handleOpenDelete}
        />
      </div>

      <div className="grid md:hidden grid-cols-1 sm:grid-cols-2 gap-4">
        {ports.length === 0 && !isLoading && (
          <p className="text-sm text-slate-400 text-center py-6">
            Aucun port enregistré.
          </p>
        )}
        {ports.map((port) => (
          <PortCard
            key={port.id}
            port={port}
            onEdit={handleOpenEdit}
            onDelete={handleOpenDelete}
          />
        ))}
      </div>

      <PortModal
        isOpen={isPortModalOpen}
        onClose={() => {
          setIsPortModalOpen(false);
          setSelectedPort(null);
        }}
        selectedPort={selectedPort}
        onPortCreated={handleCreatePort}
        onPortUpdated={handleUpdatePort}
      />

      <AlertDialog
        isOpen={isDeleteAlertOpen}
        onClose={() => {
          setIsDeleteAlertOpen(false);
          setSelectedPort(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Supprimer définitivement ce port"
        description={`Êtes-vous sûr de vouloir supprimer le port ${selectedPort?.name || ""} ? Cette action est irréversible.`}
        confirmText={isDeleting ? "Suppression..." : "Oui, supprimer"}
        isDanger
      />
    </div>
  );
}

export default PortPage;

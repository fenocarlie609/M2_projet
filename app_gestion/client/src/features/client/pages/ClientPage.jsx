// src/features/client/pages/ClientPage.jsx
import React, { useEffect, useState } from "react";
import { socket } from "@/shared/services/socket";
import { PageHeader, Button, AlertDialog } from "@/shared/components/ui";
import { FiPlus } from "react-icons/fi";
import {
  clientService,
  ClientTable,
  ClientCard,
  ClientModal,
} from "@/features/client";

function ClientPage() {
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);

  const [selectedClient, setSelectedClient] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchClients = async () => {
    try {
      setIsLoading(true);
      const response = await clientService.getClients();
      setClients(response.data?.clients || []);
    } catch (error) {
      console.error("Erreur lors de la récupération des clients :", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  // Real-time updates
  useEffect(() => {
    const onClientsChanged = (payload) => {
      if (!payload || !payload.action) return fetchClients();

      const { action } = payload;
      if (action === "created" && payload.client) {
        setClients((prev) => [payload.client, ...prev]);
      } else if (action === "updated" && payload.client) {
        setClients((prev) =>
          prev.map((c) => (c.id === payload.client.id ? payload.client : c)),
        );
      } else if (action === "deleted" && payload.id) {
        setClients((prev) => prev.filter((c) => c.id !== payload.id));
      } else {
        fetchClients();
      }
    };

    socket.on("clients:changed", onClientsChanged);
    return () => {
      socket.off("clients:changed", onClientsChanged);
    };
  }, []);

  const handleCreateClient = async (newClientData) => {
    const response = await clientService.createClient(newClientData);
    if (response?.data?.client) {
      setClients((prev) => [response.data.client, ...prev]);
    } else {
      fetchClients();
    }
  };

  const handleOpenEdit = (client) => {
    setSelectedClient(client);
    setIsClientModalOpen(true);
  };

  const handleUpdateClient = async (clientId, updatedData) => {
    try {
      const response = await clientService.updateClient(clientId, updatedData);
      if (response?.data?.client) {
        setClients((prev) =>
          prev.map((c) => (c.id === clientId ? response.data.client : c)),
        );
      } else {
        fetchClients();
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour du client :", error);
      throw error;
    }
  };

  const handleOpenDelete = (client) => {
    setSelectedClient(client);
    setIsDeleteAlertOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedClient) return;
    try {
      setIsDeleting(true);
      await clientService.deleteClient(selectedClient.id);
      setClients(clients.filter((c) => c.id !== selectedClient.id));
      setIsDeleteAlertOpen(false);
    } catch (error) {
      console.error("Erreur suppression client :", error);
    } finally {
      setIsDeleting(false);
      setSelectedClient(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Clients"
        subtitle="Gérez le registre des clients (Particuliers & Entreprises)."
      >
        <Button
          variant="primary"
          icon={FiPlus}
          onClick={() => {
            setSelectedClient(null);
            setIsClientModalOpen(true);
          }}
        >
          Ajouter un client
        </Button>
      </PageHeader>

      {/* Vue Table : Écrans Desktop */}
      <div className="hidden md:block">
        <ClientTable
          data={clients}
          isLoading={isLoading}
          onEdit={handleOpenEdit}
          onDelete={handleOpenDelete}
        />
      </div>

      {/* Vue Cards : Écrans Mobile */}
      <div className="grid md:hidden grid-cols-1 sm:grid-cols-2 gap-4">
        {clients.length === 0 && !isLoading && (
          <p className="text-sm text-slate-400 text-center py-6">
            Aucun client enregistré.
          </p>
        )}
        {clients.map((client) => (
          <ClientCard
            key={client.id}
            client={client}
            onEdit={handleOpenEdit}
            onDelete={handleOpenDelete}
          />
        ))}
      </div>

      <ClientModal
        isOpen={isClientModalOpen}
        onClose={() => {
          setIsClientModalOpen(false);
          setSelectedClient(null);
        }}
        selectedClient={selectedClient}
        onClientCreated={handleCreateClient}
        onClientUpdated={handleUpdateClient}
      />

      <AlertDialog
        isOpen={isDeleteAlertOpen}
        onClose={() => {
          setIsDeleteAlertOpen(false);
          setSelectedClient(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Supprimer définitivement ce client"
        description={`Êtes-vous sûr de vouloir supprimer le client ${selectedClient?.name || ""} ? Cette action est irréversible.`}
        confirmText={isDeleting ? "Suppression..." : "Oui, supprimer"}
        isDanger
      />
    </div>
  );
}

export default ClientPage;

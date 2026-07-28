// src/features/client/pages/ClientPage.jsx
import React, { useEffect, useState } from "react";
import { PageHeader, Button, AlertDialog } from "@/shared/components/ui";
import { FiPlus } from "react-icons/fi";
import {
  clientService,
  ClientTable,
  ClientCard,
  ClientAddModal,
  ClientEditModal,
} from "@/features/client";

function ClientPage() {
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
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
    setIsEditModalOpen(true);
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
    } finally {
      setSelectedClient(null);
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
          onClick={() => setIsAddModalOpen(true)}
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
      <div className="block md:hidden grid grid-cols-1 sm:grid-cols-2 gap-4">
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

      <ClientAddModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onClientCreated={handleCreateClient}
      />

      <ClientEditModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedClient(null);
        }}
        selectedClient={selectedClient}
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

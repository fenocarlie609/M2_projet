// src/features/user/pages/UserPage.jsx
import React, { useEffect, useState } from "react";
import { PageHeader, Button, AlertDialog } from "@/shared/components/ui";
import { FiPlus } from "react-icons/fi";
import {
  userService,
  UserTable,
  UserAddModal,
  UserEditModal,
} from "@/features/user";

function UserPage() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // États de contrôle des modales et alertes
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // <-- État pour la modale d'édition
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);

  // Cible courante pour la modification ou la suppression
  const [selectedUser, setSelectedUser] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await userService.getUsers();
      setUsers(response.data.users);
    } catch (error) {
      console.error("Erreur lors de la récupération des utilisateurs :", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Action : Création
  const handleCreateUser = async (newUserData) => {
    const response = await userService.createUser(newUserData);
    if (response?.data?.user) {
      setUsers((prev) => [...prev, response.data.user]);
    } else {
      fetchUsers();
    }
    setIsAddModalOpen(false);
  };

  // Action : Demande de modification (Ouvre la modale en injectant l'utilisateur ciblé)
  const handleOpenEdit = (user) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  // Action : Confirmation et application de la mise à jour
  const handleUpdateUser = async (userId, updatedData) => {
    try {
      // Supposons que ton service utilise la signature (id, data)
      const response = await userService.updateUser(userId, updatedData);

      if (response?.data?.user) {
        // Met à jour l'utilisateur précis dans le state local
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? response.data.user : u)),
        );
      } else {
        fetchUsers();
      }
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'utilisateur :", error);
    } finally {
      setSelectedUser(null);
    }
  };

  // Action : Demande de suppression
  const handleOpenDelete = (user) => {
    setSelectedUser(user);
    setIsDeleteAlertOpen(true);
  };

  // Action : Confirmation de suppression
  const handleConfirmDelete = async () => {
    if (!selectedUser) return;
    try {
      setIsDeleting(true);
      await userService.deleteUser(selectedUser.id);
      setUsers(users.filter((u) => u.id !== selectedUser.id));
      setIsDeleteAlertOpen(false);
    } catch (error) {
      console.error("Erreur suppression :", error);
    } finally {
      setIsDeleting(false);
      setSelectedUser(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Utilisateurs" subtitle="Gérez les utilisateurs.">
        <Button
          variant="primary"
          icon={FiPlus}
          onClick={() => setIsAddModalOpen(true)}
        >
          Ajouter un utilisateur
        </Button>
      </PageHeader>

      {/* Tableau isolé branché sur les bonnes méthodes */}
      <UserTable
        data={users}
        isLoading={isLoading}
        onEdit={handleOpenEdit} // <-- Raccordé à la logique d'édition
        onDelete={handleOpenDelete}
      />

      {/* Modale d'ajout isolée */}
      <UserAddModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onUserCreated={handleCreateUser}
      />

      {/* Modale d'édition isolée */}
      <UserEditModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedUser(null);
        }}
        selectedUser={selectedUser}
        onUserUpdated={handleUpdateUser}
      />

      {/* Alerte de confirmation globale */}
      <AlertDialog
        isOpen={isDeleteAlertOpen}
        onClose={() => {
          setIsDeleteAlertOpen(false);
          setSelectedUser(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Supprimer cet utilisateur"
        description={`Êtes-vous sûr de vouloir supprimer l'utilisateur ${selectedUser?.name || ""} ?`}
        confirmText={isDeleting ? "Suppression..." : "Oui, supprimer"}
        isDanger
      />
    </div>
  );
}

export default UserPage;

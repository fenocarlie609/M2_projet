// src/features/users/pages/UsersPage.jsx
import React, { useEffect, useState } from "react";
import { PageHeader, Button, AlertDialog, Tabs } from "@/shared/components/ui";
import { FiPlus } from "react-icons/fi";
import {
  usersService,
  UsersTable,
  UsersPermissionsTable,
  GrantAccessModal,
  PermissionsModal,
} from "@/features/users";
import { showToast } from "@/shared/utils/toast";

const TABS = [
  { id: "accounts", label: "Comptes" },
  { id: "permissions", label: "Permissions" },
];

function UsersPage() {
  const [activeTab, setActiveTab] = useState("accounts");

  const [users, setUsers] = useState([]);
  const [pendingEmployees, setPendingEmployees] = useState([]);
  const [permissionsOverview, setPermissionsOverview] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [isGrantModalOpen, setIsGrantModalOpen] = useState(false);
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
  const [isRevokeAlertOpen, setIsRevokeAlertOpen] = useState(false);

  const [selectedUser, setSelectedUser] = useState(null);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await usersService.getUsers();
      setUsers(response.data.users);
    } catch (error) {
      console.error("Erreur lors de la récupération des utilisateurs :", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPendingEmployees = async () => {
    try {
      const response = await usersService.getPendingEmployees();
      setPendingEmployees(response.data.employees || []);
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des employés en attente :",
        error,
      );
    }
  };

  const fetchPermissionsOverview = async () => {
    try {
      const response = await usersService.getAllPermissions();
      setPermissionsOverview(response.data.permissions || []);
    } catch (error) {
      console.error("Erreur lors de la récupération des permissions :", error);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchPendingEmployees();
    fetchPermissionsOverview();
  }, []);

  const handleGrantAccess = async (employeeId, data) => {
    const response = await usersService.grantAccess(employeeId, data);
    if (response?.data?.user) {
      setUsers((prev) => [...prev, response.data.user]);
    } else {
      fetchUsers();
    }
    fetchPendingEmployees();
    fetchPermissionsOverview();
    setIsGrantModalOpen(false);
    showToast.success("Accès accordé avec succès.");
  };

  const handleToggleStatus = async (user) => {
    try {
      await usersService.setStatus(user.id, !user.isActive);
      fetchUsers();
      showToast.success(
        !user.isActive ? "Compte activé." : "Compte désactivé.",
      );
    } catch (error) {
      const message =
        error.response?.data?.message || "Erreur lors du changement de statut.";
      showToast.error(message);
    }
  };

  const handleResetPassword = async (user) => {
    const newPassword = window.prompt(
      `Nouveau mot de passe pour ${user.name} (8 caractères minimum) :`,
    );
    if (!newPassword) return;
    try {
      await usersService.resetPassword(user.id, newPassword);
      showToast.success("Mot de passe réinitialisé.");
    } catch (error) {
      const message =
        error.response?.data?.message || "Erreur lors de la réinitialisation.";
      showToast.error(message);
    }
  };

  const handleOpenPermissions = (user) => {
    setSelectedUser(user);
    setIsPermissionsModalOpen(true);
  };

  const handleAssignManyPermissions = async (employeeId, pairs) => {
    await Promise.all(
      pairs.map((p) =>
        usersService.assignPermission(employeeId, p.module, p.action),
      ),
    );
    const response = await usersService.getUserById(employeeId);
    setSelectedUser(response.data.user);
    fetchUsers();
    fetchPermissionsOverview();
    showToast.success(
      pairs.length > 1
        ? `${pairs.length} permissions ajoutées.`
        : "Permission ajoutée.",
    );
  };

  const handleRevokePermission = async (employeeId, permissionId) => {
    await usersService.revokePermission(employeeId, permissionId);
    const response = await usersService.getUserById(employeeId);
    setSelectedUser(response.data.user);
    fetchUsers();
    fetchPermissionsOverview();
  };

  // Révocation groupée : `permissionIds` = ids sélectionnés dans la modale.
  const handleRevokeManyPermissions = async (employeeId, permissionIds) => {
    await usersService.revokePermissions(employeeId, permissionIds);
    const response = await usersService.getUserById(employeeId);
    setSelectedUser(response.data.user);
    fetchUsers();
    fetchPermissionsOverview();
    showToast.success(
      permissionIds.length > 1
        ? `${permissionIds.length} permissions supprimées.`
        : "Permission supprimée.",
    );
  };

  const handleOpenRevokeAccess = (user) => {
    setSelectedUser(user);
    setIsRevokeAlertOpen(true);
  };

  const handleConfirmRevokeAccess = async () => {
    if (!selectedUser) return;
    try {
      await usersService.revokeAccess(selectedUser.id);
      setUsers((prev) => prev.filter((u) => u.id !== selectedUser.id));
      fetchPendingEmployees();
      fetchPermissionsOverview();
      setIsRevokeAlertOpen(false);
      showToast.success("Accès révoqué.");
    } catch (error) {
      console.error("Erreur lors de la révocation :", error);
    } finally {
      setSelectedUser(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Utilisateurs de l'application"
        subtitle="Gérez qui a accès à l'application et avec quelles permissions."
      >
        <Button
          variant="primary"
          icon={FiPlus}
          onClick={() => setIsGrantModalOpen(true)}
        >
          Donner un accès
        </Button>
      </PageHeader>

      <Tabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === "accounts" ? (
        <UsersTable
          data={users}
          isLoading={isLoading}
          onTogglePermissions={handleOpenPermissions}
          onToggleStatus={handleToggleStatus}
          onResetPassword={handleResetPassword}
          onRevokeAccess={handleOpenRevokeAccess}
        />
      ) : (
        <UsersPermissionsTable
          data={permissionsOverview}
          isLoading={isLoading}
          onManage={handleOpenPermissions}
        />
      )}

      <GrantAccessModal
        isOpen={isGrantModalOpen}
        onClose={() => setIsGrantModalOpen(false)}
        employees={pendingEmployees}
        onAccessGranted={handleGrantAccess}
      />

      <PermissionsModal
        isOpen={isPermissionsModalOpen}
        onClose={() => {
          setIsPermissionsModalOpen(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
        onAssignMany={handleAssignManyPermissions}
        onRevoke={handleRevokePermission}
        onRevokeMany={handleRevokeManyPermissions}
      />

      <AlertDialog
        isOpen={isRevokeAlertOpen}
        onClose={() => {
          setIsRevokeAlertOpen(false);
          setSelectedUser(null);
        }}
        onConfirm={handleConfirmRevokeAccess}
        title="Révoquer l'accès applicatif"
        description={`Êtes-vous sûr de vouloir retirer l'accès à l'application de ${selectedUser?.name || ""} ? Sa fiche employé sera conservée.`}
        confirmText="Oui, révoquer"
        isDanger
      />
    </div>
  );
}

export default UsersPage;

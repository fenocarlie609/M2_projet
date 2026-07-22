// src/features/users/pages/UsersPage.jsx
import React, { useEffect, useState } from "react";
import { PageHeader, Button, AlertDialog } from "@/shared/components/ui";
import { FiPlus } from "react-icons/fi";
import {
  usersService,
  UsersTable,
  GrantAccessModal,
  PermissionsModal,
} from "@/features/users";
import { employeeService } from "@/features/employee";
import { showToast } from "@/shared/utils/toast";

function UsersPage() {
  const [users, setUsers] = useState([]);
  const [employeesWithoutAccess, setEmployeesWithoutAccess] = useState([]);
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

  const fetchEmployeesWithoutAccess = async () => {
    try {
      const response = await employeeService.getEmployees();
      setEmployeesWithoutAccess(
        (response.data.employees || []).filter((e) => !e.hasAppAccess),
      );
    } catch (error) {
      console.error("Erreur lors de la récupération des employés :", error);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchEmployeesWithoutAccess();
  }, []);

  const handleGrantAccess = async (employeeId, data) => {
    const response = await usersService.grantAccess(employeeId, data);
    if (response?.data?.user) {
      setUsers((prev) => [...prev, response.data.user]);
    } else {
      fetchUsers();
    }
    fetchEmployeesWithoutAccess();
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

  const handleAssignPermission = async (employeeId, module, action) => {
    await usersService.assignPermission(employeeId, module, action);
    const response = await usersService.getUserById(employeeId);
    setSelectedUser(response.data.user);
    fetchUsers();
  };

  const handleRevokePermission = async (employeeId, permissionId) => {
    await usersService.revokePermission(employeeId, permissionId);
    const response = await usersService.getUserById(employeeId);
    setSelectedUser(response.data.user);
    fetchUsers();
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
      fetchEmployeesWithoutAccess();
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

      <UsersTable
        data={users}
        isLoading={isLoading}
        onTogglePermissions={handleOpenPermissions}
        onToggleStatus={handleToggleStatus}
        onResetPassword={handleResetPassword}
        onRevokeAccess={handleOpenRevokeAccess}
      />

      <GrantAccessModal
        isOpen={isGrantModalOpen}
        onClose={() => setIsGrantModalOpen(false)}
        employees={employeesWithoutAccess}
        onAccessGranted={handleGrantAccess}
      />

      <PermissionsModal
        isOpen={isPermissionsModalOpen}
        onClose={() => {
          setIsPermissionsModalOpen(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
        onAssign={handleAssignPermission}
        onRevoke={handleRevokePermission}
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

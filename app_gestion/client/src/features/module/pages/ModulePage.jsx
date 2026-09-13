// src/features/module/pages/ModulePage.jsx
import React, { useEffect, useState } from "react";
import { PageHeader, Button, AlertDialog } from "@/shared/components/ui";
import { FiPlus } from "react-icons/fi";
import { socket } from "@/shared/services/";
import { useAuth } from "@/features/auth";
import {
  modulesService,
  ModuleTable,
  ModuleCard,
  ModuleAddModal,
  ModuleEditModal,
} from "@/features/module";

function ModulePage() {
  const { user } = useAuth();
  console.log("ModulePage - user:", user);
  const canManage = user?.department?.code === "TECH";

  const [modules, setModules] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);

  const [selectedModule, setSelectedModule] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchModules = async () => {
    try {
      setIsLoading(true);
      const response = await modulesService.getModules();
      setModules(response.data.modules || []);
    } catch (error) {
      console.error("Erreur lors de la récupération des modules :", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchModules();
  }, []);

  // Live-sync : diffusé par module.service.js (backend) à chaque
  // création/modification/suppression, y compris par un autre IT connecté.
  useEffect(() => {
    const handleModulesChanged = () => {
      fetchModules();
    };

    socket.on("modules:changed", handleModulesChanged);
    return () => socket.off("modules:changed", handleModulesChanged);
  }, []);

  const handleCreateModule = async (data) => {
    await modulesService.createModule(data);
    setIsAddModalOpen(false);
    fetchModules();
  };

  const handleOpenEdit = (appModule) => {
    setSelectedModule(appModule);
    setIsEditModalOpen(true);
  };

  const handleUpdateModule = async (id, data) => {
    await modulesService.updateModule(id, data);
    fetchModules();
  };

  const handleOpenDelete = (appModule) => {
    setSelectedModule(appModule);
    setIsDeleteAlertOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedModule) return;
    try {
      setIsDeleting(true);
      await modulesService.deleteModule(selectedModule.id);
      setModules((prev) => prev.filter((m) => m.id !== selectedModule.id));
      setIsDeleteAlertOpen(false);
    } catch (error) {
      console.error("Erreur suppression :", error);
    } finally {
      setIsDeleting(false);
      setSelectedModule(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Modules"
        subtitle="Gérez les modules disponibles pour les permissions des employés."
      >
        {canManage && (
          <Button
            variant="primary"
            icon={FiPlus}
            onClick={() => setIsAddModalOpen(true)}
          >
            Ajouter un module
          </Button>
        )}
      </PageHeader>

      <div className="hidden md:block">
        <ModuleTable
          data={modules}
          isLoading={isLoading}
          onEdit={handleOpenEdit}
          onDelete={handleOpenDelete}
        />
      </div>

      <div className="block md:hidden space-y-3">
        {modules.map((appModule) => (
          <ModuleCard
            key={appModule.id}
            appModule={appModule}
            onEdit={handleOpenEdit}
            onDelete={handleOpenDelete}
          />
        ))}
      </div>

      <ModuleAddModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onModuleCreated={handleCreateModule}
      />

      <ModuleEditModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedModule(null);
        }}
        selectedModule={selectedModule}
        onModuleUpdated={handleUpdateModule}
      />

      <AlertDialog
        isOpen={isDeleteAlertOpen}
        onClose={() => {
          setIsDeleteAlertOpen(false);
          setSelectedModule(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Supprimer ce module"
        description={`Êtes-vous sûr de vouloir supprimer le module "${selectedModule?.label || ""}" ? Les permissions qui l'utilisent encore bloqueront la suppression.`}
        confirmText={isDeleting ? "Suppression..." : "Oui, supprimer"}
        isDanger
      />
    </div>
  );
}

export default ModulePage;

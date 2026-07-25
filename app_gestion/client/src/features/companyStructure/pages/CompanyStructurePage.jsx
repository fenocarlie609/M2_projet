// src/features/companyStructure/pages/CompanyStructurePage.jsx
import React, { useEffect, useState } from "react";
import { PageHeader, Button, AlertDialog } from "@/shared/components/ui";
import { FiPlus } from "react-icons/fi";
import {
  companyStructureService,
  CompanyStructureCard,
  DepartmentAddModal,
  DepartmentEditModal,
  PositionAddModal,
  PositionEditModal,
} from "@/features/companyStructure";

function CompanyStructurePage() {
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [isAddDeptOpen, setIsAddDeptOpen] = useState(false);
  const [isEditDeptOpen, setIsEditDeptOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);

  const [isAddPosOpen, setIsAddPosOpen] = useState(false);
  const [positionDepartmentTarget, setPositionDepartmentTarget] =
    useState(null);
  const [isEditPosOpen, setIsEditPosOpen] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState(null);

  // { type: "department" | "position", id, label }
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchStructure = async () => {
    try {
      setIsLoading(true);
      const response = await companyStructureService.getStructure();
      setDepartments(response.data.structure || []);
    } catch (error) {
      console.error("Erreur lors de la récupération de la structure :", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStructure();
  }, []);

  const handleCreateDepartment = async (data) => {
    await companyStructureService.createDepartment(data);
    setIsAddDeptOpen(false);
    fetchStructure();
  };

  const handleUpdateDepartment = async (id, data) => {
    await companyStructureService.updateDepartment(id, data);
    fetchStructure();
  };

  const handleCreatePosition = async (departmentId, data) => {
    await companyStructureService.createPosition({ ...data, departmentId });
    setIsAddPosOpen(false);
    fetchStructure();
  };

  const handleUpdatePosition = async (id, data) => {
    await companyStructureService.updatePosition(id, data);
    fetchStructure();
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      if (deleteTarget.type === "department") {
        await companyStructureService.deleteDepartment(deleteTarget.id);
      } else {
        await companyStructureService.deletePosition(deleteTarget.id);
      }
      setDeleteTarget(null);
      fetchStructure();
    } catch (error) {
      console.error("Erreur lors de la suppression :", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Structure de l'entreprise"
        subtitle="Gérez les départements et les postes associés."
      >
        <Button
          variant="primary"
          icon={FiPlus}
          onClick={() => setIsAddDeptOpen(true)}
        >
          Ajouter un département
        </Button>
      </PageHeader>

      {isLoading ? (
        <p className="text-sm text-slate-500">Chargement...</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {departments.map((dept) => (
            <CompanyStructureCard
              key={dept.id}
              department={dept}
              onEditDepartment={(d) => {
                setSelectedDepartment(d);
                setIsEditDeptOpen(true);
              }}
              onDeleteDepartment={(d) =>
                setDeleteTarget({
                  type: "department",
                  id: d.id,
                  label: d.label,
                })
              }
              onAddPosition={(d) => {
                setPositionDepartmentTarget(d);
                setIsAddPosOpen(true);
              }}
              onEditPosition={(pos) => {
                setSelectedPosition(pos);
                setIsEditPosOpen(true);
              }}
              onDeletePosition={(pos) =>
                setDeleteTarget({
                  type: "position",
                  id: pos.id,
                  label: pos.label,
                })
              }
            />
          ))}
        </div>
      )}

      <DepartmentAddModal
        isOpen={isAddDeptOpen}
        onClose={() => setIsAddDeptOpen(false)}
        onDepartmentCreated={handleCreateDepartment}
      />

      <DepartmentEditModal
        isOpen={isEditDeptOpen}
        onClose={() => {
          setIsEditDeptOpen(false);
          setSelectedDepartment(null);
        }}
        selectedDepartment={selectedDepartment}
        onDepartmentUpdated={handleUpdateDepartment}
      />

      <PositionAddModal
        isOpen={isAddPosOpen}
        onClose={() => setIsAddPosOpen(false)}
        department={positionDepartmentTarget}
        onPositionCreated={handleCreatePosition}
      />

      <PositionEditModal
        isOpen={isEditPosOpen}
        onClose={() => {
          setIsEditPosOpen(false);
          setSelectedPosition(null);
        }}
        selectedPosition={selectedPosition}
        onPositionUpdated={handleUpdatePosition}
      />

      <AlertDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title={
          deleteTarget?.type === "department"
            ? "Supprimer ce département"
            : "Supprimer ce poste"
        }
        description={`Êtes-vous sûr de vouloir supprimer "${deleteTarget?.label || ""}" ?${
          deleteTarget?.type === "department"
            ? " Tous ses postes seront également supprimés."
            : ""
        }`}
        confirmText={isDeleting ? "Suppression..." : "Oui, supprimer"}
        isDanger
      />
    </div>
  );
}

export default CompanyStructurePage;

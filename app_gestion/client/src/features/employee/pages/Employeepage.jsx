// src/features/employee/pages/EmployeePage.jsx
import React, { useEffect, useState } from "react";
import { socket } from "@/shared/services/socket";
import { PageHeader, Button, AlertDialog } from "@/shared/components/ui";
import { FiPlus } from "react-icons/fi";
import {
  employeeService,
  EmployeeTable,
  EmployeeAddModal,
  EmployeeEditModal,
  EmployeeCard,
} from "@/features/employee";

function EmployeePage() {
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);

  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchEmployees = async () => {
    try {
      setIsLoading(true);
      const response = await employeeService.getEmployees();
      setEmployees(response.data.employees);
    } catch (error) {
      console.error("Erreur lors de la récupération des employés :", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    const onEmployeesChanged = (payload) => {
      if (!payload || !payload.action) return fetchEmployees();

      const { action } = payload;
      if (action === "created" && payload.employee) {
        setEmployees((prev) => [payload.employee, ...prev]);
      } else if (action === "updated" && payload.employee) {
        setEmployees((prev) =>
          prev.map((e) =>
            e.id === payload.employee.id ? payload.employee : e,
          ),
        );
      } else if (action === "deleted" && payload.id) {
        setEmployees((prev) => prev.filter((e) => e.id !== payload.id));
      } else {
        fetchEmployees();
      }
    };

    socket.on("employees:changed", onEmployeesChanged);
    return () => socket.off("employees:changed", onEmployeesChanged);
  }, []);

  const handleCreateEmployee = async (newEmployeeData) => {
    const response = await employeeService.createEmployee(newEmployeeData);
    if (response?.data?.employee) {
      setEmployees((prev) => [...prev, response.data.employee]);
    } else {
      fetchEmployees();
    }
    setIsAddModalOpen(false);
  };

  const handleOpenEdit = (employee) => {
    setSelectedEmployee(employee);
    setIsEditModalOpen(true);
  };

  const handleUpdateEmployee = async (employeeId, updatedData) => {
    try {
      const response = await employeeService.updateEmployee(
        employeeId,
        updatedData,
      );
      if (response?.data?.employee) {
        setEmployees((prev) =>
          prev.map((e) => (e.id === employeeId ? response.data.employee : e)),
        );
      } else {
        fetchEmployees();
      }
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'employé :", error);
    } finally {
      setSelectedEmployee(null);
    }
  };

  const handleOpenDelete = (employee) => {
    setSelectedEmployee(employee);
    setIsDeleteAlertOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedEmployee) return;
    try {
      setIsDeleting(true);
      await employeeService.deleteEmployee(selectedEmployee.id);
      setEmployees(employees.filter((e) => e.id !== selectedEmployee.id));
      setIsDeleteAlertOpen(false);
    } catch (error) {
      console.error("Erreur suppression :", error);
    } finally {
      setIsDeleting(false);
      setSelectedEmployee(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Employés" subtitle="Gérez les fiches employés (RH).">
        <Button
          variant="primary"
          icon={FiPlus}
          onClick={() => setIsAddModalOpen(true)}
        >
          Ajouter un employé
        </Button>
      </PageHeader>

      <div className="hidden md:block">
        <EmployeeTable
          data={employees}
          isLoading={isLoading}
          onEdit={handleOpenEdit}
          onDelete={handleOpenDelete}
        />
      </div>

      <div className="block md:hidden space-y-3">
        {employees.map((employee) => (
          <EmployeeCard
            key={employee.id}
            employee={employee}
            onEdit={handleOpenEdit}
            onDelete={handleOpenDelete}
            //onViewDetails={(emp) => handleOpenDetailsModal(emp)} // Exemple : Ouvre un Drawer ou un Dialog de détails
          />
        ))}
      </div>

      <EmployeeAddModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onEmployeeCreated={handleCreateEmployee}
      />

      <EmployeeEditModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedEmployee(null);
        }}
        selectedEmployee={selectedEmployee}
        onEmployeeUpdated={handleUpdateEmployee}
      />

      <AlertDialog
        isOpen={isDeleteAlertOpen}
        onClose={() => {
          setIsDeleteAlertOpen(false);
          setSelectedEmployee(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Supprimer cet employé"
        description={`Êtes-vous sûr de vouloir supprimer l'employé ${selectedEmployee?.name || ""} ?`}
        confirmText={isDeleting ? "Suppression..." : "Oui, supprimer"}
        isDanger
      />
    </div>
  );
}

export default EmployeePage;

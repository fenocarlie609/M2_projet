// src/features/employee/components/EmployeeTable.jsx
import React from "react";
import { Table, Button, Badge } from "@/shared/components/ui";
import { FiTrash2, FiEdit3 } from "react-icons/fi";

export function EmployeeTable({ data, isLoading, onEdit, onDelete }) {
  const columns = [
    { header: "Nom", key: "name" },
    { header: "Matricule", key: "matricule" },
    { header: "CIN", key: "cin", render: (row) => row.cin || "—" },
    { header: "Département", key: "department" },
    { header: "Poste", key: "position" },
    {
      header: "Accès app",
      key: "hasAppAccess",
      render: (row) => (
        <Badge variant={row.hasAppAccess ? "success" : "warning"}>
          {row.hasAppAccess ? "Oui" : "Non"}
        </Badge>
      ),
    },
    {
      header: "Actions",
      key: "actions",
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            icon={FiEdit3}
            className="text-slate-600 hover:text-slate-700 hover:bg-slate-100"
            onClick={() => onEdit(row)}
          />
          <Button
            variant="ghost"
            size="sm"
            icon={FiTrash2}
            className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
            onClick={() => onDelete(row)}
          />
        </div>
      ),
    },
  ];

  return <Table columns={columns} data={data} isLoading={isLoading} />;
}

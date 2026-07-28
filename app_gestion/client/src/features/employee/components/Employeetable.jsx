// src/features/employee/components/EmployeeTable.jsx
import React from "react";
import { Table, Button, Badge } from "@/shared/components/ui";
import { FiTrash2, FiEdit3, FiUser } from "react-icons/fi";
import { useAuth } from "@/features/auth";

export function EmployeeTable({ data, isLoading, onEdit, onDelete }) {
  const { checkPermission } = useAuth();

  const columns = [
    {
      header: "Photo",
      key: "avatarUrl",
      render: (row) => (
        <div className="w-9 h-9 rounded-lg border border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center shrink-0">
          {row.avatarUrl ? (
            <img
              src={row.avatarUrl}
              alt={row.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <FiUser className="text-slate-300" size={16} />
          )}
        </div>
      ),
    },
    { header: "Nom", key: "name" },
    { header: "Matricule", key: "matricule" },
    { header: "CIN", key: "cin", render: (row) => row.cin || "—" },
    {
      header: "Département",
      key: "department",
      render: (row) => row.department?.label || "—",
    },
    {
      header: "Poste",
      key: "position",
      render: (row) => row.position?.label || "—",
    },
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
      render: (row) => {
        const canUpdate = checkPermission("EMPLOYEES", "UPDATE");
        const canDelete = checkPermission("EMPLOYEES", "DELETE");

        if (!canUpdate && !canDelete)
          return <span className="text-xs text-slate-400">—</span>;

        return (
          <div className="flex items-center gap-1.5">
            {canUpdate && (
              <Button
                variant="ghost"
                size="sm"
                icon={FiEdit3}
                className="text-slate-600 hover:text-slate-700 hover:bg-slate-100"
                onClick={() => onEdit(row)}
              />
            )}

            {canDelete && (
              <Button
                variant="ghost"
                size="sm"
                icon={FiTrash2}
                className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                onClick={() => onDelete(row)}
              />
            )}
          </div>
        );
      },
    },
  ];

  return <Table columns={columns} data={data} isLoading={isLoading} />;
}

// src/features/client/components/ClientTable.jsx
import React from "react";
import { Table, Button, Badge } from "@/shared/components/ui";
import { FiTrash2, FiEdit3 } from "react-icons/fi";
import { useAuth } from "@/features/auth";

export function ClientTable({ data, isLoading, onEdit, onDelete }) {
  const { checkPermission } = useAuth();

  const columns = [
    {
      header: "Nom / Raison Sociale",
      key: "name",
      className: "font-semibold text-slate-900",
    },
    {
      header: "Type d'entité",
      key: "type",
      render: (row) => (
        <Badge variant={row.type === "COMPANY" ? "navy" : "secondary"}>
          {row.type === "COMPANY" ? "Entreprise" : "Particulier"}
        </Badge>
      ),
    },
    { header: "Téléphone", key: "phone", render: (row) => row.phone || "—" },
    {
      header: "Actions",
      key: "actions",
      render: (row) => {
        const canUpdate = checkPermission("CLIENTS", "UPDATE");
        const canDelete = checkPermission("CLIENTS", "DELETE");

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

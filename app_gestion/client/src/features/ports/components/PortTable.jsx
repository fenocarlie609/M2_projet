// src/features/port/components/PortTable.jsx
import React from "react";
import { Table, Button } from "@/shared/components/ui";
import { FiTrash2, FiEdit3 } from "react-icons/fi";
import { useAuth } from "@/features/auth";

export function PortTable({ data, isLoading, onEdit, onDelete }) {
  const { checkPermission } = useAuth();

  const columns = [
    { key: "code", header: "Code" },
    { key: "name", header: "Nom du port" },
    { key: "country", header: "Pays" },
    {
      header: "Actions",
      key: "actions",
      render: (row) => {
        const canUpdate = checkPermission("PORTS", "UPDATE");
        const canDelete = checkPermission("PORTS", "DELETE");

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

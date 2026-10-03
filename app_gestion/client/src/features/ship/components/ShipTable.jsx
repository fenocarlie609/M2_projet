// src/features/ship/components/ShipTable.jsx
import React from "react";
import { Table, Button, Badge } from "@/shared/components/ui";
import { FiTrash2, FiEdit3 } from "react-icons/fi";
import { useAuth } from "@/features/auth";

const STATUS_CONFIG = {
  ACTIVE: { label: "Actif", variant: "success" },
  INACTIVE: { label: "Inactif", variant: "error" },
  MAINTENANCE: { label: "Maintenance", variant: "warning" },
};

export function ShipTable({ data, isLoading, onEdit, onDelete }) {
  const { checkPermission } = useAuth();

  const columns = [
    { key: "name", header: "Navire" },
    { key: "operatorName", header: "Transporteur" },
    { key: "registrationNumber", header: "Immatriculation" },
    {
      key: "capacityTons",
      header: "Capacité",
      render: (row) => (row.capacityTons ? `${row.capacityTons} t` : "-"),
    },
    {
      header: "Statut",
      key: "status",
      render: (row) => {
        const config = STATUS_CONFIG[row.status] || {
          label: row.status,
          variant: "info",
        };
        return <Badge variant={config.variant}>{config.label}</Badge>;
      },
    },
    {
      header: "Actions",
      key: "actions",
      render: (row) => {
        // CORRECTION : c'était "CLIENTS" (copier-coller) au lieu de "VESSELS"
        const canUpdate = checkPermission("VESSELS", "UPDATE");
        const canDelete = checkPermission("VESSELS", "DELETE");

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

// src/features/voyage/components/VoyageTable.jsx
import React from "react";
import { Table, Button, Badge } from "@/shared/components/ui";
import { FiTrash2, FiEdit3 } from "react-icons/fi";
import { useAuth } from "@/features/auth";
import { formatDate } from "@/shared/utils/formatDate";

const STATUS_CONFIG = {
  SCHEDULED: { label: "Planifié", variant: "info" },
  IN_TRANSIT: { label: "En transit", variant: "warning" },
  ARRIVED: { label: "Arrivé", variant: "success" },
  CANCELLED: { label: "Annulé", variant: "error" },
};

export function VoyageTable({ data, isLoading, onEdit, onDelete }) {
  const { checkPermission } = useAuth();

  const columns = [
    { key: "voyageNumber", header: "Voyage" },
    {
      key: "vessel",
      header: "Navire",
      render: (row) => row.vessel?.name || "-",
    },
    {
      key: "departurePort",
      header: "Départ",
      render: (row) => row.departurePort?.name || "-",
    },
    {
      key: "arrivalPort",
      header: "Arrivée",
      render: (row) => row.arrivalPort?.name || "-",
    },
    {
      key: "arrivalDate",
      header: "Arrivée",
      render: (row) => formatDate(row.arrivalDate),
    },
    {
      key: "status",
      header: "Statut",
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
        const canUpdate = checkPermission("VOYAGES", "UPDATE");
        const canDelete = checkPermission("VOYAGES", "DELETE");

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

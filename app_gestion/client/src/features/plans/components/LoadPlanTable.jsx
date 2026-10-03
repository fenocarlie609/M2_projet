// src/features/loadingPlans/components/LoadPlanTable.jsx
import React from "react";
import { Table, Button, Badge } from "@/shared/components/ui";
import { FiEye, FiTrash2, FiEdit3 } from "react-icons/fi";
import { useAuth } from "@/features/auth";
import { formatDate } from "@/shared/utils/formatDate";

const STATUS_CONFIG = {
  true: { label: "Chargé", variant: "success" },
  false: { label: "Non Chargé", variant: "warning" },
};

const toTons = (kg) =>
  (Number(kg || 0) / 1000).toLocaleString("fr-FR", {
    maximumFractionDigits: 3,
  });

export function LoadPlanTable({ data, isLoading, onOpen, onEdit, onDelete }) {
  const { checkPermission } = useAuth();

  const columns = [
    { key: "reference", header: "Référence" },
    {
      key: "vessel",
      header: "Navire",
      render: (row) => row.voyage?.vessel?.name || "-",
    },
    {
      key: "voyageNumber",
      header: "N° Voyage",
      render: (row) => row.voyage?.voyageNumber || "-",
    },
    {
      key: "route",
      header: "Trajet",
      render: (row) => {
        const dep = row.voyage?.departurePort?.name;
        const arr = row.voyage?.arrivalPort?.name;
        if (!dep && !arr) return "-";
        return `${dep || "?"} ➔ ${arr || "?"}`;
      },
    },
    {
      key: "departureDate",
      header: "Date de départ",
      render: (row) => formatDate(row.voyage?.departureDate),
    },
    {
      key: "totalWeightKg",
      header: "Poids total",
      render: (row) => `${toTons(row.totalWeightKg)} t`,
    },
    {
      key: "status",
      header: "Statut",
      render: (row) => {
        const isVerified = Boolean(row.status);
        const config = STATUS_CONFIG[isVerified] || {
          label: "Inconnu",
          variant: "info",
        };
        return <Badge variant={config.variant}>{config.label}</Badge>;
      },
    },
    {
      key: "actions",
      header: "Actions",
      render: (row) => {
        const canUpdate = checkPermission("LOADING_PLANS", "UPDATE");
        const canDelete = checkPermission("LOADING_PLANS", "DELETE");

        return (
          <div className="flex items-center gap-1.5">
            {canUpdate && onEdit && (
              <Button
                variant="ghost"
                size="sm"
                icon={FiEdit3}
                className="text-slate-600 hover:text-slate-700 hover:bg-slate-100"
                onClick={() => onEdit(row)}
              />
            )}
            {onOpen && (
              <Button
                variant="ghost"
                size="sm"
                icon={FiEye}
                className="text-slate-600 hover:text-slate-700 hover:bg-slate-100"
                onClick={() => onOpen(row)}
              />
            )}
            {canDelete && onDelete && (
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

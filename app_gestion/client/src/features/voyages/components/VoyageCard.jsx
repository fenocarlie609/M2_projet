// src/features/voyage/components/VoyageCard.jsx
import React from "react";
import { Card, CardContent, Badge, DropdownMenu } from "@/shared/components/ui";
import { FiTrash2, FiEdit3, FiNavigation } from "react-icons/fi";
import { useAuth } from "@/features/auth";
import { formatDate } from "@/shared/utils";

const STATUS_CONFIG = {
  SCHEDULED: { label: "Planifié", variant: "info" },
  IN_TRANSIT: { label: "En transit", variant: "warning" },
  ARRIVED: { label: "Arrivé", variant: "success" },
  CANCELLED: { label: "Annulé", variant: "error" },
};

export function VoyageCard({ voyage, onEdit, onDelete }) {
  const { checkPermission } = useAuth();

  const actionMenuItems = [];

  if (checkPermission("VOYAGES", "UPDATE")) {
    actionMenuItems.push({
      label: "Modifier",
      icon: FiEdit3,
      onClick: () => onEdit(voyage),
    });
  }

  if (checkPermission("VOYAGES", "DELETE")) {
    actionMenuItems.push({
      label: "Supprimer",
      icon: FiTrash2,
      variant: "danger",
      onClick: () => onDelete(voyage),
    });
  }

  const statusConfig = STATUS_CONFIG[voyage.status] || {
    label: voyage.status,
    variant: "info",
  };

  return (
    <Card className="border border-slate-100 shadow-premium bg-white rounded-xl transition-all hover:shadow-md">
      <CardContent className="p-4 space-y-3.5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border bg-blue-50 border-blue-100 text-blue-600">
              <FiNavigation size={18} />
            </div>

            <div className="min-w-0">
              <h4 className="font-bold text-slate-900 text-sm truncate">
                {voyage.voyageNumber}
              </h4>
              <Badge
                variant={statusConfig.variant}
                className="mt-1 text-[10px] px-1.5 py-0"
              >
                {statusConfig.label}
              </Badge>
            </div>
          </div>

          {actionMenuItems.length > 0 && (
            <DropdownMenu items={actionMenuItems} />
          )}
        </div>

        <div className="space-y-1.5 pt-1.5 border-t border-slate-50 text-xs text-slate-500">
          <p className="font-medium truncate">
            <span className="text-slate-400">Navire : </span>
            {voyage.vessel?.name || "-"}
          </p>
          <p className="font-medium truncate">
            <span className="text-slate-400">Départ : </span>
            {voyage.departurePort?.name || "-"}
          </p>
          <p className="font-medium truncate">
            <span className="text-slate-400">Arrivée : </span>
            {voyage.arrivalPort?.name || "-"}
          </p>
          <p className="font-medium">
            <span className="text-slate-400">Date d'arrivée : </span>
            {formatDate(voyage.arrivalDate)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// src/features/ship/components/ShipCard.jsx
import React from "react";
import { Card, CardContent, Badge, DropdownMenu } from "@/shared/components/ui";
import { FiTrash2, FiEdit3, FiAnchor } from "react-icons/fi";
import { useAuth } from "@/features/auth";

const STATUS_CONFIG = {
  ACTIVE: { label: "Actif", variant: "success" },
  INACTIVE: { label: "Inactif", variant: "error" },
  MAINTENANCE: { label: "Maintenance", variant: "warning" },
};

export function ShipCard({ ship, onEdit, onDelete }) {
  const { checkPermission } = useAuth();

  const actionMenuItems = [];

  if (checkPermission("SHIPS", "UPDATE")) {
    actionMenuItems.push({
      label: "Modifier",
      icon: FiEdit3,
      onClick: () => onEdit(ship),
    });
  }

  if (checkPermission("SHIPS", "DELETE")) {
    actionMenuItems.push({
      label: "Supprimer",
      icon: FiTrash2,
      variant: "danger",
      onClick: () => onDelete(ship),
    });
  }

  const statusConfig = STATUS_CONFIG[ship.status] || {
    label: ship.status,
    variant: "info",
  };

  return (
    <Card className="border border-slate-100 shadow-premium bg-white rounded-xl transition-all hover:shadow-md">
      <CardContent className="p-4 space-y-3.5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border bg-blue-50 border-blue-100 text-blue-600">
              <FiAnchor size={18} />
            </div>

            <div className="min-w-0">
              <h4 className="font-bold text-slate-900 text-sm truncate">
                {ship.name}
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
          <p className="font-medium">
            <span className="text-slate-400">Immatriculation : </span>
            {ship.registrationNumber}
          </p>
          {ship.operatorName && (
            <p className="font-medium truncate">
              <span className="text-slate-400">Transporteur : </span>
              {ship.operatorName}
            </p>
          )}
          {ship.capacityTons && (
            <p className="font-medium">
              <span className="text-slate-400">Capacité : </span>
              {ship.capacityTons} t
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// src/features/driver/components/DriverCard.jsx
import React from "react";
import { Card, CardContent, Badge, DropdownMenu } from "@/shared/components/ui";
import { FiTrash2, FiEdit3, FiPhone, FiTruck } from "react-icons/fi";
import { useAuth } from "@/features/auth";

export function DriverCard({ driver, onEdit, onDelete }) {
  const { checkPermission } = useAuth();

  const actionMenuItems = [];
  if (checkPermission("DRIVERS", "UPDATE"))
    actionMenuItems.push({
      label: "Modifier",
      icon: FiEdit3,
      onClick: () => onEdit(driver),
    });
  if (checkPermission("DRIVERS", "DELETE"))
    actionMenuItems.push({
      label: "Supprimer",
      icon: FiTrash2,
      variant: "danger",
      onClick: () => onDelete(driver),
    });

  return (
    <Card className="border border-slate-100 shadow-premium bg-white rounded-xl">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 text-slate-600 flex items-center justify-center shrink-0">
              <FiTruck size={18} />
            </div>
            <div className="min-w-0">
              <h4 className="font-bold text-slate-900 text-sm truncate">
                {driver.name}
              </h4>
              <span className="font-mono text-xs text-brand-primary font-semibold bg-brand-light/20 px-1.5 py-0.5 rounded">
                {driver.licensePlate}
              </span>
            </div>
          </div>
          {actionMenuItems.length > 0 && (
            <DropdownMenu items={actionMenuItems} />
          )}
        </div>

        <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-50 text-xs">
          <Badge variant={driver.type === "COMPANY" ? "navy" : "secondary"}>
            {driver.type === "COMPANY" ? "Société" : "Indépendant"}
          </Badge>
          {driver.phone && (
            <div className="flex items-center gap-1 text-slate-500">
              <FiPhone size={12} />
              <span>{driver.phone}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// src/features/port/components/PortCard.jsx
import React from "react";
import { Card, CardContent, Badge, DropdownMenu } from "@/shared/components/ui";
import { FiTrash2, FiEdit3, FiMapPin } from "react-icons/fi";
import { useAuth } from "@/features/auth";

export function PortCard({ port, onEdit, onDelete }) {
  const { checkPermission } = useAuth();

  const actionMenuItems = [];

  if (checkPermission("PORTS", "UPDATE")) {
    actionMenuItems.push({
      label: "Modifier",
      icon: FiEdit3,
      onClick: () => onEdit(port),
    });
  }

  if (checkPermission("PORTS", "DELETE")) {
    actionMenuItems.push({
      label: "Supprimer",
      icon: FiTrash2,
      variant: "danger",
      onClick: () => onDelete(port),
    });
  }

  return (
    <Card className="border border-slate-100 shadow-premium bg-white rounded-xl transition-all hover:shadow-md">
      <CardContent className="p-4 space-y-3.5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border bg-blue-50 border-blue-100 text-blue-600">
              <FiMapPin size={18} />
            </div>

            <div className="min-w-0">
              <h4 className="font-bold text-slate-900 text-sm truncate">
                {port.name}
              </h4>
              <Badge variant="info" className="mt-1 text-[10px] px-1.5 py-0">
                {port.code}
              </Badge>
            </div>
          </div>

          {actionMenuItems.length > 0 && (
            <DropdownMenu items={actionMenuItems} />
          )}
        </div>

        <div className="space-y-1.5 pt-1.5 border-t border-slate-50 text-xs text-slate-500">
          <p className="font-medium">
            <span className="text-slate-400">Pays : </span>
            {port.country}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

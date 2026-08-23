// src/features/module/components/ModuleCard.jsx
import React from "react";
import { Card, CardContent, DropdownMenu } from "@/shared/components/ui";
import { FiTrash2, FiEdit3, FiGrid } from "react-icons/fi";
import { useAuth } from "@/features/auth";

export function ModuleCard({ appModule, onEdit, onDelete }) {
  const { user } = useAuth();

  // Voir la note dans ModuleTable.jsx : restrictToDepartment("TECH") côté
  // backend, pas un système de permission — on aligne le front là-dessus.
  const canManage = user?.department?.code === "TECH";

  const actionMenuItems = canManage
    ? [
        {
          label: "Modifier",
          icon: FiEdit3,
          onClick: () => onEdit(appModule),
        },
        {
          label: "Supprimer",
          icon: FiTrash2,
          variant: "danger",
          onClick: () => onDelete(appModule),
        },
      ]
    : [];

  return (
    <Card className="border border-slate-100 shadow-sm bg-white rounded-xl">
      <CardContent className="p-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center shrink-0">
            <FiGrid className="text-slate-400" size={18} />
          </div>
          <div className="min-w-0">
            <h4 className="font-bold text-slate-900 text-sm truncate">
              {appModule.label}
            </h4>
            <p className="text-xs font-mono text-slate-500 mt-0.5">
              {appModule.code}
            </p>
          </div>
        </div>

        {actionMenuItems.length > 0 && <DropdownMenu items={actionMenuItems} />}
      </CardContent>
    </Card>
  );
}

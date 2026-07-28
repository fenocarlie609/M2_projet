// src/features/users/components/EmployeeCard.jsx
import React from "react";
import {
  Card,
  CardContent,
  Badge,
  Button,
  DropdownMenu,
} from "@/shared/components/ui";
import { FiTrash2, FiEdit3, FiUser, FiEye } from "react-icons/fi";
import { useAuth } from "@/features/auth";

export function EmployeeCard({ employee, onEdit, onDelete, onViewDetails }) {
  const { checkPermission } = useAuth();

  const actionMenuItems = [];

  if (checkPermission("EMPLOYEES", "UPDATE")) {
    actionMenuItems.push({
      label: "Modifier",
      icon: FiEdit3,
      onClick: () => onEdit(employee),
    });
  }

  if (checkPermission("EMPLOYEES", "DELETE")) {
    actionMenuItems.push({
      label: "Supprimer",
      icon: FiTrash2,
      variant: "danger",
      onClick: () => onDelete(employee),
    });
  }

  const canRead = checkPermission("EMPLOYEES", "READ");

  return (
    <Card className="border border-slate-100 shadow-sm bg-white rounded-xl">
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl border border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center shrink-0">
              {employee.avatarUrl ? (
                <img
                  src={employee.avatarUrl}
                  alt={employee.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <FiUser className="text-slate-300" size={20} />
              )}
            </div>

            <div>
              <h4 className="font-bold text-slate-900 text-sm line-clamp-1">
                {employee.name}
              </h4>
              <p className="text-xs font-mono text-slate-500 mt-0.5">
                {employee.matricule}
              </p>
            </div>
          </div>

          {actionMenuItems.length > 0 && (
            <DropdownMenu items={actionMenuItems} />
          )}
        </div>

        <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-50">
          <div className="min-w-0">
            <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              Poste
            </p>
            <p className="text-xs font-semibold text-slate-700 truncate mt-0.5">
              {employee.position?.label || "—"}
            </p>
          </div>

          <div className="shrink-0 text-right">
            <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-0.5">
              Accès App
            </p>
            <Badge variant={employee.hasAppAccess ? "success" : "warning"}>
              {employee.hasAppAccess ? "Oui" : "Non"}
            </Badge>
          </div>
        </div>

        {canRead && (
          <Button
            variant="secondary"
            size="sm"
            className="w-full justify-center text-xs text-slate-600 border-slate-200 bg-slate-50/50 hover:bg-slate-50"
            icon={FiEye}
            onClick={() => onViewDetails(employee)}
          >
            Voir tout
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

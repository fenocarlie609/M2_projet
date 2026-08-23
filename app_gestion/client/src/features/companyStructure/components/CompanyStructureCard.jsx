import React from "react";
import { Card, CardContent, Badge, DropdownMenu } from "@/shared/components/ui";
import { FiPlus, FiEdit3, FiTrash2 } from "react-icons/fi";
import { useAuth } from "@/features/auth";

export function CompanyStructureCard({
  department,
  onEditDepartment,
  onDeleteDepartment,
  onAddPosition,
  onEditPosition,
  onDeletePosition,
}) {
  const { checkPermission } = useAuth();

  const canCreate = checkPermission("COMPANY_STRUCTURE", "CREATE");
  const canUpdate = checkPermission("COMPANY_STRUCTURE", "UPDATE");
  const canDelete = checkPermission("COMPANY_STRUCTURE", "DELETE");

  const departmentMenuItems = [];
  if (canUpdate)
    departmentMenuItems.push({
      label: "Modifier",
      icon: FiEdit3,
      onClick: () => onEditDepartment(department),
    });
  if (canDelete)
    departmentMenuItems.push({
      label: "Supprimer",
      icon: FiTrash2,
      variant: "danger",
      onClick: () => onDeleteDepartment(department),
    });

  return (
    <Card className="border border-slate-100 shadow-premium bg-white rounded-2xl transition-all duration-200 hover:shadow-md">
      <div className="flex items-start justify-between p-5 border-b border-slate-100 bg-slate-50/40 rounded-t-2xl">
        <div className="space-y-1">
          <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-brand-primary bg-brand-primary/10 px-2 py-0.5 rounded-md">
            {department.code}
          </span>
          <h3 className="font-bold text-slate-900 text-base tracking-tight">
            {department.label}
          </h3>
        </div>
        {departmentMenuItems.length > 0 && (
          <DropdownMenu items={departmentMenuItems} />
        )}
      </div>

      <CardContent className="p-5 space-y-4">
        <div className="space-y-2.5">
          {(department.positions || []).length === 0 && (
            <p className="text-xs text-slate-400 py-4 text-center italic">
              Aucun poste dans ce département.
            </p>
          )}

          {(department.positions || []).map((pos) => {
            const positionMenuItems = [];
            if (canUpdate)
              positionMenuItems.push({
                label: "Modifier",
                icon: FiEdit3,
                onClick: () => onEditPosition(pos),
              });
            if (canDelete)
              positionMenuItems.push({
                label: "Supprimer",
                icon: FiTrash2,
                variant: "danger",
                onClick: () => onDeletePosition(pos),
              });

            return (
              <div
                key={pos.id}
                className="group flex items-center justify-between p-3.5 bg-white border border-slate-100 hover:border-slate-200 rounded-xl shadow-xs transition-all duration-200"
              >
                <div className="space-y-1.5 min-w-0 pr-2">
                  <p className="text-sm font-semibold text-slate-800 truncate group-hover:text-brand-primary transition-colors">
                    {pos.label}
                  </p>
                  <span className="inline-block font-mono text-[10px] font-medium px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded">
                    {pos.code}
                  </span>
                </div>
                {positionMenuItems.length > 0 && (
                  <div className="opacity-60 group-hover:opacity-100 transition-opacity">
                    <DropdownMenu items={positionMenuItems} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {canCreate && (
          <button
            onClick={() => onAddPosition(department)}
            className="w-full flex items-center justify-center gap-2 py-3 border border-dashed border-slate-200 hover:border-brand-primary/40 rounded-xl bg-slate-50/40 hover:bg-brand-primary/[0.02] text-xs font-semibold text-slate-500 hover:text-brand-primary transition-all dynamic-group"
          >
            <FiPlus
              className="text-slate-400 group-hover:text-brand-primary transition-colors"
              size={14}
            />
            Ajouter un poste
          </button>
        )}
      </CardContent>
    </Card>
  );
}

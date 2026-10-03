// src/features/module/components/ModuleTable.jsx
import React from "react";
import { Table, Button } from "@/shared/components/ui";
import { FiTrash2, FiEdit3 } from "react-icons/fi";
import { useAuth } from "@/features/auth";

export function ModuleTable({ data, isLoading, onEdit, onDelete }) {
  const { user } = useAuth();

  // ⚠️ Le backend protège création/modification/suppression avec
  // restrictToDepartment("TECH") (pas authorize("MODULES", ...)) — donc ici
  // on se base sur le département de l'employé, pas sur checkPermission.
  // Si vous migrez ce endpoint vers le système de permissions plus tard,
  // remplacez cette ligne par checkPermission("MODULES", "UPDATE"/"DELETE").
  const canManage = user.department.code === "TECH" || "ADMIN";

  const columns = [
    { header: "Code", key: "code" },
    { header: "Libellé", key: "label" },
    {
      header: "Actions",
      key: "actions",
      render: (row) => {
        if (!canManage)
          return <span className="text-xs text-slate-400">—</span>;

        return (
          <div className="flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="sm"
              icon={FiEdit3}
              className="text-slate-600 hover:text-slate-700 hover:bg-slate-100"
              onClick={() => onEdit(row)}
            />
            <Button
              variant="ghost"
              size="sm"
              icon={FiTrash2}
              className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
              onClick={() => onDelete(row)}
            />
          </div>
        );
      },
    },
  ];

  return <Table columns={columns} data={data} isLoading={isLoading} />;
}

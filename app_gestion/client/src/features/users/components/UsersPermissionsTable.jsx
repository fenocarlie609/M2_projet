// src/features/users/components/UsersPermissionsTable.jsx
import React from "react";
import { Table, Button, Badge } from "@/shared/components/ui";
import { FiShield } from "react-icons/fi";
import { useAuth } from "@/features/auth";

export function UsersPermissionsTable({ data, isLoading, onManage }) {
  const { checkPermission } = useAuth();

  const columns = [
    { header: "Nom", key: "name" },
    { header: "Matricule", key: "matricule" },
    {
      header: "Département",
      key: "department",
      render: (row) => row.department?.label || "—",
    },
    {
      header: "Permissions",
      key: "permissions",
      render: (row) => (
        <div className="flex flex-wrap gap-1.5">
          {(row.permissions || []).length === 0 && (
            <span className="text-xs text-slate-400">Aucune</span>
          )}
          {(row.permissions || []).map((perm) => (
            <Badge key={perm.id} variant="navy">
              {perm.module}:{perm.action}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      header: "Actions",
      key: "actions",
      render: (row) => {
        if (!checkPermission("USERS", "UPDATE"))
          return <span className="text-xs text-slate-400">—</span>;

        return (
          <Button
            variant="ghost"
            size="sm"
            icon={FiShield}
            className="text-slate-600 hover:text-slate-700 hover:bg-slate-100"
            onClick={() => onManage(row)}
          >
            Gérer
          </Button>
        );
      },
    },
  ];

  return <Table columns={columns} data={data} isLoading={isLoading} />;
}

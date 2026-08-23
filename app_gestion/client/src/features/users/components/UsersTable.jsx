// src/features/users/components/UsersTable.jsx
import React from "react";
import { Table, Button, Badge } from "@/shared/components/ui";
import { FiTrash2, FiKey, FiShield, FiPower } from "react-icons/fi";
import { useAuth } from "@/features/auth";

export function UsersTable({
  data,
  isLoading,
  onTogglePermissions,
  onToggleStatus,
  onResetPassword,
  onRevokeAccess,
}) {
  const { checkPermission } = useAuth();

  const columns = [
    { header: "Nom", key: "name" },
    { header: "Email", key: "email" },
    {
      header: "Département",
      key: "department",
      render: (row) => row.department?.label || "—",
    },
    {
      header: "Poste",
      key: "position",
      render: (row) => row.position?.label || "—",
    },
    // {
    //   header: "Statut",
    //   key: "isActive",
    //   render: (row) => (
    //     <Badge variant={row.isActive ? "success" : "warning"}>
    //       {row.isActive ? "Actif" : "Désactivé"}
    //     </Badge>
    //   ),
    // },
    {
      header: "Permissions",
      key: "permissions",
      render: (row) => (
        <Badge variant="navy">{(row.permissions || []).length}</Badge>
      ),
    },
    {
      header: "Actions",
      key: "actions",
      render: (row) => {
        const canUpdate = checkPermission("USERS", "UPDATE");
        const canDelete = checkPermission("USERS", "DELETE");

        if (!canUpdate && !canDelete)
          return <span className="text-xs text-slate-400">—</span>;

        return (
          <div className="flex items-center gap-1.5">
            {canUpdate && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={FiPower}
                  className={
                    row.isActive
                      ? "text-green-600 hover:text-green-700 hover:bg-green-50"
                      : "text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                  }
                  onClick={() => onToggleStatus(row)}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  icon={FiKey}
                  className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                  onClick={() => onResetPassword(row)}
                />
              </>
            )}
            {canDelete && (
              <Button
                variant="ghost"
                size="sm"
                icon={FiTrash2}
                className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                onClick={() => onRevokeAccess(row)}
              />
            )}
          </div>
        );
      },
    },
  ];

  return <Table columns={columns} data={data} isLoading={isLoading} />;
}

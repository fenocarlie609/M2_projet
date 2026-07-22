// src/features/users/components/UsersTable.jsx
import React from "react";
import { Table, Button, Badge } from "@/shared/components/ui";
import { FiTrash2, FiKey, FiShield, FiPower } from "react-icons/fi";

export function UsersTable({
  data,
  isLoading,
  onTogglePermissions,
  onToggleStatus,
  onResetPassword,
  onRevokeAccess,
}) {
  const columns = [
    { header: "Nom", key: "name" },
    { header: "Email", key: "email" },
    { header: "Département", key: "department" },
    { header: "Poste", key: "position" },
    {
      header: "Statut",
      key: "isActive",
      render: (row) => (
        <Badge variant={row.isActive ? "success" : "warning"}>
          {row.isActive ? "Actif" : "Désactivé"}
        </Badge>
      ),
    },
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
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            icon={FiShield}
            className="text-slate-600 hover:text-slate-700 hover:bg-slate-100"
            onClick={() => onTogglePermissions(row)}
          />
          <Button
            variant="ghost"
            size="sm"
            icon={FiPower}
            className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
            onClick={() => onToggleStatus(row)}
          />
          <Button
            variant="ghost"
            size="sm"
            icon={FiKey}
            className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
            onClick={() => onResetPassword(row)}
          />
          <Button
            variant="ghost"
            size="sm"
            icon={FiTrash2}
            className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
            onClick={() => onRevokeAccess(row)}
          />
        </div>
      ),
    },
  ];

  return <Table columns={columns} data={data} isLoading={isLoading} />;
}

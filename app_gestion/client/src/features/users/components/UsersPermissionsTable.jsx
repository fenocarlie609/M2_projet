// src/features/users/components/UsersPermissionsTable.jsx
import React from "react";
import { Table, Button, Badge } from "@/shared/components/ui";
import { FiShield } from "react-icons/fi";

/**
 * Vue d'audit globale des permissions : une ligne par utilisateur (un même
 * utilisateur peut posséder plusieurs permissions, affichées en badges dans
 * une même cellule plutôt qu'une ligne par permission).
 *
 * `data` = la réponse brute de GET /users/permissions, c'est-à-dire un
 * tableau d'employés : [{ id, name, matricule, department, permissions }].
 */
export function UsersPermissionsTable({ data, isLoading, onManage }) {
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
      render: (row) => (
        <Button
          variant="ghost"
          size="sm"
          icon={FiShield}
          className="text-slate-600 hover:text-slate-700 hover:bg-slate-100"
          onClick={() => onManage(row)}
        >
          Gérer
        </Button>
      ),
    },
  ];

  return <Table columns={columns} data={data} isLoading={isLoading} />;
}

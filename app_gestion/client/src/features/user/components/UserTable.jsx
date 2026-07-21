// src/features/user/components/UserTable.jsx
import React from "react";
import { Table, Button, Badge } from "@/shared/components/ui";
import { FiTrash2, FiEdit3 } from "react-icons/fi";

export function UserTable({ data, isLoading, onEdit, onDelete }) {
  const columns = [
    { header: "Nom", key: "name" },
    { header: "Email", key: "email" },
    {
      header: "Role",
      key: "role",
      render: (row) => (
        <Badge
          variant={
            row.role === "SUPERADMIN"
              ? "navy"
              : row.role === "ADMIN"
                ? "warning"
                : "success"
          }
        >
          {row.role}
        </Badge>
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
      ),
    },
  ];

  return <Table columns={columns} data={data} isLoading={isLoading} />;
}

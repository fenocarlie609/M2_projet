// src/features/client/components/ClientCard.jsx
import React from "react";
import { Card, CardContent, Badge, DropdownMenu } from "@/shared/components/ui";
import {
  FiTrash2,
  FiEdit3,
  FiPhone,
  FiMapPin,
  FiBriefcase,
  FiUser,
} from "react-icons/fi";
import { useAuth } from "@/features/auth";

export function ClientCard({ client, onEdit, onDelete }) {
  // Extraction de checkPermission depuis le hook useAuth
  const { checkPermission } = useAuth();

  // On construit la liste des actions autorisées en utilisant la fonction globale
  const actionMenuItems = [];

  if (checkPermission("CLIENTS", "UPDATE")) {
    actionMenuItems.push({
      label: "Modifier",
      icon: FiEdit3,
      onClick: () => onEdit(client),
    });
  }

  if (checkPermission("CLIENTS", "DELETE")) {
    actionMenuItems.push({
      label: "Supprimer",
      icon: FiTrash2,
      variant: "danger",
      onClick: () => onDelete(client),
    });
  }

  const isCompany = client.type === "COMPANY";

  return (
    <Card className="border border-slate-100 shadow-premium bg-white rounded-xl transition-all hover:shadow-md">
      <CardContent className="p-4 space-y-3.5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                isCompany
                  ? "bg-emerald-50 border-emerald-100 text-emerald-600"
                  : "bg-blue-50 border-blue-100 text-blue-600"
              }`}
            >
              {isCompany ? <FiBriefcase size={18} /> : <FiUser size={18} />}
            </div>

            <div className="min-w-0">
              <h4 className="font-bold text-slate-900 text-sm truncate">
                {client.name}
              </h4>
              <Badge
                variant={isCompany ? "navy" : "info"}
                className="mt-1 text-[10px] px-1.5 py-0"
              >
                {isCompany ? "Entreprise" : "Particulier"}
              </Badge>
            </div>
          </div>

          {actionMenuItems.length > 0 && (
            <DropdownMenu items={actionMenuItems} />
          )}
        </div>

        {client.phone && (
          <div className="flex items-center gap-2 text-xs text-slate-500 pt-1.5 border-t border-slate-50">
            <FiPhone className="text-slate-400 shrink-0" size={13} />
            <span className="font-medium truncate">{client.phone}</span>
          </div>
        )}
        {client.address && (
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <FiMapPin className="shrink-0 text-slate-400" size={13} />
            <span className="truncate">{client.address}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

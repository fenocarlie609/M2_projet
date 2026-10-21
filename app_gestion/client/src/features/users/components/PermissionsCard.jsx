// src/features/users/components/PermissionsCard.jsx
// Vue mobile du recapitulatif des permissions : chaque employe tient dans une
// carte, avec ses droits en pastilles.
import React from "react";
import { Card, CardContent, Badge, Button } from "@/shared/components/ui";
import { FiShield } from "react-icons/fi";
import { useAuth } from "@/features/auth";

export function PermissionsCard({ employe, onManage }) {
  const { checkPermission } = useAuth();
  const permissions = employe.permissions || [];

  return (
    <Card className="border border-slate-100 shadow-premium bg-white rounded-xl">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-bold text-slate-900 text-sm truncate">
              {employe.name}
            </p>
            <p className="text-[11px] text-slate-500 truncate">
              {employe.matricule} · {employe.department?.label || "—"}
            </p>
          </div>
          <Badge variant="navy">{permissions.length}</Badge>
        </div>

        <div className="flex flex-wrap gap-1">
          {permissions.length === 0 && (
            <span className="text-xs text-slate-400">Aucune permission</span>
          )}
          {permissions.map((permission) => (
            <Badge
              key={permission.id || `${permission.module}-${permission.action}`}
              variant="navy"
            >
              {permission.module}:{permission.action}
            </Badge>
          ))}
        </div>

        {checkPermission("USERS", "UPDATE") && (
          <div className="pt-1">
            <Button
              variant="secondary"
              size="sm"
              icon={FiShield}
              onClick={() => onManage(employe)}
            >
              Gérer
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

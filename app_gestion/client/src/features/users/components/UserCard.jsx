// src/features/users/components/UserCard.jsx
// Vue mobile d'un utilisateur : le tableau des comptes laisse trop de colonnes
// pour un petit ecran, la carte les resume.
import React from "react";
import { Card, CardContent, Badge, Button } from "@/shared/components/ui";
import { FiTrash2, FiKey, FiPower, FiUser } from "react-icons/fi";
import { useAuth } from "@/features/auth";

export function UserCard({
  user,
  onTogglePermissions,
  onToggleStatus,
  onResetPassword,
  onRevokeAccess,
}) {
  const { checkPermission } = useAuth();

  const canUpdate = checkPermission("USERS", "UPDATE");
  const canDelete = checkPermission("USERS", "DELETE");

  const permissions = user.permissions || [];

  return (
    <Card className="border border-slate-100 shadow-premium bg-white rounded-xl">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
              <FiUser size={18} />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-slate-900 text-sm truncate">
                {user.name}
              </p>
              <p className="text-[11px] text-slate-500 truncate">
                {user.email || "Sans adresse"}
              </p>
            </div>
          </div>

          <Badge variant={user.isActive ? "success" : "warning"}>
            {user.isActive ? "Actif" : "Désactivé"}
          </Badge>
        </div>

        <dl className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
          <div>
            <dt className="text-slate-400">Département</dt>
            <dd className="font-medium truncate">
              {user.department?.label || "—"}
            </dd>
          </div>
          <div>
            <dt className="text-slate-400">Poste</dt>
            <dd className="font-medium truncate">
              {user.position?.label || "—"}
            </dd>
          </div>
          <div>
            <dt className="text-slate-400">Matricule</dt>
            <dd className="font-medium truncate">{user.matricule || "—"}</dd>
          </div>
          <div>
            <dt className="text-slate-400">Permissions</dt>
            <dd className="font-medium">{permissions.length}</dd>
          </div>
        </dl>

        {permissions.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {permissions.slice(0, 4).map((permission) => (
              <Badge
                key={
                  permission.id || `${permission.module}-${permission.action}`
                }
                variant="navy"
              >
                {permission.module}
                {permission.action !== "*" ? `:${permission.action}` : ""}
              </Badge>
            ))}
            {permissions.length > 4 && (
              <Badge variant="info">+{permissions.length - 4}</Badge>
            )}
          </div>
        )}

        {(canUpdate || canDelete) && (
          <div className="flex items-center gap-1.5 pt-1">
            {canUpdate && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={FiPower}
                  aria-label={user.isActive ? "Désactiver" : "Activer"}
                  className={
                    user.isActive
                      ? "text-green-600"
                      : "text-rose-600"
                  }
                  onClick={() => onToggleStatus(user)}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  icon={FiKey}
                  aria-label="Réinitialiser le mot de passe"
                  className="text-indigo-600"
                  onClick={() => onResetPassword(user)}
                />
              </>
            )}
            {canDelete && (
              <Button
                variant="ghost"
                size="sm"
                icon={FiTrash2}
                aria-label="Révoquer l'accès"
                className="text-rose-600"
                onClick={() => onRevokeAccess(user)}
              />
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// src/features/plans/components/LoadLineCard.jsx
// Vue mobile d'une ligne de manifeste : le tableau du manifeste compte
// plus de dix colonnes, la carte les regroupe par theme.
import React from "react";
import { FiEdit3, FiTrash2, FiMapPin, FiTruck } from "react-icons/fi";
import { Badge, Button, Card, CardContent } from "@/shared/components/ui";
import { formatDate } from "@/shared/utils/formatDate";

const formatLoader = (load) => {
  if (!load.loadedBy?.name) {
    return load.status === "LOADED" ? "Chargeur non renseigné" : "-";
  }
  return load.loadedBy.matricule
    ? `${load.loadedBy.name} (${load.loadedBy.matricule})`
    : load.loadedBy.name;
};

const statusLabel = (status, operationType) => {
  if (status === "CANCELLED") return "Annulé";
  if (status === "LOADED") {
    return operationType === "UNLOAD" ? "Déchargé" : "Chargé";
  }
  return operationType === "UNLOAD" ? "À décharger" : "À charger";
};

const statusVariant = (status) => {
  if (status === "LOADED") return "success";
  if (status === "CANCELLED") return "error";
  return "warning";
};

export function LoadLineCard({
  load,
  operationType = "LOAD",
  isLocked,
  canUpdate,
  canDelete,
  onEdit,
  onDelete,
}) {
  const isUnload = operationType === "UNLOAD";

  return (
    <Card className="border border-slate-100 shadow-premium bg-white rounded-xl">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-semibold text-slate-900 text-sm break-words">
              {load.description || "—"}
            </p>
            <p className="text-[11px] text-slate-500 truncate">
              {load.client?.name || "Client non renseigné"}
            </p>
          </div>
          <Badge variant={statusVariant(load.status)}>
            {statusLabel(load.status, operationType)}
          </Badge>
        </div>

        <dl className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
          <div>
            <dt className="text-slate-400">Colis</dt>
            <dd className="font-medium">
              {Number(load.packageCount || 0).toLocaleString("fr-FR")}
            </dd>
          </div>
          <div>
            <dt className="text-slate-400">Poids</dt>
            <dd className="font-medium">
              {Number(load.weightKg || 0).toLocaleString("fr-FR")} kg
            </dd>
          </div>
          <div>
            <dt className="text-slate-400">{isUnload ? "Véhicule" : "Chauffeur"}</dt>
            <dd className="font-medium truncate">
              {isUnload
                ? load.vehiclePlate || "-"
                : load.driverName || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-slate-400">
              {isUnload ? "Date de déchargement" : "Date de chargement"}
            </dt>
            <dd className="font-medium">{formatDate(load.loadingDate)}</dd>
          </div>
        </dl>

        {load.loadingPosition && (
          <p className="flex items-center gap-1.5 text-[11px] text-slate-600">
            <FiMapPin size={12} className="text-slate-400 shrink-0" />
            <span className="font-medium">{load.loadingPosition}</span>
          </p>
        )}

        {load.vehiclePlate && !isUnload && (
          <p className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <FiTruck size={12} className="text-slate-400 shrink-0" />
            <span className="truncate">{load.vehiclePlate}</span>
          </p>
        )}

        {load.anomaly && (
          <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-2 py-1 break-words">
            {load.anomaly}
          </p>
        )}

        <div className="flex items-center gap-2 flex-wrap pt-1">
          {load.isHazardous && <Badge variant="error">Matière dangereuse</Badge>}
          <span className="text-[11px] text-slate-500 truncate">
            {formatLoader(load)}
          </span>
        </div>

        {!isLocked && (canUpdate || canDelete) && (
          <div className="flex items-center gap-1.5">
            {canUpdate && (
              <Button
                variant="ghost"
                size="sm"
                icon={FiEdit3}
                title="Modifier"
                aria-label="Modifier"
                onClick={() => onEdit(load)}
              />
            )}
            {canDelete && (
              <Button
                variant="ghost"
                size="sm"
                icon={FiTrash2}
                title="Supprimer"
                aria-label="Supprimer"
                className="text-rose-600"
                onClick={() => onDelete(load)}
              />
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

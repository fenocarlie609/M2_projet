// src/features/plans/components/LoadPlanCard.jsx
// Vue mobile d'un plan de manutention : le tableau, peu lisible sur un petit
// ecran, devient une carte resume.
import React from "react";
import { Card, CardContent, Badge, Button } from "@/shared/components/ui";
import { FiEye, FiTrash2, FiEdit3, FiTruck } from "react-icons/fi";
import { useAuth } from "@/features/auth";
import { formatDate } from "@/shared/utils/formatDate";

const toTons = (kg) =>
  (Number(kg || 0) / 1000).toLocaleString("fr-FR", {
    maximumFractionDigits: 3,
  });

export function LoadPlanCard({
  plan,
  operationType = "LOAD",
  onOpen,
  onEdit,
  onDelete,
}) {
  const { checkPermission } = useAuth();

  const canUpdate = checkPermission("LOADING_PLANS", "UPDATE");
  const canDelete = checkPermission("LOADING_PLANS", "DELETE");
  const isLocked = Boolean(plan.validatedAt);

  const depart = plan.voyage?.departurePort?.name;
  const arrivee = plan.voyage?.arrivalPort?.name;

  const statut = plan.status
    ? {
        label: operationType === "UNLOAD" ? "Déchargé" : "Chargé",
        variant: "success",
      }
    : {
        label: operationType === "UNLOAD" ? "À décharger" : "À charger",
        variant: "warning",
      };

  return (
    <Card className="border border-slate-100 shadow-premium bg-white rounded-xl">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
              <FiTruck size={18} />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-slate-900 text-sm truncate">
                {plan.reference}
              </p>
              <p className="text-[11px] text-slate-500 truncate">
                {plan.voyage?.vessel?.name || "—"}
                {plan.voyage?.voyageNumber
                  ? ` · ${plan.voyage.voyageNumber}`
                  : ""}
              </p>
            </div>
          </div>

          <Badge variant={statut.variant}>{statut.label}</Badge>
        </div>

        <dl className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
          <div className="col-span-2">
            <dt className="text-slate-400">Trajet</dt>
            <dd className="font-medium truncate">
              {depart || arrivee ? `${depart || "?"} ➔ ${arrivee || "?"}` : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-slate-400">Départ</dt>
            <dd className="font-medium">
              {formatDate(plan.voyage?.departureDate)}
            </dd>
          </div>
          <div>
            <dt className="text-slate-400">Poids total</dt>
            <dd className="font-medium">{toTons(plan.totalWeightKg)} t</dd>
          </div>
        </dl>

        {operationType === "UNLOAD" && plan.sourceLoadingPlan?.reference && (
          <p className="text-[11px] text-slate-500">
            Provenance : {plan.sourceLoadingPlan.reference}
          </p>
        )}

        <div className="flex items-center gap-1.5 pt-1">
          {canUpdate && onEdit && !isLocked && (
            <Button
              variant="ghost"
              size="sm"
              icon={FiEdit3}
              aria-label="Modifier le plan"
              className="text-slate-600"
              onClick={() => onEdit(plan)}
            />
          )}
          {onOpen && (
            <Button
              variant="ghost"
              size="sm"
              icon={FiEye}
              aria-label="Ouvrir le plan"
              className="text-slate-600"
              onClick={() => onOpen(plan)}
            />
          )}
          {canDelete && onDelete && !isLocked && !plan.sourceLoadingPlanId && (
            <Button
              variant="ghost"
              size="sm"
              icon={FiTrash2}
              aria-label="Supprimer le plan"
              className="text-rose-600"
              onClick={() => onDelete(plan)}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}

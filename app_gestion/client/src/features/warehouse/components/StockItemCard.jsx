// src/features/warehouse/components/StockItemCard.jsx
// Vue mobile des marchandises en entrepot.
import React from "react";
import { Card, CardContent, Badge, Button } from "@/shared/components/ui";
import { FiCheckCircle, FiTruck } from "react-icons/fi";
import { useAuth } from "@/features/auth";
import { formatDate } from "@/shared/utils";

const VARIANT_STATUT = {
  IN_STOCK: "warning",
  EMBARKED: "info",
  PICKED_UP: "success",
};

const LIBELLE_STATUT = {
  IN_STOCK: "En stock",
  EMBARKED: "Réembarqué",
  PICKED_UP: "Retiré",
};

export function StockItemCard({ item, onPickup, onEmbark }) {
  const { checkPermission } = useAuth();
  const canUpdate = checkPermission("ENTREPOTS", "UPDATE");

  return (
    <Card className="border border-slate-100 shadow-premium bg-white rounded-xl">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900 truncate">
              {item.description}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {item.reference} — {item.warehouse?.code}
            </p>
          </div>
          <Badge variant={VARIANT_STATUT[item.status] || "info"}>
            {LIBELLE_STATUT[item.status] || item.status}
          </Badge>
        </div>

        <dl className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
          <div>
            <dt className="text-slate-400">Client</dt>
            <dd className="font-medium truncate">{item.client?.name || "—"}</dd>
          </div>
          <div>
            <dt className="text-slate-400">Colis / poids</dt>
            <dd className="font-medium">
              {item.packageCount} colis —{" "}
              {Number(item.weightKg).toLocaleString("fr-FR")} kg
            </dd>
          </div>
          <div>
            <dt className="text-slate-400">Entrée</dt>
            <dd className="font-medium">{formatDate(item.arrivalDate)}</dd>
          </div>
          <div>
            <dt className="text-slate-400">Provenance</dt>
            <dd className="font-medium truncate">
              {item.load?.loadingPlan?.reference || "—"}
            </dd>
          </div>
        </dl>

        {canUpdate && item.status === "IN_STOCK" && (
          <div className="flex items-center gap-2 pt-1">
            <Button
              variant="secondary"
              size="sm"
              icon={FiCheckCircle}
              className="flex-1"
              onClick={() => onPickup(item)}
            >
              Retrait
            </Button>
            <Button
              variant="secondary"
              size="sm"
              icon={FiTruck}
              className="flex-1"
              onClick={() => onEmbark(item)}
            >
              Réembarquer
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

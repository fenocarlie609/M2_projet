// src/features/warehouse/components/MovementCard.jsx
// Vue mobile des mouvements d'entrepot.
import React from "react";
import { Card, CardContent, Badge } from "@/shared/components/ui";
import { formatDateTime } from "@/shared/utils";

const VARIANT = {
  ENTRY: "info",
  PICKUP: "success",
  RE_EMBARKMENT: "warning",
};

const LIBELLE = {
  ENTRY: "Entrée",
  PICKUP: "Retrait client",
  RE_EMBARKMENT: "Réembarquement",
};

export function MovementCard({ mouvement }) {
  return (
    <Card className="border border-slate-100 shadow-premium bg-white rounded-xl">
      <CardContent className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-semibold text-slate-900 text-sm truncate">
              {mouvement.item?.description || "—"}
            </p>
            <p className="text-[11px] text-slate-500 truncate">
              {mouvement.item?.reference} · {mouvement.warehouse?.code}
            </p>
          </div>
          <Badge variant={VARIANT[mouvement.type] || "info"}>
            {LIBELLE[mouvement.type] || mouvement.type}
          </Badge>
        </div>

        <p className="text-[11px] text-slate-500">
          {formatDateTime(mouvement.createdAt)} —{" "}
          {mouvement.employee?.name || "Système"}
        </p>

        {mouvement.note && (
          <p className="text-[11px] text-slate-500 italic break-words">
            {mouvement.note}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

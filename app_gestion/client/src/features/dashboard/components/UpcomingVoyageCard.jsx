// src/features/dashboard/components/UpcomingVoyageCard.jsx
// Vue mobile d'un prochain depart.
import React from "react";
import { Badge, Card, CardContent } from "@/shared/components/ui";
import { formatDate } from "@/shared/utils/formatDate";

export const VARIANT_STATUT = {
  SCHEDULED: "info",
  IN_TRANSIT: "warning",
  ARRIVED: "success",
  CANCELLED: "error",
  PENDING: "warning",
  LOADED: "success",
};

export const libelleStatut = (statut) =>
  ({
    SCHEDULED: "Planifié",
    IN_TRANSIT: "En transit",
    ARRIVED: "Arrivé",
    CANCELLED: "Annulé",
  })[statut] || statut;

export function UpcomingVoyageCard({ voyage }) {
  return (
    <Card className="border border-slate-100 shadow-premium bg-white rounded-xl">
      <CardContent className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-bold text-slate-900 text-sm truncate">
              {voyage.numero}
            </p>
            <p className="text-[11px] text-slate-500 truncate">
              {voyage.navire || "—"}
            </p>
          </div>
          <Badge variant={VARIANT_STATUT[voyage.statut] || "info"}>
            {libelleStatut(voyage.statut)}
          </Badge>
        </div>

        <p className="text-[11px] text-slate-600">
          Départ : {formatDate(voyage.depart)}
        </p>
      </CardContent>
    </Card>
  );
}

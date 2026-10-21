// src/features/dashboard/components/AuditLineCard.jsx
// Vue mobile d'une ligne du journal d'audit.
import React from "react";
import { Card, CardContent } from "@/shared/components/ui";
import { formatDateTime } from "@/shared/utils";

export function AuditLineCard({ ligne }) {
  return (
    <Card className="border border-slate-100 shadow-premium bg-white rounded-xl">
      <CardContent className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-semibold text-slate-800 text-sm truncate">
              {ligne.auteur}
            </p>
            <p className="text-[11px] text-slate-400 truncate">
              {ligne.matricule}
            </p>
          </div>
          <p className="text-[11px] text-slate-500 shrink-0">
            {formatDateTime(ligne.date)}
          </p>
        </div>

        <p className="text-xs text-slate-700 break-words">{ligne.action}</p>

        {ligne.ip && (
          <p className="text-[10px] text-slate-400">Adresse {ligne.ip}</p>
        )}
      </CardContent>
    </Card>
  );
}

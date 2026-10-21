// src/features/warehouse/components/WarehouseCard.jsx
// Vue mobile d'un entrepot : resume des volumes occupes.
import React from "react";
import { Card, CardContent } from "@/shared/components/ui";
import { FiArchive } from "react-icons/fi";

export function WarehouseCard({ entrepot }) {
  return (
    <Card className="border border-slate-100 shadow-premium bg-white rounded-xl">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-100 text-sky-600 flex items-center justify-center shrink-0">
            <FiArchive size={18} />
          </div>
          <div className="min-w-0">
            <p className="font-bold text-slate-900 text-sm truncate">
              {entrepot.name || "—"}
            </p>
            <p className="text-[11px] text-slate-500 truncate">
              {entrepot.code}
              {entrepot.city ? ` · ${entrepot.city}` : ""}
            </p>
          </div>
        </div>

        <dl className="grid grid-cols-3 gap-2 text-[11px] text-slate-600">
          <div>
            <dt className="text-slate-400">En stock</dt>
            <dd className="font-medium">
              {entrepot.articlesEnStock} art.
            </dd>
          </div>
          <div>
            <dt className="text-slate-400">Tonnage</dt>
            <dd className="font-medium">
              {Number(entrepot.tonnageEnStock).toLocaleString("fr-FR")} t
            </dd>
          </div>
          <div>
            <dt className="text-slate-400">Occupation</dt>
            <dd className="font-medium">
              {entrepot.tauxOccupation === null
                ? "—"
                : `${entrepot.tauxOccupation} %`}
            </dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}

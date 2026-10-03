import React from "react";
import { Badge, Card, CardContent, CardHeader } from "@/shared/components/ui";

const toTons = (kg) =>
  (Number(kg || 0) / 1000).toLocaleString("fr-FR", {
    maximumFractionDigits: 3,
  });

export function PlanOverview({ plan, loads }) {
  const capacityTons = Number(plan.voyage?.vessel?.capacityTons || 0);
  const capacityKg = capacityTons * 1000;
  const isLocked = Boolean(plan.validatedAt);

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <Card>
        <CardHeader title="Poids total" />
        <CardContent>
          <p className="text-3xl font-bold text-slate-900">
            {toTons(plan.totalWeightKg)} t
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader title="Capacité navire" />
        <CardContent>
          <p className="text-3xl font-bold text-slate-900">
            {capacityTons
              ? `${capacityTons.toLocaleString("fr-FR")} t`
              : "Non définie"}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader title="Marchandises" />
        <CardContent>
          <div className="flex items-center justify-between gap-3">
            <p className="text-3xl font-bold text-slate-900">{loads.length}</p>
            <Badge variant={isLocked ? "success" : "warning"}>
              {isLocked ? "Validé" : plan.status ? "Terminé" : "En cours"}
            </Badge>
          </div>
          {capacityKg > 0 && (
            <>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full bg-emerald-600 transition-[width]"
                  style={{
                    width: `${Math.min((Number(plan.totalWeightKg || 0) / capacityKg) * 100, 100)}%`,
                  }}
                />
              </div>
              <p className="mt-2 text-sm text-slate-500">
                Utilisation : {toTons(plan.totalWeightKg)} / {capacityTons.toLocaleString("fr-FR")} t
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

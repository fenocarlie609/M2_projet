// src/features/warehouse/components/StockItemTable.jsx
import React from "react";
import { Table, Button, Badge } from "@/shared/components/ui";
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

export function StockItemTable({
  data,
  isLoading,
  onPickup,
  onEmbark,
}) {
  const { checkPermission } = useAuth();
  const canUpdate = checkPermission("ENTREPOTS", "UPDATE");

  const columns = [
    {
      key: "reference",
      header: "Référence",
      render: (ligne) => (
        <span className="font-semibold text-slate-800">{ligne.reference}</span>
      ),
    },
    {
      key: "description",
      header: "Marchandise",
      render: (ligne) => (
        <div className="flex flex-col">
          <span className="text-slate-700">{ligne.description}</span>
          <span className="text-[10px] text-slate-400">
            {ligne.packageCount} colis — {Number(ligne.weightKg).toLocaleString("fr-FR")} kg
          </span>
        </div>
      ),
    },
    {
      key: "client",
      header: "Client",
      render: (ligne) => ligne.client?.name || "—",
    },
    {
      key: "warehouse",
      header: "Entrepôt",
      render: (ligne) => (
        <span className="text-slate-600">
          {ligne.warehouse?.code} — {ligne.warehouse?.name}
        </span>
      ),
    },
    {
      key: "arrivalDate",
      header: "Entrée",
      render: (ligne) => formatDate(ligne.arrivalDate),
    },
    {
      key: "status",
      header: "Statut",
      render: (ligne) => (
        <Badge variant={VARIANT_STATUT[ligne.status] || "info"}>
          {LIBELLE_STATUT[ligne.status] || ligne.status}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (ligne) => {
        if (!canUpdate || ligne.status !== "IN_STOCK") {
          return <span className="text-xs text-slate-400">—</span>;
        }
        return (
          <div className="flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="sm"
              icon={FiCheckCircle}
              onClick={() => onPickup(ligne)}
            >
              Retrait
            </Button>
            <Button
              variant="ghost"
              size="sm"
              icon={FiTruck}
              onClick={() => onEmbark(ligne)}
            >
              Réembarquer
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <Table
      columns={columns}
      data={data}
      isLoading={isLoading}
      initialRowsPerPage={10}
      emptyMessage="Aucune marchandise en entrepôt"
    />
  );
}

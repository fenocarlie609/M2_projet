import React from "react";
import { FiEdit3, FiPlus, FiTrash2 } from "react-icons/fi";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  Table,
} from "@/shared/components/ui";
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

export function PlanLoadsSection({
  loads,
  operationType,
  isLocked,
  isSaving,
  canCreate,
  canUpdate,
  canDelete,
  subtitle,
  onCreate,
  onEdit,
  onDelete,
}) {
  const isUnload = operationType === "UNLOAD";
  const columns = [
    {
      key: "client",
      header: "Client",
      render: (load) => load.client?.name || "-",
    },
    { key: "description", header: "Marchandise" },
    { key: "packageCount", header: "Colis" },
    {
      key: "weightKg",
      header: "Poids",
      render: (load) => `${Number(load.weightKg).toLocaleString("fr-FR")} kg`,
    },
    {
      key: "driverName",
      header: isUnload ? "Chauffeur déchargement" : "Chauffeur",
      render: (load) => load.driverName || "-",
    },
    {
      key: "vehiclePlate",
      header: isUnload ? "Véhicule déchargement" : "Véhicule",
      render: (load) => load.vehiclePlate || "-",
    },
    {
      key: "loadedBy",
      header: isUnload ? "Déchargeur" : "Chargeur",
      render: formatLoader,
    },
    {
      key: "loadingDate",
      header: isUnload ? "Date de déchargement" : "Date de chargement",
      render: (load) => formatDate(load.loadingDate),
    },
    {
      key: "loadingPosition",
      header: "Position",
      render: (load) => load.loadingPosition || "-",
    },
    {
      key: "anomaly",
      header: "Anomalie",
      render: (load) => load.anomaly || "-",
    },
    {
      key: "isHazardous",
      header: "Dangereux",
      render: (load) =>
        load.isHazardous ? <Badge variant="error">Oui</Badge> : "Non",
    },
    {
      key: "status",
      header: "État",
      render: (load) => (
        <Badge
          variant={
            load.status === "LOADED"
              ? "success"
              : load.status === "CANCELLED"
                ? "error"
                : "warning"
          }
        >
          {statusLabel(load.status, operationType)}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (load) => (
        <div className="flex items-center gap-1.5">
          {!isLocked && canUpdate && (
            <Button
              variant="ghost"
              size="sm"
              icon={FiEdit3}
              title="Modifier"
              aria-label="Modifier"
              onClick={() => onEdit(load)}
            />
          )}
          {!isLocked && canDelete && (
            <Button
              variant="ghost"
              size="sm"
              icon={FiTrash2}
              title="Supprimer"
              aria-label="Supprimer"
              onClick={() => onDelete(load)}
            />
          )}
        </div>
      ),
    },
  ];

  return (
    <Card>
      <CardHeader
        title="Manifeste de marchandises"
        subtitle={subtitle}
      >
        {!isLocked && canCreate && (
          <Button
            variant="primary"
            icon={FiPlus}
            onClick={onCreate}
            disabled={isSaving}
          >
            Ajouter une marchandise
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <Table
          columns={columns}
          data={loads}
          isLoading={isSaving}
          emptyMessage="Aucune marchandise dans ce plan."
        />
      </CardContent>
    </Card>
  );
}

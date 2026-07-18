import React from "react";
import { Table, Button, Badge } from "@/shared/components/ui";
import { FiPlus, FiAnchor, FiTrash2 } from "react-icons/fi";

const mockBoats = [
  {
    id: "B-001",
    name: "Madagascar Express I",
    type: "Cargo",
    status: "En mer",
  },
  {
    id: "B-002",
    name: "Tromelin Trader",
    type: "Porte-conteneurs",
    status: "À quai",
  },
];

// Configuration dynamique des colonnes de ta Table
const columns = [
  {
    header: "Immatriculation",
    key: "id",
    render: (row) => <Badge variant="navy">{row.id}</Badge>,
  },
  { header: "Nom du Navire", key: "name" },
  { header: "Type", key: "type" },
  {
    header: "Statut",
    key: "status",
    render: (row) => (
      <Badge variant={row.status === "En mer" ? "success" : "warning"}>
        {row.status}
      </Badge>
    ),
  },
  {
    header: "Actions",
    render: (row) => (
      <Button
        variant="ghost"
        size="sm"
        icon={FiTrash2}
        onClick={() => alert(`Supprimer ${row.name}`)}
      >
        Supprimer
      </Button>
    ),
  },
];

function SuperAdminPage() {
  // Simulation de données reçues de l'API axiosInstance

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
            Flotte Fluvio-Maritime
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Gérez les navires actifs de Premium Express.
          </p>
        </div>
        <Button variant="primary" icon={FiPlus}>
          Ajouter un Navire
        </Button>
      </div>

      <Table columns={columns} data={mockBoats} isLoading={false} />
    </div>
  );
}

export default SuperAdminPage;

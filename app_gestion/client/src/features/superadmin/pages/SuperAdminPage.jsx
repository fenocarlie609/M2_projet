import React from "react";
import { Table, Button, Badge, PageHeader } from "@/shared/components/ui"; // <-- Importation propre ici
import { FiPlus, FiTrash2 } from "react-icons/fi";

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
  return (
    <div className="space-y-6">
      {/* 🌟 Utilisation de ton nouveau composant d'en-tête de page */}
      <PageHeader
        title="Flotte Fluvio-Maritime"
        subtitle="Gérez les navires actifs de Premium Express."
      >
        {/* Tout ce que tu mets ici se place automatiquement à droite sur grand écran */}
        <Button variant="primary" icon={FiPlus}>
          Ajouter un Navire
        </Button>
      </PageHeader>

      <Table columns={columns} data={mockBoats} isLoading={false} />
    </div>
  );
}

export default SuperAdminPage;

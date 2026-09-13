import React, { useEffect, useMemo, useState } from "react";
import { FiAnchor, FiEdit2, FiPlus, FiTrash2, FiTruck } from "react-icons/fi";
import { MdLocationOn, MdDirectionsBoat } from "react-icons/md";
import {
  Alert,
  Button,
  Input,
  Modal,
  PageHeader,
  Select,
  Table,
  Tabs,
} from "@/shared/components/ui";
import { maritimeService } from "@/features/maritime";

const RESOURCE_CONFIG = {
  vessels: {
    label: "Navires",
    singular: "un navire",
    icon: MdDirectionsBoat,
    empty: "Aucun navire enregistré.",
    fields: [
      { name: "name", label: "Nom du navire", type: "text", required: true },
      { name: "operatorName", label: "Armateur / transporteur", type: "text" },
      { name: "registrationNumber", label: "Immatriculation", type: "text" },
      { name: "capacityTons", label: "Capacité (tonnes)", type: "number" },
      {
        name: "status",
        label: "Statut",
        type: "select",
        options: [
          { value: "ACTIVE", label: "Actif" },
          { value: "INACTIVE", label: "Inactif" },
          { value: "MAINTENANCE", label: "Maintenance" },
        ],
      },
    ],
    columns: [
      { key: "name", header: "Navire" },
      { key: "operatorName", header: "Transporteur" },
      { key: "registrationNumber", header: "Immatriculation" },
      {
        key: "capacityTons",
        header: "Capacité",
        render: (row) => (row.capacityTons ? `${row.capacityTons} t` : "-"),
      },
      { key: "status", header: "Statut" },
    ],
  },
  ports: {
    label: "Ports",
    singular: "un port",
    icon: MdLocationOn,
    empty: "Aucun port enregistré.",
    fields: [
      { name: "code", label: "Code du port", type: "text", required: true },
      { name: "name", label: "Nom du port", type: "text", required: true },
      { name: "country", label: "Pays", type: "text" },
    ],
    columns: [
      { key: "code", header: "Code" },
      { key: "name", header: "Nom du port" },
      { key: "country", header: "Pays" },
    ],
  },
  voyages: {
    label: "Voyages",
    singular: "un voyage",
    icon: FiAnchor,
    empty: "Aucun voyage enregistré.",
    fields: [
      {
        name: "voyageNumber",
        label: "Numéro de voyage",
        type: "text",
        required: true,
      },
      {
        name: "vesselId",
        label: "Navire",
        type: "select",
        source: "vessels",
        required: true,
      },
      {
        name: "departurePortId",
        label: "Port de départ",
        type: "select",
        source: "ports",
        required: true,
      },
      {
        name: "arrivalPortId",
        label: "Port d'arrivée",
        type: "select",
        source: "ports",
        required: true,
      },
      { name: "departureDate", label: "Date de départ", type: "date" },
      { name: "arrivalDate", label: "Date d'arrivée", type: "date" },
      {
        name: "status",
        label: "Statut",
        type: "select",
        options: [
          { value: "DRAFT", label: "Brouillon" },
          { value: "OPEN", label: "Ouvert" },
          { value: "CLOSED", label: "Clôturé" },
        ],
      },
    ],
    columns: [
      { key: "voyageNumber", header: "Voyage" },
      {
        key: "vessel",
        header: "Navire",
        render: (row) => row.vessel?.name || "-",
      },
      {
        key: "departurePort",
        header: "Départ",
        render: (row) => row.departurePort?.name || "-",
      },
      {
        key: "arrivalPort",
        header: "Arrivée",
        render: (row) => row.arrivalPort?.name || "-",
      },
      {
        key: "arrivalDate",
        header: "Arrivée",
        render: (row) => formatDate(row.arrivalDate),
      },
      { key: "status", header: "Statut" },
    ],
  },
  vehicles: {
    label: "Véhicules",
    singular: "un véhicule",
    icon: FiTruck,
    empty: "Aucun véhicule enregistré.",
    fields: [
      {
        name: "licensePlate",
        label: "Immatriculation",
        type: "text",
        required: true,
      },
      { name: "type", label: "Type de véhicule", type: "text" },
      { name: "capacityTons", label: "Capacité (tonnes)", type: "number" },
      {
        name: "status",
        label: "Statut",
        type: "select",
        options: [
          { value: "ACTIVE", label: "Actif" },
          { value: "INACTIVE", label: "Inactif" },
          { value: "MAINTENANCE", label: "Maintenance" },
        ],
      },
    ],
    columns: [
      { key: "licensePlate", header: "Immatriculation" },
      { key: "type", header: "Type" },
      {
        key: "capacityTons",
        header: "Capacité",
        render: (row) => (row.capacityTons ? `${row.capacityTons} t` : "-"),
      },
      { key: "status", header: "Statut" },
    ],
  },
};

const TABS = Object.entries(RESOURCE_CONFIG).map(([key, config]) => ({
  id: key,
  label: config.label,
  icon: config.icon,
}));

function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("fr-FR");
}

function emptyForm(fields) {
  return fields.reduce(
    (data, field) => ({
      ...data,
      [field.name]:
        field.type === "select" && field.options ? field.options[0].value : "",
    }),
    {},
  );
}

function MaritimeForm({
  resource,
  item,
  lists,
  onSubmit,
  onClose,
  isSaving,
  error,
}) {
  const config = RESOURCE_CONFIG[resource];
  const [formData, setFormData] = useState(
    () => item || emptyForm(config.fields),
  );

  useEffect(() => {
    setFormData(item || emptyForm(config.fields));
  }, [item, resource]);

  const updateField = (name, value) =>
    setFormData((current) => ({ ...current, [name]: value }));

  const submit = (event) => {
    event.preventDefault();
    const payload = { ...formData };
    ["capacityTons"].forEach((field) => {
      if (payload[field] === "") payload[field] = null;
      else if (payload[field] !== null && payload[field] !== undefined)
        payload[field] = Number(payload[field]);
    });
    ["departureDate", "arrivalDate"].forEach((field) => {
      if (payload[field] === "") payload[field] = null;
    });
    onSubmit(payload);
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      {error && (
        <Alert variant="error" title="Enregistrement impossible">
          {error}
        </Alert>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {config.fields.map((field) => {
          if (field.type === "select") {
            const options = field.source
              ? (lists[field.source] || []).map((option) => ({
                  value: option.id,
                  label: option.name || option.code || option.licensePlate,
                }))
              : field.options;
            return (
              <Select
                key={field.name}
                label={field.label}
                value={formData[field.name] || ""}
                onChange={(event) =>
                  updateField(field.name, event.target.value)
                }
                options={options}
                required={field.required}
              />
            );
          }
          return (
            <Input
              key={field.name}
              label={field.label}
              type={field.type}
              value={formData[field.name] ?? ""}
              onChange={(event) => updateField(field.name, event.target.value)}
              required={field.required}
              min={field.type === "number" ? "0.01" : undefined}
              step={field.type === "number" ? "0.01" : undefined}
            />
          );
        })}
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onClose}>
          Annuler
        </Button>
        <Button type="submit" variant="primary" disabled={isSaving}>
          {isSaving ? "Enregistrement..." : item ? "Mettre à jour" : "Créer"}
        </Button>
      </div>
    </form>
  );
}

function MaritimePage() {
  const [activeResource, setActiveResource] = useState("vessels");
  const [data, setData] = useState({
    vessels: [],
    ports: [],
    voyages: [],
    vehicles: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [modalState, setModalState] = useState({ open: false, item: null });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const config = RESOURCE_CONFIG[activeResource];
  const activeItems = data[activeResource];

  const lists = useMemo(
    () => ({ vessels: data.vessels, ports: data.ports }),
    [data.vessels, data.ports],
  );

  const fetchResource = async (resource = activeResource) => {
    setIsLoading(true);
    try {
      const items = await maritimeService.getAll(resource);
      setData((current) => ({ ...current, [resource]: items }));
      setError("");
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          `Impossible de charger ${RESOURCE_CONFIG[resource].label.toLowerCase()}.`,
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResource(activeResource);
  }, [activeResource]);

  useEffect(() => {
    Promise.all([
      maritimeService.getAll("vessels"),
      maritimeService.getAll("ports"),
    ])
      .then(([vessels, ports]) =>
        setData((current) => ({ ...current, vessels, ports })),
      )
      .catch(() => {});
  }, []);

  const handleSubmit = async (formData) => {
    setIsSaving(true);
    try {
      const response = modalState.item
        ? await maritimeService.update(
            activeResource,
            modalState.item.id,
            formData,
          )
        : await maritimeService.create(activeResource, formData);
      const savedItem = response?.data?.[activeResource.slice(0, -1)];
      setData((current) => ({
        ...current,
        [activeResource]: modalState.item
          ? current[activeResource].map((item) =>
              item.id === savedItem.id ? savedItem : item,
            )
          : [savedItem, ...current[activeResource]],
      }));
      setModalState({ open: false, item: null });
      setError("");
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "La sauvegarde a échoué.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (item) => {
    if (
      !window.confirm(
        `Supprimer ${item.name || item.voyageNumber || item.licensePlate || "cet élément"} ?`,
      )
    )
      return;
    try {
      await maritimeService.remove(activeResource, item.id);
      setData((current) => ({
        ...current,
        [activeResource]: current[activeResource].filter(
          (entry) => entry.id !== item.id,
        ),
      }));
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "La suppression a échoué.",
      );
    }
  };

  const columns = [
    ...config.columns,
    {
      key: "actions",
      header: "Actions",
      render: (item) => (
        <div className="flex items-center gap-2">
          <button
            type="button"
            title="Modifier"
            className="p-2 text-slate-500 hover:text-brand-primary"
            onClick={() => setModalState({ open: true, item })}
          >
            <FiEdit2 size={15} />
          </button>
          <button
            type="button"
            title="Supprimer"
            className="p-2 text-slate-500 hover:text-red-600"
            onClick={() => handleDelete(item)}
          >
            <FiTrash2 size={15} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Référentiel maritime"
        subtitle="Préparez les navires, ports, voyages et véhicules du futur plan de chargement."
      >
        <Button
          variant="primary"
          icon={FiPlus}
          onClick={() => {
            setError("");
            setModalState({ open: true, item: null });
          }}
        >
          Ajouter {config.singular}
        </Button>
      </PageHeader>

      <div className="flex flex-wrap gap-2 p-1 bg-slate-100 rounded-xl w-fit">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeResource === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveResource(tab.id)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${isActive ? "bg-white text-brand-primary shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {error && !modalState.open && (
        <Alert variant="error" title="Erreur">
          {error}
        </Alert>
      )}
      <Table
        columns={columns}
        data={activeItems}
        isLoading={isLoading}
        emptyMessage={config.empty}
      />

      <Modal
        isOpen={modalState.open}
        onClose={() => setModalState({ open: false, item: null })}
        title={`${modalState.item ? "Modifier" : "Ajouter"} ${config.singular}`}
        maxWidth="max-w-2xl"
      >
        <MaritimeForm
          resource={activeResource}
          item={modalState.item}
          lists={lists}
          onSubmit={handleSubmit}
          onClose={() => setModalState({ open: false, item: null })}
          isSaving={isSaving}
          error={error}
        />
      </Modal>
    </div>
  );
}

export default MaritimePage;

// src/features/warehouse/pages/WarehousePage.jsx
// Entreposage : marchandises dechargees d'un navire, conservees en entrepot
// dans l'attente de leur retrait par le client ou de leur reembarquement sur
// un prochain voyage.
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  PageHeader,
  Button,
  Card,
  CardHeader,
  CardContent,
  Table,
  Tabs,
  Badge,
  Modal,
  StatsCard,
  Alert,
  Select,
} from "@/shared/components/ui";
import { FiPlus, FiPackage, FiArchive, FiRefreshCw } from "react-icons/fi";
import { useAuth } from "@/features/auth";
import { formatDateTime } from "@/shared/utils";
import { socket } from "@/shared/services/";
import { showToast } from "@/shared/utils/toast";
import { warehouseService } from "@/features/warehouse/service/warehouse.service";
import { WarehouseForm } from "@/features/warehouse/components/WarehouseForm";
import { StockItemForm } from "@/features/warehouse/components/StockItemForm";
import { StockItemTable } from "@/features/warehouse/components/StockItemTable";
import { StockItemCard } from "@/features/warehouse/components/StockItemCard";
import { MovementCard } from "@/features/warehouse/components/MovementCard";
import { WarehouseCard } from "@/features/warehouse/components/WarehouseCard";
import { clientService } from "@/features/client";
import { loadingPlanService } from "@/features/plans";

const TYPE_MOUVEMENT = {
  ENTRY: "Entrée",
  PICKUP: "Retrait client",
  RE_EMBARKMENT: "Réembarquement",
};

const STATUTS = [
  { value: "", label: "Tous les statuts" },
  { value: "IN_STOCK", label: "En stock" },
  { value: "EMBARKED", label: "Réembarqué" },
  { value: "PICKED_UP", label: "Retiré" },
];

function WarehousePage() {
  const { checkPermission } = useAuth();
  const canCreate = checkPermission("ENTREPOTS", "CREATE");
  const canUpdate = checkPermission("ENTREPOTS", "UPDATE");

  const [onglet, setOnglet] = useState("stock");
  const [entrepots, setEntrepots] = useState([]);
  const [articles, setArticles] = useState([]);
  const [mouvements, setMouvements] = useState([]);
  const [disponibles, setDisponibles] = useState([]);
  const [clients, setClients] = useState([]);
  const [plans, setPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [erreur, setErreur] = useState(null);

  const [filtreEntrepot, setFiltreEntrepot] = useState("");
  const [filtreClient, setFiltreClient] = useState("");
  const [filtreStatut, setFiltreStatut] = useState("");

  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [isWarehouseModalOpen, setIsWarehouseModalOpen] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [embarkTarget, setEmbarkTarget] = useState(null);
  const [embarkPlanId, setEmbarkPlanId] = useState("");

  const charger = useCallback(async () => {
    setIsLoading(true);
    setErreur(null);
    try {
      const [reponseEntrepots, reponseArticles, reponseMouvements, reponseDispo] =
        await Promise.all([
          warehouseService.getWarehouses(),
          warehouseService.getItems(),
          warehouseService.getMovements(),
          warehouseService.getAvailableItems(),
        ]);

      setEntrepots(reponseEntrepots.data?.warehouses || []);
      setArticles(reponseArticles.data?.items || []);
      setMouvements(reponseMouvements.data?.mouvements || []);
      setDisponibles(reponseDispo.data?.items || []);
    } catch (requestError) {
      setErreur(
        requestError?.response?.data?.message ||
          "Impossible de charger les données de l'entrepôt.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    charger();
  }, [charger]);

  // Temps reel : le stock est recharge lorsqu'un autre utilisateur enregistre
  // une entree, un retrait ou un reembarquement.
  useEffect(() => {
    const onWarehouseChanged = () => charger();

    socket.on("warehouse:changed", onWarehouseChanged);
    return () => {
      socket.off("warehouse:changed", onWarehouseChanged);
    };
  }, [charger]);

  useEffect(() => {
    const chargerReferences = async () => {
      try {
        const [reponseClients, reponsePlans] = await Promise.all([
          clientService.getClients(),
          loadingPlanService.getPlans(),
        ]);
        setClients(reponseClients.data?.clients || reponseClients.data || []);
        // Le service des plans renvoie directement le tableau des plans.
        setPlans(Array.isArray(reponsePlans) ? reponsePlans : []);
      } catch (error) {
        // Les listes de reference ne sont pas bloquantes pour l'affichage.
      }
    };
    chargerReferences();
  }, []);

  // Filtres appliques cote client, sans rechargement de la page.
  const articlesFiltres = useMemo(() => {
    return articles.filter((article) => {
      if (filtreEntrepot && article.warehouseId !== filtreEntrepot) {
        return false;
      }
      if (filtreClient && article.clientId !== filtreClient) return false;
      if (filtreStatut && article.status !== filtreStatut) return false;
      return true;
    });
  }, [articles, filtreEntrepot, filtreClient, filtreStatut]);

  const totalTonnage = entrepots.reduce(
    (total, entrepot) => total + (entrepot.tonnageEnStock || 0),
    0,
  );
  const totalArticles = entrepots.reduce(
    (total, entrepot) => total + (entrepot.articlesEnStock || 0),
    0,
  );

  const enregistrerEntree = async (donnees) => {
    setIsSubmitting(true);
    try {
      await warehouseService.createItem(donnees);
      showToast.success("Marchandise enregistrée en entrepôt.");
      setIsItemModalOpen(false);
      await charger();
    } catch (error) {
      showToast.error(
        error?.response?.data?.message || "L'entrée en entrepôt a échoué.",
      );
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const enregistrerEntrepot = async (donnees) => {
    setIsSubmitting(true);
    try {
      if (selectedWarehouse) {
        await warehouseService.updateWarehouse(selectedWarehouse.id, donnees);
        showToast.success("Entrepôt modifié.");
      } else {
        await warehouseService.createWarehouse(donnees);
        showToast.success("Entrepôt créé.");
      }
      setIsWarehouseModalOpen(false);
      setSelectedWarehouse(null);
      await charger();
    } catch (error) {
      showToast.error(
        error?.response?.data?.message || "L'enregistrement a échoué.",
      );
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const enregistrerRetrait = async (article) => {
    try {
      await warehouseService.pickupItem(article.id, {
        note: "Retrait par le client",
      });
      showToast.success("Retrait enregistré.");
      await charger();
    } catch (error) {
      showToast.error(
        error?.response?.data?.message || "Le retrait a échoué.",
      );
    }
  };

  const enregistrerReembarquement = async () => {
    if (!embarkTarget || !embarkPlanId) return;
    setIsSubmitting(true);
    try {
      await warehouseService.embarkItem(embarkTarget.id, {
        loadingPlanId: embarkPlanId,
      });
      showToast.success("Réembarquement enregistré.");
      setEmbarkTarget(null);
      setEmbarkPlanId("");
      await charger();
    } catch (error) {
      showToast.error(
        error?.response?.data?.message || "Le réembarquement a échoué.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const colonnesEntrepots = [
    { key: "code", header: "Code" },
    { key: "name", header: "Nom" },
    {
      key: "city",
      header: "Ville",
      render: (ligne) => ligne.city || "—",
    },
    {
      key: "articlesEnStock",
      header: "En stock",
      render: (ligne) => `${ligne.articlesEnStock} art.`,
    },
    {
      key: "tonnageEnStock",
      header: "Tonnage",
      render: (ligne) =>
        `${Number(ligne.tonnageEnStock).toLocaleString("fr-FR")} t`,
    },
    {
      key: "tauxOccupation",
      header: "Occupation",
      render: (ligne) =>
        ligne.tauxOccupation === null ? "—" : `${ligne.tauxOccupation} %`,
    },
  ];

  const colonnesMouvements = [
    {
      key: "createdAt",
      header: "Date",
      render: (ligne) => formatDateTime(ligne.createdAt),
    },
    {
      key: "type",
      header: "Mouvement",
      render: (ligne) => (
        <Badge
          variant={
            ligne.type === "ENTRY"
              ? "info"
              : ligne.type === "PICKUP"
                ? "success"
                : "warning"
          }
        >
          {TYPE_MOUVEMENT[ligne.type] || ligne.type}
        </Badge>
      ),
    },
    {
      key: "item",
      header: "Marchandise",
      render: (ligne) => (
        <div className="flex flex-col">
          <span className="font-medium text-slate-700">
            {ligne.item?.description || "—"}
          </span>
          <span className="text-[10px] text-slate-400">
            {ligne.item?.reference}
          </span>
        </div>
      ),
    },
    {
      key: "warehouse",
      header: "Entrepôt",
      render: (ligne) => ligne.warehouse?.code || "—",
    },
    {
      key: "employee",
      header: "Agent",
      render: (ligne) => ligne.employee?.name || "Système",
    },
  ];

  const optionsEntrepots = [
    { value: "", label: "Tous les entrepôts" },
    ...entrepots.map((entrepot) => ({
      value: entrepot.id,
      label: `${entrepot.code} — ${entrepot.name}`,
    })),
  ];

  const optionsClients = [
    { value: "", label: "Tous les clients" },
    ...clients.map((client) => ({ value: client.id, label: client.name })),
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Entrepôt"
        subtitle="Marchandises déchargées, en attente de retrait par le client ou de réembarquement."
      >
        <Button
          variant="ghost"
          icon={FiRefreshCw}
          onClick={charger}
          disabled={isLoading}
        >
          Actualiser
        </Button>
        {canCreate && (
          <Button
            variant="primary"
            icon={FiPlus}
            onClick={() => {
              setSelectedWarehouse(null);
              setIsItemModalOpen(true);
            }}
          >
            Enregistrer une entrée
          </Button>
        )}
      </PageHeader>

      {erreur && (
        <Alert variant="error" title="Chargement impossible">
          {erreur}
        </Alert>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard
          title="Entrepôts"
          value={entrepots.length}
          subtext="Sites de stockage"
          icon={FiArchive}
          variant="brand"
        />
        <StatsCard
          title="Marchandises en stock"
          value={totalArticles}
          subtext="En attente de sortie"
          icon={FiPackage}
        />
        <StatsCard
          title="Tonnage stocké"
          value={`${Number(totalTonnage).toLocaleString("fr-FR")} t`}
          subtext="Cumul des entrepôts"
          icon={FiPackage}
        />
      </div>

      <Card>
        <CardHeader
          title="Entrepôt"
          subtitle="Mouvements et marchandises conservées"
        />
        <CardContent className="space-y-5">
          <Tabs
            activeTab={onglet}
            onChange={setOnglet}
            tabs={[
              { id: "stock", label: "Marchandises en stock" },
              { id: "entrepots", label: "Entrepôts" },
              { id: "mouvements", label: "Mouvements" },
            ]}
          />

          {onglet === "stock" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Select
                  id="filtre-entrepot"
                  value={filtreEntrepot}
                  onChange={(e) => setFiltreEntrepot(e.target.value)}
                  options={optionsEntrepots}
                />
                <Select
                  id="filtre-client"
                  value={filtreClient}
                  onChange={(e) => setFiltreClient(e.target.value)}
                  options={optionsClients}
                />
                <Select
                  id="filtre-statut"
                  value={filtreStatut}
                  onChange={(e) => setFiltreStatut(e.target.value)}
                  options={STATUTS}
                />
              </div>

              <div className="hidden md:block">
                <StockItemTable
                  data={articlesFiltres}
                  isLoading={isLoading}
                  onPickup={enregistrerRetrait}
                  onEmbark={(article) => {
                    setEmbarkTarget(article);
                    setEmbarkPlanId("");
                  }}
                />
              </div>

              <div className="grid md:hidden gap-3">
                {articlesFiltres.length === 0 && !isLoading && (
                  <p className="text-xs sm:text-sm text-slate-400 font-medium">
                    Aucune marchandise en entrepôt.
                  </p>
                )}
                {articlesFiltres.map((article) => (
                  <StockItemCard
                    key={article.id}
                    item={article}
                    onPickup={enregistrerRetrait}
                    onEmbark={(element) => {
                      setEmbarkTarget(element);
                      setEmbarkPlanId("");
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {onglet === "entrepots" && (
            <div className="space-y-3">
              {canCreate && (
                <Button
                  variant="secondary"
                  icon={FiPlus}
                  onClick={() => {
                    setSelectedWarehouse(null);
                    setIsWarehouseModalOpen(true);
                  }}
                >
                  Ajouter un entrepôt
                </Button>
              )}
              <div className="hidden md:block">
                <Table
                  columns={colonnesEntrepots}
                  data={entrepots}
                  isLoading={isLoading}
                  emptyMessage="Aucun entrepôt"
                />
              </div>

              <div className="grid md:hidden gap-3">
                {isLoading && (
                  <p className="text-sm text-slate-400 font-medium">
                    Chargement...
                  </p>
                )}
                {!isLoading && entrepots.length === 0 && (
                  <p className="text-sm text-slate-400 font-medium">
                    Aucun entrepôt.
                  </p>
                )}
                {entrepots.map((entrepot) => (
                  <WarehouseCard key={entrepot.id} entrepot={entrepot} />
                ))}
              </div>
            </div>
          )}

          {onglet === "mouvements" && (
            <>
              <div className="hidden md:block">
                <Table
                  columns={colonnesMouvements}
                  data={mouvements}
                  isLoading={isLoading}
                  initialRowsPerPage={10}
                  emptyMessage="Aucun mouvement enregistré"
                />
              </div>

              <div className="grid md:hidden gap-3">
                {isLoading && (
                  <p className="text-sm text-slate-400 font-medium">
                    Chargement...
                  </p>
                )}
                {!isLoading && mouvements.length === 0 && (
                  <p className="text-sm text-slate-400 font-medium">
                    Aucun mouvement enregistré.
                  </p>
                )}
                {mouvements.map((mouvement) => (
                  <MovementCard key={mouvement.id} mouvement={mouvement} />
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Modal
        isOpen={isItemModalOpen}
        onClose={() => setIsItemModalOpen(false)}
        title="Enregistrer une entrée en entrepôt"
        maxWidth="max-w-2xl"
      >
        <StockItemForm
          warehouses={entrepots}
          clients={clients}
          availableItems={disponibles}
          onSubmit={enregistrerEntree}
          onCancel={() => setIsItemModalOpen(false)}
          isSubmitting={isSubmitting}
        />
      </Modal>

      <Modal
        isOpen={isWarehouseModalOpen}
        onClose={() => setIsWarehouseModalOpen(false)}
        title={
          selectedWarehouse
            ? `Modifier l'entrepôt : ${selectedWarehouse.name}`
            : "Ajouter un entrepôt"
        }
      >
        <WarehouseForm
          selectedWarehouse={selectedWarehouse}
          onSubmit={enregistrerEntrepot}
          onCancel={() => setIsWarehouseModalOpen(false)}
          isSubmitting={isSubmitting}
        />
      </Modal>

      <Modal
        isOpen={Boolean(embarkTarget)}
        onClose={() => setEmbarkTarget(null)}
        title="Réembarquer la marchandise"
      >
        <div className="space-y-4">
          <p className="text-xs sm:text-sm text-slate-600">
            {embarkTarget?.description} — {embarkTarget?.packageCount} colis,{" "}
            {Number(embarkTarget?.weightKg || 0).toLocaleString("fr-FR")} kg. La
            marchandise quittera l'entrepôt et sera rattachée au plan de
            chargement choisi.
          </p>

          <Select
            id="embark-plan"
            label="Plan de chargement"
            value={embarkPlanId}
            onChange={(e) => setEmbarkPlanId(e.target.value)}
            options={[
              { value: "", label: "Choisir un plan de chargement" },
              ...plans
                .filter((plan) => plan.operationType === "LOAD" && !plan.status)
                .map((plan) => ({
                  value: plan.id,
                  label: `${plan.reference} — ${Number(
                    plan.totalWeightKg,
                  ).toLocaleString("fr-FR")} kg`,
                })),
            ]}
          />

          <div className="flex justify-end gap-2">
            <Button
              variant="secondary"
              onClick={() => setEmbarkTarget(null)}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button
              variant="primary"
              onClick={enregistrerReembarquement}
              isLoading={isSubmitting}
              disabled={!embarkPlanId}
            >
              Réembarquer
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default WarehousePage;

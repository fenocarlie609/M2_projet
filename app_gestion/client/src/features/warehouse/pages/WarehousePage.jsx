// src/features/warehouse/pages/WarehousePage.jsx
// Entreposage : marchandises dechargees d'un navire, conservees en entrepot
// dans l'attente de leur retrait par le client ou de leur reembarquement sur
// un prochain voyage.
import React, { useCallback, useEffect, useState } from "react";
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
import { clientService } from "@/features/client";
import { loadingPlanService } from "@/features/plans";

const TYPE_MOUVEMENT = {
  ENTRY: "Entrée",
  PICKUP: "Retrait client",
  RE_EMBARKMENT: "Réembarquement",
};

function WarehousePage() {
  const { checkPermission } = useAuth();
  const canCreate = checkPermission("ENTREPOTS", "CREATE");
  const canUpdate = checkPermission("ENTREPOTS", "UPDATE");

  const [onglet, setOnglet] = useState("stock");
  const [entrepots, setEntrepots] = useState([]);
  const [articles, setArticles] = useState([]);
  const [mouvements, setMouvements] = useState([]);
  const [clients, setClients] = useState([]);
  const [plans, setPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [erreur, setErreur] = useState(null);

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
      const [reponseEntrepots, reponseArticles, reponseMouvements] =
        await Promise.all([
          warehouseService.getWarehouses(),
          warehouseService.getItems(),
          warehouseService.getMovements(),
        ]);

      setEntrepots(reponseEntrepots.data?.warehouses || []);
      setArticles(reponseArticles.data?.items || []);
      setMouvements(reponseMouvements.data?.mouvements || []);
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
        const donnees = reponsePlans.data;
        setPlans(
          Array.isArray(donnees)
            ? donnees
            : donnees?.plans || donnees?.loadingPlans || [],
        );
      } catch (error) {
        // Les listes de reference ne sont pas bloquantes pour l'affichage.
      }
    };
    chargerReferences();
  }, []);

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
        error?.response?.data?.message ||
          "L'entrée en entrepôt a échoué.",
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
      render: (ligne) => `${Number(ligne.tonnageEnStock).toLocaleString("fr-FR")} t`,
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Entreposage"
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
            <StockItemTable
              data={articles}
              isLoading={isLoading}
              onPickup={enregistrerRetrait}
              onEmbark={(article) => {
                setEmbarkTarget(article);
                setEmbarkPlanId("");
              }}
            />
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
              <Table
                columns={colonnesEntrepots}
                data={entrepots}
                isLoading={isLoading}
                emptyMessage="Aucun entrepôt"
              />
            </div>
          )}

          {onglet === "mouvements" && (
            <Table
              columns={colonnesMouvements}
              data={mouvements}
              isLoading={isLoading}
              initialRowsPerPage={10}
              emptyMessage="Aucun mouvement enregistré"
            />
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
            {Number(embarkTarget?.weightKg || 0).toLocaleString("fr-FR")} kg.
            La marchandise quittera l'entrepôt et sera rattachée au plan de
            chargement choisi.
          </p>

          <select
            value={embarkPlanId}
            onChange={(e) => setEmbarkPlanId(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
          >
            <option value="">Choisir un plan de chargement</option>
            {plans
              .filter(
                (plan) => plan.operationType === "LOAD" && !plan.status,
              )
              .map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.reference} — {Number(plan.totalWeightKg).toLocaleString("fr-FR")} kg
                </option>
              ))}
          </select>

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

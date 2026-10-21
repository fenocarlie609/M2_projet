// src/features/dashboard/pages/DashboardPage.jsx
// Tableau de bord du back-office.
//
// Le serveur renvoie uniquement les blocs accessibles à l'utilisateur
// connecte : un agent de quai ne recoit aucun indicateur d'audit, un
// developpeur aucun indicateur d'exploitation au quai, un charge de
// clientele aucun effectif. La page ne fait donc que composer ce qu'elle
// recoit.
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  PageHeader,
  StatsCard,
  Card,
  CardHeader,
  CardContent,
  Table,
  Tabs,
  Badge,
  Alert,
  Button,
} from "@/shared/components/ui";
import { formatDate, formatDateTime } from "@/shared/utils";
import { dashboardService } from "@/features/dashboard/service/dashboard.service";
import { useAuth } from "@/features/auth";
import {
  FiPackage,
  FiTruck,
  FiAlertTriangle,
  FiUsers,
  FiClipboard,
  FiActivity,
  FiAnchor,
  FiFileText,
  FiRefreshCw,
  FiCheckCircle,
  FiClock,
} from "react-icons/fi";

const VARIANT_STATUT = {
  SCHEDULED: "info",
  IN_TRANSIT: "warning",
  ARRIVED: "success",
  CANCELLED: "error",
  PENDING: "warning",
  LOADED: "success",
};

const libelleStatut = (statut) =>
  ({
    SCHEDULED: "Planifié",
    IN_TRANSIT: "En transit",
    ARRIVED: "Arrivé",
    CANCELLED: "Annulé",
  })[statut] || statut;

/**
 * Barre horizontale de repartition, dessinee sans bibliotheque de
 * graphiques.
 */
const Barre = ({ libelle, valeur, maximum, unite = "" }) => {
  const taux = maximum > 0 ? Math.min((valeur / maximum) * 100, 100) : 0;

  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-xs font-medium text-slate-700 truncate">
          {libelle}
        </span>
        <span className="text-xs font-bold text-slate-900 shrink-0">
          {valeur}
          {unite}
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
        <div
          className="h-full rounded-full bg-brand-primary transition-all duration-500"
          style={{ width: `${taux}%` }}
        />
      </div>
    </div>
  );
};

/**
 * Taux de remplissage d'un plan, compare a la capacite du navire.
 */
const TauxRemplissage = ({ remplissage }) => {
  if (!remplissage || remplissage.length === 0) return null;

  return (
    <div className="space-y-3">
      {remplissage.map((ligne) => (
        <div key={ligne.reference} className="space-y-1.5">
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-xs font-medium text-slate-700 truncate">
              {ligne.reference} — {ligne.navire}
            </span>
            <span
              className={`text-xs font-bold shrink-0 ${
                ligne.taux >= 90 ? "text-rose-600" : "text-slate-900"
              }`}
            >
              {ligne.taux} %
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                ligne.taux >= 90 ? "bg-rose-500" : "bg-brand-primary"
              }`}
              style={{ width: `${ligne.taux}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-400">
            {(ligne.poidsKg / 1000).toFixed(1)} t sur {ligne.capaciteTons} t
          </p>
        </div>
      ))}
    </div>
  );
};

function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [resume, setResume] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [erreur, setErreur] = useState(null);
  const [onglet, setOnglet] = useState("plans");

  const charger = async () => {
    setIsLoading(true);
    setErreur(null);
    try {
      const reponse = await dashboardService.getSummary();
      setResume(reponse.data?.data || {});
    } catch (erreurBloc) {
      setErreur(erreurBloc.message || "Erreur lors du chargement du tableau de bord.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    charger();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // LesTraitements a engager, deduits des blocs recus.
  const traitements = useMemo(() => {
    const liste = [];

    if (resume?.plans) {
      if (resume.plans.aPeser > 0) {
        liste.push({
          icone: FiAlertTriangle,
          titre: `${resume.plans.aPeser} marchandise(s) à peser`,
          detail:
            "Le poids de ces marchandises reste à confirmer avant leur embarquement.",
          action: "Ouvrir les plans",
          onClick: () => navigate("/plans"),
        });
      }
      if (resume.plans.actifs > 0) {
        liste.push({
          icone: FiClipboard,
          titre: `${resume.plans.actifs} plan(s) de chargement à valider`,
          detail:
            "La validation génère automatiquement le plan de déchargement correspondant.",
          action: "Ouvrir les plans",
          onClick: () => navigate("/plans"),
        });
      }
      const presquePlein = (resume.plans.remplissage || []).filter(
        (ligne) => ligne.taux >= 90,
      );
      if (presquePlein.length > 0) {
        liste.push({
          icone: FiTruck,
          titre: `${presquePlein.length} navire(s) proche(s) de la capacite`,
          detail: presquePlein
            .map((ligne) => `${ligne.reference} (${ligne.taux} %)`)
            .join(", "),
          action: "Voir les plans",
          onClick: () => navigate("/plans"),
        });
      }
    }

    if (resume?.acces && resume.acces.demandes > 0) {
      liste.push({
        icone: FiUsers,
        titre: `${resume.acces.demandes} demande(s) d'accès en attente`,
        detail:
          "Des employés attendent l'ouverture de leur compte ou l'octroi de droits.",
        action: "Traiter les accès",
        onClick: () => navigate("/users"),
      });
    }

    if (resume?.stock && resume.stock.articles > 0) {
      liste.push({
        icone: FiPackage,
        titre: `${resume.stock.articles} marchandise(s) en entrepôt`,
        detail:
          "Marchandises déchargées, en attente de retrait par le client ou de réembarquement sur un prochain voyage.",
        action: "Ouvrir l'entrepôt",
        onClick: () => navigate("/warehouse"),
      });
    }

    if (resume?.voyages && resume.voyages.prochains?.length > 0) {
      liste.push({
        icone: FiAnchor,
        titre: `${resume.voyages.prochains.length} voyage(s) a upcoming`,
        detail: resume.voyages.prochains
          .map(
            (voyage) =>
              `${voyage.numero} — ${voyage.navire} (${formatDate(
                voyage.depart,
              )})`,
          )
          .join(" · "),
        action: "Ouvrir les voyages",
        onClick: () => navigate("/voyages"),
      });
    }

    return liste;
  }, [resume, navigate]);

  const aDesBlocs =
    resume &&
    ["plans", "clients", "voyages", "acces", "employes", "audit"].some(
      (cle) => resume[cle],
    );

  const dateDuJour = new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date());

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tableau de bord"
        subtitle={`${dateDuJour} — ${user?.position?.label || "Employé connecté"}`}
      >
        <Button
          variant="ghost"
          icon={FiRefreshCw}
          onClick={charger}
          disabled={isLoading}
        >
          Actualiser
        </Button>
      </PageHeader>

      {erreur && (
        <Alert variant="error" title="Chargement impossible">
          {erreur}
        </Alert>
      )}

      {/* INDICATEURS DE PILOTAGE */}
      {resume?.plans && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatsCard
            title="Plans actifs"
            value={resume.plans.actifs}
            subtext={`${resume.plans.total} plan(s) au total`}
            icon={FiPackage}
            variant="brand"
          />
          <StatsCard
            title="Tonnage embarqué"
            value={`${resume.plans.tonnageEmbarque} t`}
            subtext="Marchandises chargées"
            icon={FiTruck}
          />
          <StatsCard
            title="À peser"
            value={resume.plans.aPeser}
            subtext="Poids à confirmer"
            icon={FiAlertTriangle}
          />
          <StatsCard
            title="Lignes de marchandises"
            value={
              (resume.plans.statutsLignes?.LOADED || 0) +
              (resume.plans.statutsLignes?.PENDING || 0) +
              (resume.plans.statutsLignes?.CANCELLED || 0)
            }
            subtext={`${resume.plans.statutsLignes?.LOADED || 0} chargées, ${
              resume.plans.statutsLignes?.PENDING || 0
            } en attente`}
            icon={FiActivity}
          />
        </div>
      )}

      {resume?.clients && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatsCard
            title="Clients actifs"
            value={resume.clients.actifs}
            subtext="Référentiel commercial"
            icon={FiUsers}
          />
          <StatsCard
            title="Nouveaux clients"
            value={resume.clients.nouveaux}
            subtext="Sur les trente derniers jours"
            icon={FiCheckCircle}
            variant="brand"
          />
          <StatsCard
            title="Clients au total"
            value={resume.clients.total}
            subtext="Référentiel commercial"
            icon={FiUsers}
          />
          {resume.voyages && (
            <StatsCard
              title="Voyages"
              value={resume.voyages.total}
              subtext={`${resume.voyages.parStatut?.IN_TRANSIT || 0} en transit, ${
                resume.voyages.parStatut?.SCHEDULED || 0
              } planifies`}
              icon={FiAnchor}
            />
          )}
        </div>
      )}

      {resume?.employes && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatsCard
            title="Employés"
            value={resume.employes.actifs}
            subtext={`${resume.employes.total} fiches au total`}
            icon={FiUsers}
            variant="brand"
          />
          <StatsCard
            title="Sans accès"
            value={resume.employes.sansAcces}
            subtext="Demandes en attente"
            icon={FiAlertTriangle}
          />
        </div>
      )}

      {resume?.stock && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatsCard
            title="Marchandises en entrepôt"
            value={resume.stock.articles}
            subtext={`${resume.stock.colis} colis`}
            icon={FiPackage}
            variant="brand"
          />
          <StatsCard
            title="Tonnage stocké"
            value={`${resume.stock.tonnage} t`}
            subtext="En attente de sortie"
            icon={FiTruck}
          />
          <StatsCard
            title="Ancienneté du stock"
            value={
              resume.stock.plusAnciens?.length
                ? formatDate(resume.stock.plusAnciens[0].arrivalDate)
                : "—"
            }
            subtext="Marchandise entrée la plus ancienne"
            icon={FiClock}
          />
        </div>
      )}

      {/* A TRAITER ET ACTIVITE RECENTE */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <Card>
          <CardHeader
            title="À traiter"
            subtitle="Les opérations qui attendent une décision"
          />
          <CardContent className="space-y-3">
            {traitements.length === 0 ? (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-medium">
                <FiCheckCircle size={18} className="shrink-0" />
                <span>Aucune opération en attente pour votre profil.</span>
              </div>
            ) : (
              traitements.map((traitement) => {
                const Icone = traitement.icone;
                return (
                  <div
                    key={traitement.titre}
                    className="flex items-start gap-3 p-4 rounded-xl border border-slate-200/70 bg-slate-50/50"
                  >
                    <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 border border-amber-200/70 flex items-center justify-center shrink-0">
                      <Icone size={16} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-bold text-slate-900">
                        {traitement.titre}
                      </p>
                      <p className="text-[11px] sm:text-xs text-slate-500 mt-1 break-words">
                        {traitement.detail}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="shrink-0"
                      onClick={traitement.onClick}
                    >
                      {traitement.action}
                    </Button>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        {resume?.audit ? (
          <Card>
            <CardHeader
              title="Journal d'audit"
              subtitle="Dix dernières opérations tracées"
            />
            <CardContent className="p-0">
              <Table
                data={resume.audit}
                initialRowsPerPage={5}
                emptyMessage="Aucune operation tracee"
                columns={[
                  {
                    key: "date",
                    header: "Date",
                    render: (ligne) => formatDateTime(ligne.date),
                  },
                  {
                    key: "auteur",
                    header: "Auteur",
                    render: (ligne) => (
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-800">
                          {ligne.auteur}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {ligne.matricule}
                        </span>
                      </div>
                    ),
                  },
                  {
                    key: "action",
                    header: "Opération",
                    render: (ligne) => (
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-700">
                          {ligne.action}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {ligne.ip}
                        </span>
                      </div>
                    ),
                  },
                ]}
              />
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader
              title="Notifications récentes"
              subtitle="Les derniers événements de la plateforme"
            />
            <CardContent className="space-y-3">
              {(resume?.notifications || []).length === 0 ? (
                <p className="text-xs sm:text-sm text-slate-400 font-medium">
                  Aucune notification.
                </p>
              ) : (
                resume.notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200/70 bg-white"
                  >
                    <span
                      className={`w-2 h-2 rounded-full mt-2 shrink-0 ${
                        notification.lue ? "bg-slate-200" : "bg-brand-primary"
                      }`}
                    />
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-slate-800 break-words">
                        {notification.message}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1">
                        {notification.type} — {formatDateTime(notification.date)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* RÉPARTITIONS */}
      {resume?.plans && (
        <Card>
          <CardHeader
            title="Répartitions"
            subtitle="Volumes et états des marchandises"
          />
          <CardContent className="space-y-5">
            <Tabs
              activeTab={onglet}
              onChange={setOnglet}
              tabs={[
                { id: "plans", label: "Remplissage des navires" },
                { id: "clients", label: "Tonnage par client" },
                { id: "statuts", label: "État des marchandises" },
              ]}
            />

            {onglet === "plans" && (
              <TauxRemplissage remplissage={resume.plans.remplissage} />
            )}

            {onglet === "clients" && (
              <div className="space-y-3">
                {resume.plans.parClient.length === 0 ? (
                  <p className="text-xs sm:text-sm text-slate-400 font-medium">
                    Aucun tonnage embarqué.
                  </p>
                ) : (
                  resume.plans.parClient.map((ligne) => (
                    <Barre
                      key={ligne.nom}
                      libelle={ligne.nom}
                      valeur={ligne.tonnes}
                      maximum={resume.plans.parClient[0].tonnes}
                      unite=" t"
                    />
                  ))
                )}
              </div>
            )}

            {onglet === "statuts" && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border border-slate-200/70 bg-slate-50/50">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Chargées
                  </p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">
                    {resume.plans.statutsLignes?.LOADED || 0}
                  </p>
                </div>
                <div className="p-4 rounded-xl border border-slate-200/70 bg-slate-50/50">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    En attente
                  </p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">
                    {resume.plans.statutsLignes?.PENDING || 0}
                  </p>
                </div>
                <div className="p-4 rounded-xl border border-slate-200/70 bg-slate-50/50">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Annulées
                  </p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">
                    {resume.plans.statutsLignes?.CANCELLED || 0}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* VOYAGES A VENIR */}
      {resume?.voyages?.prochains?.length > 0 && (
        <Card>
          <CardHeader
            title="Prochains départs"
            subtitle="Voyages planifiés ou en cours"
          />
          <CardContent className="p-0">
            <Table
              data={resume.voyages.prochains}
              initialRowsPerPage={5}
              columns={[
                {
                  key: "numero",
                  header: "Voyage",
                  render: (ligne) => (
                    <span className="font-semibold text-slate-800">
                      {ligne.numero}
                    </span>
                  ),
                },
                { key: "navire", header: "Navire" },
                {
                  key: "statut",
                  header: "Statut",
                  render: (ligne) => (
                    <Badge variant={VARIANT_STATUT[ligne.statut] || "info"}>
                      {libelleStatut(ligne.statut)}
                    </Badge>
                  ),
                },
                {
                  key: "depart",
                  header: "Départ",
                  render: (ligne) => formatDate(ligne.depart),
                },
              ]}
            />
          </CardContent>
        </Card>
      )}

      {!isLoading && !aDesBlocs && (
        <Alert variant="info" title="Aucun indicateur disponible">
          Votre profil ne donne accès à aucun indicateur. Rapprochez-vous de
          l'administrateur si vous pensez qu'une permission vous manque.
        </Alert>
      )}
    </div>
  );
}

export default DashboardPage;

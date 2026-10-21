// src/modules/dashboard/dashboard.service.js
// Agrégation des indicateurs du tableau de bord.
//
// Le tableau de bord est partagé par tous les profils, mais chacun n'a
// intérêt qu'à une partie de l'information. Le service ne calcule donc que
// les blocs correspondant aux droits de l'utilisateur connecté : un agent de
// quai ne reçoit aucun indicateur d'audit, un développeur aucun indicateur
// d'exploitation au quai, un chargé de clientèle aucun effectif.

const { prisma } = require("../../config/database");

// Le journal d'audit est une trace technique : il est reserve au
// departement qui exploite la plateforme.
const DEPARTEMENT_TECHNIQUE = "TECH";

const JOURS = 24 * 60 * 60 * 1000;

const possede = (utilisateur, module, action = "READ") => {
  const permissions = utilisateur?.permissions || [];
  return permissions.some(
    (permission) =>
      (permission.module === module || permission.module === "*") &&
      (permission.action === action || permission.action === "*"),
  );
};

const estTechnique = (utilisateur) =>
  utilisateur?.department?.code === DEPARTEMENT_TECHNIQUE;

const arrondi = (valeur, decimales = 2) =>
  Math.round(Number(valeur || 0) * 10 ** decimales) / 10 ** decimales;

/**
 * Exploitation du fret : plans actifs, tonnage, poids a peser, remplissage.
 */
const blocPlans = async (utilisateur) => {
  if (!possede(utilisateur, "LOADING_PLANS")) return null;

  const plans = await prisma.loadingPlan.findMany({
    where: { deletedAt: null, operationType: "LOAD" },
    include: {
      voyage: { include: { vessel: true } },
      loads: { where: { deletedAt: null } },
    },
    orderBy: { createdAt: "desc" },
  });

  let tonnageEmbarque = 0;
  let aPeser = 0;
  let poidsTotal = 0;
  const parClient = new Map();
  const remplissage = [];

  for (const plan of plans) {
    let poidsPlan = 0;

    for (const ligne of plan.loads) {
      if (ligne.status === "LOADED") {
        const poids = Number(ligne.weightKg || 0);
        tonnageEmbarque += poids;
        poidsPlan += poids;
        const nom = ligne.client?.name || "Client inconnu";
        parClient.set(nom, (parClient.get(nom) || 0) + poids);
      }
      if (ligne.status === "PENDING" && ligne.anomaly) {
        aPeser += 1;
      }
    }

    poidsTotal += Number(plan.totalWeightKg || 0);

    const capacite = Number(plan.voyage?.vessel?.capacityTons || 0);
    if (capacite > 0) {
      remplissage.push({
        reference: plan.reference,
        navire: plan.voyage?.vessel?.name || "—",
        poidsKg: poidsPlan,
        capaciteTons: capacite,
        taux: arrondi(Math.min((poidsPlan / (capacite * 1000)) * 100, 100), 1),
      });
    }
  }

  remplissage.sort((a, b) => b.taux - a.taux);

  return {
    actifs: plans.filter((plan) => !plan.status).length,
    total: plans.length,
    tonnageEmbarque: arrondi(tonnageEmbarque / 1000),
    aPeser,
    remplissage: remplissage.slice(0, 5),
    parClient: [...parClient.entries()]
      .map(([nom, poids]) => ({ nom, tonnes: arrondi(poids / 1000) }))
      .sort((a, b) => b.tonnes - a.tonnes)
      .slice(0, 5),
    statutsLignes: {
      PENDING: plans.reduce(
        (total, plan) => total + plan.loads.filter((l) => l.status === "PENDING").length,
        0,
      ),
      LOADED: plans.reduce(
        (total, plan) => total + plan.loads.filter((l) => l.status === "LOADED").length,
        0,
      ),
      CANCELLED: plans.reduce(
        (total, plan) => total + plan.loads.filter((l) => l.status === "CANCELLED").length,
        0,
      ),
    },
  };
};

/**
 * Referentiel commercial : clients actifs, nouveaux clients, documents qui
 * expirent.
 */
const blocClients = async (utilisateur) => {
  if (!possede(utilisateur, "CLIENT")) return null;

  const depuis = new Date(Date.now() - 30 * JOURS);
  const echeance = new Date(Date.now() + 30 * JOURS);

  const [actifs, nouveaux, documents] = await Promise.all([
    prisma.client.count({ where: { deletedAt: null, isActive: true } }),
    prisma.client.count({ where: { deletedAt: null, createdAt: { gte: depuis } } }),
    prisma.clientDocument.findMany({
      where: {
        deletedAt: null,
        expiresAt: { not: null, lte: echeance },
      },
      include: { client: { select: { name: true, reference: true } } },
      orderBy: { expiresAt: "asc" },
      take: 5,
    }),
  ]);

  return {
    actifs,
    nouveaux,
    documentsExpires: documents.map((document) => ({
      id: document.id,
      client: document.client?.name || "—",
      type: document.documentType,
      numero: document.documentNumber,
      expireLe: document.expiresAt,
      expire: document.expiresAt < new Date(),
    })),
  };
};

/**
 * Voyages : repartition par statut.
 */
const blocVoyages = async (utilisateur) => {
  if (!possede(utilisateur, "VOYAGES")) return null;

  const voyages = await prisma.voyage.findMany({
    where: { deletedAt: null },
    select: {
      voyageNumber: true,
      status: true,
      departureDate: true,
      vessel: { select: { name: true } },
    },
    orderBy: { departureDate: "asc" },
  });

  const parStatut = voyages.reduce((accumulateur, voyage) => {
    accumulateur[voyage.status] = (accumulateur[voyage.status] || 0) + 1;
    return accumulateur;
  }, {});

  return {
    total: voyages.length,
    parStatut,
    prochains: voyages
      .filter((voyage) => ["SCHEDULED", "IN_TRANSIT"].includes(voyage.status))
      .slice(0, 5)
      .map((voyage) => ({
        numero: voyage.voyageNumber,
        navire: voyage.vessel?.name || "—",
        statut: voyage.status,
        depart: voyage.departureDate,
      })),
  };
};

/**
 * Demandes d acces en attente de traitement.
 */
const blocAcces = async (utilisateur) => {
  if (!possede(utilisateur, "USERS")) return null;

  const [demandes, lues] = await Promise.all([
    prisma.notification.count({ where: { type: "ACCESS_REQUEST" } }),
    prisma.notificationRead.count({
      where: {
        notification: { type: "ACCESS_REQUEST" },
        employeeId: utilisateur.id,
      },
    }),
  ]);

  return { demandes: Math.max(demandes - lues, 0), total: demandes };
};

/**
 * Effectifs de l entreprise.
 */
const blocEmployes = async (utilisateur) => {
  if (!possede(utilisateur, "EMPLOYEES")) return null;

  const [actifs, sansAcces, total] = await Promise.all([
    prisma.employee.count({ where: { deletedAt: null, isActive: true } }),
    prisma.employee.count({
      where: { deletedAt: null, OR: [{ hasAppAccess: false }, { isActive: false }] },
    }),
    prisma.employee.count({ where: { deletedAt: null } }),
  ]);

  return { actifs, sansAcces, total };
};

/**
 * Journal d audit : reserve au departement technique.
 */
const blocAudit = async (utilisateur) => {
  if (!estTechnique(utilisateur)) return null;

  const entrees = await prisma.auditLog.findMany({
    take: 10,
    orderBy: { createdAt: "desc" },
    include: { employee: { select: { name: true, matricule: true } } },
  });

  return entrees.map((entree) => ({
    id: entree.id,
    action: entree.action,
    methode: entree.method,
    route: entree.route,
    auteur: entree.employee?.name || "Système",
    matricule: entree.employee?.matricule || "—",
    ip: entree.ipAddress,
    date: entree.createdAt,
  }));
};

/**
 * Notifications recentes : accessibles a tout employe connecte.
 */
const blocNotifications = async (utilisateur) => {
  const notifications = await prisma.notification.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: { reads: { where: { employeeId: utilisateur.id } } },
  });

  return notifications.map((notification) => ({
    id: notification.id,
    type: notification.type,
    message: notification.message,
    date: notification.createdAt,
    lue: notification.reads.length > 0,
  }));
};

/**
 * Resume du tableau de bord, limite aux blocs accessibles a l utilisateur.
 */
const getSummary = async (utilisateur) => {
  const [plans, clients, voyages, acces, employes, audit, notifications] =
    await Promise.all([
      blocPlans(utilisateur),
      blocClients(utilisateur),
      blocVoyages(utilisateur),
      blocAcces(utilisateur),
      blocEmployes(utilisateur),
      blocAudit(utilisateur),
      blocNotifications(utilisateur),
    ]);

  const resume = { notifications };
  if (plans) resume.plans = plans;
  if (clients) resume.clients = clients;
  if (voyages) resume.voyages = voyages;
  if (acces) resume.acces = acces;
  if (employes) resume.employes = employes;
  if (audit) resume.audit = audit;

  return resume;
};

module.exports = {
  getSummary,
  // Exportees pour etre verifiees par les tests unitaires.
  possede,
  estTechnique,
};

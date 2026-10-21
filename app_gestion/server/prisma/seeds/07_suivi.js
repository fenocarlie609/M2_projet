// prisma/seeds/07_suivi.js
// Suivi de l'activite : notifications, lectures, journal d'audit et sessions.
//
// Le journal d'audit est reconstruit a partir des donnees reellement creees :
// chaque plan de manutention, chaque voyage et chaque client produit les
// operations qu'il a reellement induites. L'historique est donc coherent avec
// le reste du jeu.
const { jours, heures } = require("./donnees");

async function run(prisma, { plansCrees, clientsCrees, employesCrees, voyages }) {
  const admin = employesCrees.get("admin");
  const technicien = employesCrees.get("tech");
  const coordinateur = employesCrees.get("coordinator");
  const agentQuai = employesCrees.get("quay");
  const commercial = employesCrees.get("commercial");

  const ADRESSE_IP = "192.168.1.24";

  // --- Notifications ----------------------------------------------------
  await prisma.notificationRead.deleteMany();
  await prisma.notification.deleteMany();

  const definitions = [];

  for (const employe of ["fleet", "crew", "director"]
    .map((cle) => employesCrees.get(cle))
    .filter(Boolean)) {
    definitions.push({
      type: "ACCESS_REQUEST",
      message: `${employe.name} (${employe.matricule}) a besoin d'un accès à l'application.`,
      payload: { employeeId: employe.id },
      targetModule: "USERS",
      targetAction: "CREATE",
      date: jours(-1),
      lue: false,
    });
  }

  for (const plan of plansCrees.slice(-5)) {
    definitions.push({
      type: "PLAN_VALIDATED",
      message: `Le plan de chargement ${plan.reference} a été validé.`,
      payload: { reference: plan.reference },
      targetModule: "LOADING_PLANS",
      targetAction: "READ",
      date: jours(plan.voyage.departJours - 1),
      lue: true,
    });
  }

  definitions.push(
    {
      type: "CLIENT_CREATED",
      message: "Le client ETS TANA AGRUMES a été enregistré.",
      payload: { reference: "CLI-2026-0014" },
      targetModule: "CLIENT",
      targetAction: "READ",
      date: jours(-30),
      lue: true,
    },
    {
      type: "UNLOAD_VALIDATED",
      message: "Le plan de déchargement d'un voyage arrivé a été validé.",
      payload: { reference: "DECH-PL-2026-011" },
      targetModule: "LOADING_PLANS",
      targetAction: "READ",
      date: jours(-9),
      lue: true,
    },
    {
      type: "SHIPMENT_RECEIVED",
      message: "Une marchandise a été retirée par son client.",
      payload: {},
      targetModule: "ENTREPOTS",
      targetAction: "READ",
      date: jours(-2),
      lue: false,
    },
    {
      type: "SHIPMENT_RECEIVED",
      message: "Une marchandise a été réembarquée sur le prochain voyage.",
      payload: {},
      targetModule: "ENTREPOTS",
      targetAction: "READ",
      date: jours(-1),
      lue: false,
    },
    {
      type: "VOYAGE_SCHEDULED",
      message: "Un nouveau voyage a été programmé.",
      payload: {},
      targetModule: "VOYAGES",
      targetAction: "READ",
      date: jours(-6),
      lue: true,
    },
    {
      type: "PERMISSION_GRANTED",
      message: "Un droit a été accordé à un employé.",
      payload: { module: "LOADING_PLANS", action: "UPDATE" },
      targetModule: "USERS",
      targetAction: "UPDATE",
      date: jours(-60),
      lue: true,
    },
    {
      type: "CARGO_CONFIRMED",
      message: "Le poids d'une marchandise a été confirmé au pesage.",
      payload: {},
      targetModule: "CARGO",
      targetAction: "UPDATE",
      date: jours(-3),
      lue: false,
    },
  );

  for (const definition of definitions) {
    const notification = await prisma.notification.create({
      data: {
        type: definition.type,
        message: definition.message,
        payload: definition.payload,
        targetModule: definition.targetModule,
        targetAction: definition.targetAction,
        createdAt: definition.date,
      },
    });

    if (definition.lue) {
      await prisma.notificationRead.create({
        data: {
          notificationId: notification.id,
          employeeId: technicien.id,
          readAt: definition.date,
        },
      });
    }
  }

  // --- Journal d'audit --------------------------------------------------
  await prisma.auditLog.deleteMany();

  const entrees = [];

  const ajouter = (date, action, methode, route, auteur, extra = {}) => {
    entrees.push({
      date,
      action,
      methode,
      route,
      auteur: auteur ? auteur.id : null,
      payload: extra.payload || null,
      ancien: extra.ancien || null,
      nouveau: extra.nouveau || null,
    });
  };

  // Les connexions des differents profils, espacees dans le temps.
  for (let index = 0; index < 16; index += 1) {
    const profils = [admin, technicien, coordinateur, agentQuai, commercial];
    ajouter(
      jours(-((index * 9) % 300) - 1),
      "POST_AUTH",
      "POST",
      "/api/v1/auth/login",
      profils[index % profils.length],
      { payload: { identifier: "compte de démonstration" } },
    );
  }

  // La creation des employes, a leur date d'embauche.
  for (const employe of [
    "hr",
    "commercial",
    "coordinator",
    "quay",
    "assistant",
    "dev",
    "dba",
    "commercialMgr",
    "analyst",
    "quay2",
  ]) {
    const fiche = employesCrees.get(employe);
    if (!fiche) continue;
    ajouter(
      jours(-((index_Employe(fiche) % 400) + 20)),
      "POST_EMPLOYEES",
      "POST",
      "/api/v1/employees",
      technicien,
      { payload: { name: fiche.name, matricule: fiche.matricule } },
    );
  }

  // La creation des clients, a la signature de leur contrat.
  for (const [nom, client] of clientsCrees) {
    ajouter(
      client.createdAt || jours(-200),
      "POST_CLIENTS",
      "POST",
      "/api/v1/clients",
      commercial,
      { payload: { name: nom, reference: client.reference } },
    );
  }

  // Les voyages, programmes puis realises.
  for (const voyage of voyages) {
    ajouter(
      // Un voyage programme est saisi dans le passé, meme si son depart
      // est encore a venir.
      jours(Math.min(voyage.departJours - 12, -1)),
      "POST_VOYAGES",
      "POST",
      "/api/v1/voyages",
      coordinateur,
      { payload: { voyageNumber: voyage.reference } },
    );
  }

  // Les plans de manutention et leurs lignes.
  for (const plan of plansCrees) {
    ajouter(
      plan.plan.createdAt,
      "POST_LOADING-PLANS",
      "POST",
      "/api/v1/loading-plans",
      coordinateur,
      { payload: { reference: plan.reference } },
    );

    for (const ligne of plan.lignes) {
      ajouter(
        ligne.loadingDate || plan.plan.createdAt,
        "POST_LOADING-PLANS",
        "POST",
        `/api/v1/loading-plans/${plan.plan.id}/loads`,
        agentQuai,
        {
          payload: {
            description: ligne.description,
            packageCount: ligne.packageCount,
            weightKg: ligne.weightKg,
            loadingPosition: ligne.loadingPosition,
          },
        },
      );
    }

    if (plan.planValide) {
      ajouter(
        plan.plan.validatedAt || plan.plan.createdAt,
        "PUT_LOADING-PLANS",
        "PUT",
        `/api/v1/loading-plans/${plan.plan.id}`,
        coordinateur,
        {
          payload: { reference: plan.reference },
          ancien: { status: false },
          nouveau: { status: true, totalWeightKg: plan.poidsTotal },
        },
      );
    }
  }

  // Les entrees en entrepot et les sorties.
  ajouter(jours(-9), "POST_WAREHOUSE", "POST", "/api/v1/warehouse/items", agentQuai, {
    payload: { entrepot: "ANT-01" },
  });
  ajouter(jours(-2), "PUT_WAREHOUSE", "PUT", "/api/v1/warehouse/items", agentQuai, {
    payload: { status: "PICKED_UP" },
  });
  ajouter(jours(-1), "PUT_WAREHOUSE", "PUT", "/api/v1/warehouse/items", coordinateur, {
    payload: { status: "EMBARKED" },
  });
  ajouter(jours(-29), "POST_WAREHOUSE", "POST", "/api/v1/warehouse", technicien, {
    payload: { code: "ANT-01" },
  });

  // Les demandes d'acces.
  ajouter(jours(-1), "POST_NOTIFICATIONS", "POST", "/api/v1/notifications", technicien, {
    payload: { type: "ACCESS_REQUEST" },
  });

  entrees.sort((a, b) => a.date - b.date);

  for (const entree of entrees) {
    await prisma.auditLog.create({
      data: {
        employeeId: entree.auteur,
        action: entree.action,
        method: entree.methode,
        route: entree.route,
        ipAddress: ADRESSE_IP,
        payload: entree.payload,
        oldValues: entree.ancien,
        newValues: entree.nouveau,
        createdAt: entree.date,
      },
    });
  }

  // --- Sessions ---------------------------------------------------------
  await prisma.refreshToken.deleteMany();

  await prisma.refreshToken.create({
    data: {
      employeeId: admin.id,
      tokenHash:
        "5f2c8b1a94d7e036fa15c8d2e7b4a90c6d1e8f35a72b904ce613d8a2f57b0e9c4",
      familyId: "famille-demonstration-0001",
      jti: "session-demonstration-0001",
      expiresAt: jours(7),
      lastUsedAt: heures(-2),
    },
  });

  const total = await prisma.auditLog.count();
  const notifications = await prisma.notification.count();
  const lectures = await prisma.notificationRead.count();

  console.log(
    `   suivi : ${notifications} notifications, ${lectures} lectures, ` +
      `${total} entrees d'audit`,
  );
}

// Repartition des embauches dans le temps, pour dater la creation des fiches.
function index_Employe(fiche) {
  return Math.abs((fiche.name || "").length * 37) % 400;
}

module.exports = { run };

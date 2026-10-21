// prisma/seedDemo.js
// Jeu de données de démonstration complet : il alimente l'ensemble des tables
// du modèle physique.
//
// Le script enchaîne les scripts de référence (structure de l'entreprise,
// catalogue des modules, administrateur universel, données logistiques), puis
// complète les tables qui ne sont couvertes par aucun autre script : les
// employés et leurs permissions, les adresses et les documents des clients,
// les notifications et leur lecture, le journal d'audit et les jetons de
// session.
//
// Le script est idempotent : il peut être relancé sans dupliquer les
// enregistrements.
//
//   npm run seed:demo
//
// La table refresh_tokens représente des sessions vivantes : elle est alimentée
// par la connexion réelle des utilisateurs, le jeu de démonstration n'en
// contient que quelques-unes à titre d'exemple.

const { execFileSync } = require("child_process");
const path = require("path");
require("dotenv").config({ path: ".env.development" });
require("dotenv").config();

const { PrismaClient } = require("../src/generated/prisma");
const { PrismaPg } = require("@prisma/adapter-pg");
const { hashPassword } = require("../src/common/utils/password.utils");
const { structure } = require("./structure");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const MOT_DE_PASSE_DEMO = "Demo@2026";

const employes = [
  {
    name: "RAKOTO Jean Baptiste",
    cin: "20123540117",
    email: "j.rakoto@lct.mg",
    phone: "034 12 345 67",
    department: "LOGISTICS",
    position: "QUAY_AGENT",
    avecAcces: true,
    actif: true,
    permissions: [
      ["CLIENT", "READ"],
      ["LOADING_PLANS", "READ"],
      ["CARGO", "CREATE"],
      ["CARGO", "READ"],
      ["CARGO", "UPDATE"],
    ],
  },
  {
    name: "RASOANAIVO Naina",
    cin: "11890234567",
    email: "n.rasoanaivo@lct.mg",
    phone: "033 45 678 90",
    department: "LOGISTICS",
    position: "LOGISTICS_COORD",
    avecAcces: true,
    actif: true,
    permissions: [
      ["CLIENT", "READ"],
      ["CLIENT", "CREATE"],
      ["CLIENT", "UPDATE"],
      ["VESSELS", "READ"],
      ["PORTS", "READ"],
      ["VOYAGES", "READ"],
      ["LOADING_PLANS", "READ"],
      ["LOADING_PLANS", "CREATE"],
      ["LOADING_PLANS", "UPDATE"],
      ["CARGO", "READ"],
      ["CARGO", "CREATE"],
      ["CARGO", "UPDATE"],
    ],
  },
  {
    name: "RABE Tiana",
    cin: "20101122334",
    email: "t.rabe@lct.mg",
    phone: "032 11 223 44",
    department: "TECH",
    position: "SYS_ADMIN",
    avecAcces: true,
    actif: true,
    permissions: [
      ["EMPLOYEES", "READ"],
      ["EMPLOYEES", "CREATE"],
      ["EMPLOYEES", "UPDATE"],
      ["USERS", "READ"],
      ["USERS", "CREATE"],
      ["USERS", "UPDATE"],
      ["USERS", "DELETE"],
      ["MODULE", "READ"],
      ["COMPANY_STRUCTURE", "READ"],
    ],
  },
  {
    name: "RAKOTOMALALA Faniry",
    cin: "20154455667",
    email: "f.rakotomalala@lct.mg",
    phone: "034 56 789 01",
    department: "TECH",
    position: "SOFTWARE_ENG",
    avecAcces: true,
    actif: true,
    permissions: [
      ["EMPLOYEES", "READ"],
      ["CLIENT", "READ"],
      ["LOADING_PLANS", "READ"],
      ["CARGO", "READ"],
    ],
  },
  {
    name: "RABEMANANARISOA Toky",
    cin: "20132233445",
    email: "t.rabemananarisoa@lct.mg",
    phone: "033 98 765 43",
    department: "ADMIN",
    position: "HR_MGR",
    avecAcces: true,
    actif: true,
    permissions: [
      ["EMPLOYEES", "READ"],
      ["EMPLOYEES", "CREATE"],
      ["EMPLOYEES", "UPDATE"],
      ["EMPLOYEES", "DELETE"],
      ["COMPANY_STRUCTURE", "READ"],
      ["COMPANY_STRUCTURE", "CREATE"],
      ["COMPANY_STRUCTURE", "UPDATE"],
      ["COMPANY_STRUCTURE", "DELETE"],
    ],
  },
  {
    name: "ANDRIANARISOA Miora",
    cin: "20183344556",
    email: "m.andrianarisoa@lct.mg",
    phone: "034 77 889 90",
    department: "COMMERCIAL",
    position: "SALES_REPRESENTATIVE",
    avecAcces: true,
    actif: true,
    permissions: [
      ["CLIENT", "READ"],
      ["CLIENT", "CREATE"],
      ["CLIENT", "UPDATE"],
      ["LOADING_PLANS", "READ"],
    ],
  },
  {
    name: "RANDRIANASOLO Hery",
    cin: "20165566778",
    email: "h.randrianasolo@lct.mg",
    phone: "032 44 556 67",
    department: "FINANCE",
    position: "ACCOUNTANT",
    avecAcces: true,
    actif: true,
    permissions: [["CLIENT", "READ"], ["LOADING_PLANS", "READ"]],
  },
  {
    name: "RAKOTONIRINA Fanja",
    cin: "20176677889",
    email: "f.rakotonirina@lct.mg",
    phone: "033 22 334 45",
    department: "LOGISTICS",
    position: "FLEET_MGR",
    avecAcces: false,
    actif: false,
    permissions: [],
  },
  {
    name: "RAHARIMALALA Soa",
    cin: "20198899001",
    email: "s.raharimalala@lct.mg",
    phone: "034 11 223 34",
    department: "LOGISTICS",
    position: "CREW_MEMBER",
    avecAcces: false,
    actif: false,
    permissions: [],
  },
  {
    name: "RABEMANANARISOA Fanja",
    cin: "20129900112",
    email: "f.rabemananarisoa@lct.mg",
    phone: "032 55 667 78",
    department: "ADMIN",
    position: "DIRECTOR",
    avecAcces: false,
    actif: false,
    permissions: [],
  },
];

const clients = [
  {
    reference: "CLI-2026-0001",
    nom: "ETS RAKOTOVOINTSAKA",
    type: "COMPANY",
    legalName: "ETS RAKOTOVOINTSAKA",
    tradeName: "RAKOTOVOINTSAKA",
    nif: "4001234567",
    stat: "65412",
    rcs: "2003 B 01234",
    legalForm: "SARL",
    activity: "Négoce de produits agricoles",
    email: "contact@rakotovointsaka.mg",
    phone: "033 45 678 90",
    paymentTerms: "30 jours fin de mois",
    contractNumber: "CT-2026-001",
    habitualCargoType: "Café vert, clous de girofle",
    receptionContactName: "Naina Rasoa",
    receptionContactPhone: "034 12 345 67",
    receptionContactEmail: "naina.rasoa@rakotovointsaka.mg",
  },
  {
    reference: "CLI-2026-0002",
    nom: "SOCIETE GENERALE DE TRANSPORT MARITIME",
    type: "COMPANY",
    legalName: "SOCIETE GENERALE DE TRANSPORT MARITIME",
    tradeName: "SGTM",
    nif: "4007654321",
    stat: "71203",
    rcs: "2008 B 04567",
    legalForm: "SA",
    activity: "Transport maritime de marchandises",
    email: "dock@sgtm.mg",
    phone: "032 22 334 45",
    paymentTerms: "15 jours",
    contractNumber: "CT-2026-002",
    habitualCargoType: "Conteneurs, marchandises diverses",
    taxExempt: true,
    taxExemptionReason: "Convention d'agrément temporaire",
  },
  {
    reference: "CLI-2026-0003",
    nom: "COOPÉRATIVE DES PRODUCTEURS DE VANILLE",
    type: "COMPANY",
    legalName: "COOPÉRATIVE DES PRODUCTEURS DE VANILLE",
    tradeName: "COOP VANILLE",
    nif: "4009876543",
    stat: "60456",
    rcs: "2012 B 07890",
    legalForm: "SARL",
    activity: "Achat et export de vanille",
    email: "coop.vanille@lct.mg",
    phone: "034 55 667 78",
    paymentTerms: "45 jours",
    habitualCargoType: "Vanille gousses",
  },
  {
    reference: "CLI-2026-0004",
    nom: "RAZAFIMAHATRATRA Sophie",
    type: "INDIVIDUAL",
    firstName: "Sophie",
    lastName: "Razafimahatratra",
    cin: "20110011223",
    cinIssuedAt: new Date("2021-03-14T00:00:00.000Z"),
    cinIssuedPlace: "Antananarivo",
    email: "sophie.razafimahatratra@gmail.com",
    phone: "033 88 990 01",
    paymentTerms: "Comptant",
    habitualCargoType: "Riz, haricot",
  },
  {
    reference: "CLI-2026-0005",
    nom: "RAJAONARISON Rakotomalala",
    type: "INDIVIDUAL",
    firstName: "Rakotomalala",
    lastName: "Rajaonarison",
    cin: "20134455667",
    cinIssuedAt: new Date("2022-09-02T00:00:00.000Z"),
    cinIssuedPlace: "Toamasina",
    email: "rrakotomalala@yahoo.fr",
    phone: "034 22 112 23",
    paymentTerms: "Comptant à l'embarquement",
    habitualCargoType: "Sablage",
  },
];

const adressesParClient = {
  "ETS RAKOTOVOINTSAKA": [
    {
      type: "BOTH",
      label: "Siège social",
      addressLine1: "Lot II F 45bis Andraharo",
      city: "Antananarivo",
      region: "Analamanga",
      postalCode: "101",
      isDefault: true,
    },
    {
      type: "DELIVERY",
      label: "Dépôt portuaire",
      addressLine1: "Zone industrielle, atelier 7",
      city: "Toamasina",
      region: "Atsinanana",
      postalCode: "501",
      isDefault: false,
    },
  ],
  "SOCIETE GENERALE DE TRANSPORT MARITIME": [
    {
      type: "BOTH",
      label: "Siège",
      addressLine1: "Boulevard Joffre, Immeuble Fiaro",
      city: "Antananarivo",
      region: "Analamanga",
      postalCode: "101",
      isDefault: true,
    },
  ],
  "COOPÉRATIVE DES PRODUCTEURS DE VANILLE": [
    {
      type: "BILLING",
      label: "Adresse de facturation",
      addressLine1: "Route d'Ambositra, RN7",
      city: "Antsirabe",
      region: "Vakinankaratra",
      postalCode: "110",
      isDefault: true,
    },
    {
      type: "DELIVERY",
      label: "Point de collecte",
      addressLine1: "Village Antsohihy, près du marché",
      city: "Sambava",
      region: "Vikimandra",
      postalCode: "318",
      isDefault: false,
    },
  ],
};

const documentsParClient = {
  "ETS RAKOTOVOINTSAKA": [
    {
      documentType: "NIF",
      documentNumber: "4001234567",
      fileName: "nif-rakotovointsaka.pdf",
      issuedAt: new Date("2026-01-12T00:00:00.000Z"),
      expiresAt: null,
      verifiedAt: new Date("2026-02-04T00:00:00.000Z"),
      notes: "Original vérifié au guichet.",
    },
    {
      documentType: "STAT",
      documentNumber: "65412",
      fileName: "stat-65412.pdf",
      issuedAt: new Date("2026-01-12T00:00:00.000Z"),
      expiresAt: null,
      verifiedAt: new Date("2026-02-04T00:00:00.000Z"),
      notes: null,
    },
    {
      documentType: "CONTRAT",
      documentNumber: "CT-2026-001",
      fileName: "contrat-transport-2026.pdf",
      issuedAt: new Date("2026-01-20T00:00:00.000Z"),
      expiresAt: new Date("2026-12-31T00:00:00.000Z"),
      verifiedAt: null,
      notes: "Contrat annuel de transport maritime.",
    },
  ],
  "SOCIETE GENERALE DE TRANSPORT MARITIME": [
    {
      documentType: "RCS",
      documentNumber: "2008 B 04567",
      fileName: "rcs-sgtm.pdf",
      issuedAt: new Date("2008-06-20T00:00:00.000Z"),
      expiresAt: null,
      verifiedAt: new Date("2026-02-11T00:00:00.000Z"),
      notes: null,
    },
    {
      documentType: "AGREMENT",
      documentNumber: "AGR-2026-118",
      fileName: "agrement-temporaire-2026.pdf",
      issuedAt: new Date("2026-02-01T00:00:00.000Z"),
      expiresAt: new Date("2026-11-30T00:00:00.000Z"),
      verifiedAt: new Date("2026-02-11T00:00:00.000Z"),
      notes: "Agrément temporaire à renouveler avant le 30 novembre.",
    },
  ],
  "COOPÉRATIVE DES PRODUCTEURS DE VANILLE": [
    {
      documentType: "NIF",
      documentNumber: "4009876543",
      fileName: "nif-coop-vanille.pdf",
      issuedAt: new Date("2024-05-02T00:00:00.000Z"),
      expiresAt: null,
      verifiedAt: new Date("2026-03-08T00:00:00.000Z"),
      notes: null,
    },
  ],
  "RAZAFIMAHATRATRA Sophie": [
    {
      documentType: "CIN",
      documentNumber: "20110011223",
      fileName: "cin-sophie.jpg",
      issuedAt: new Date("2021-03-14T00:00:00.000Z"),
      expiresAt: new Date("2031-03-14T00:00:00.000Z"),
      verifiedAt: new Date("2026-04-02T00:00:00.000Z"),
      notes: null,
    },
  ],
};

// Correspondance entre les tables physiques et les modeles du client Prisma
const TABLES = [
  ["departments", "department"],
  ["positions", "position"],
  ["employees", "employee"],
  ["employee_permissions", "employeePermission"],
  ["app_modules", "appModule"],
  ["audit_logs", "auditLog"],
  ["clients", "client"],
  ["client_addresses", "clientAddress"],
  ["client_documents", "clientDocument"],
  ["vessels", "vessel"],
  ["ports", "port"],
  ["voyages", "voyage"],
  ["loading_plans", "loadingPlan"],
  ["loads", "load"],
  ["notifications", "notification"],
  ["notification_reads", "notificationRead"],
  ["refresh_tokens", "refreshToken"],
];

function lancer(script) {
  console.log(`   → ${path.basename(script)}`);
  execFileSync(process.execPath, [script], { stdio: "inherit" });
}

function codeMatricule(brut) {
  const mots = String(brut).split(/[\s_]+/);
  if (mots.length > 1) {
    const initiales = mots.map((m) => m[0]).join("").toUpperCase();
    if (initiales.length >= 2) return initiales;
  }
  return String(brut).replace(/[^a-zA-Z0-9]/g, "").substring(0, 4).toUpperCase();
}

function genererMatricule(departement, poste, occupes) {
  const base = `${codeMatricule(departement)}-${codeMatricule(poste)}`;
  let index = 1;
  let candidat = `${base}-${String(index).padStart(2, "0")}`;
  while (occupes.has(candidat)) {
    index += 1;
    candidat = `${base}-${String(index).padStart(2, "0")}`;
  }
  occupes.add(candidat);
  return candidat;
}

async function main() {
  console.log("🌾 Amorçage complet de la base de démonstration...");

  console.log("1. Scripts de référence");
  lancer(path.join(__dirname, "seed.js"));
  lancer(path.join(__dirname, "seedAppModules.js"));
  lancer(path.join(__dirname, "seedAdmin.js"));
  lancer(path.join(__dirname, "seedLoadingPlan.js"));

  console.log("2. Structure de l'entreprise");
  for (const dept of structure) {
    await prisma.department.upsert({
      where: { code: dept.code },
      update: { label: dept.label },
      create: { code: dept.code, label: dept.label },
    });
  }

  console.log("3. Employés et permissions");
  const employesEnBase = await prisma.employee.findMany({
    select: { matricule: true },
  });
  const occupes = new Set(employesEnBase.map((e) => e.matricule));
  const motDePasse = await hashPassword(MOT_DE_PASSE_DEMO);
  const employesCrees = [];

  for (const donnees of employes) {
    const departement = await prisma.department.findUnique({
      where: { code: donnees.department },
    });
    const poste = await prisma.position.findFirst({
      where: { code: donnees.position, departmentId: departement.id },
    });

    // Le matricule d'un employe deja present est conserve : le jeu de
    // demonstration reste identique d'une execution a l'autre.
    const existant = await prisma.employee.findUnique({
      where: { email: donnees.email },
      select: { matricule: true },
    });
    const matricule = existant
      ? existant.matricule
      : genererMatricule(donnees.department, donnees.position, occupes);
    const employe = await prisma.employee.upsert({
      where: { email: donnees.email },
      update: {
        name: donnees.name,
        cin: donnees.cin,
        phone: donnees.phone,
        matricule,
        hasAppAccess: donnees.avecAcces,
        isActive: donnees.actif,
        password: motDePasse,
        departmentId: departement.id,
        positionId: poste.id,
        deletedAt: null,
      },
      create: {
        name: donnees.name,
        email: donnees.email,
        cin: donnees.cin,
        phone: donnees.phone,
        matricule,
        hasAppAccess: donnees.avecAcces,
        isActive: donnees.actif,
        password: motDePasse,
        departmentId: departement.id,
        positionId: poste.id,
      },
    });

    for (const [module, action] of donnees.permissions) {
      await prisma.employeePermission.upsert({
        where: {
          employeeId_module_action: {
            employeeId: employe.id,
            module,
            action,
          },
        },
        update: {},
        create: { employeeId: employe.id, module, action },
      });
    }

    employesCrees.push({ ...donnees, employe });
  }

  console.log("4. Clients, adresses et documents");
  for (const donnees of clients) {
    const { nom, ...champs } = donnees;
    const client = await prisma.client.upsert({
      where: { reference: donnees.reference },
      update: { ...champs, name: nom, deletedAt: null },
      create: { ...champs, name: nom },
    });

    for (const adresse of adressesParClient[nom] || []) {
      const existante = await prisma.clientAddress.findFirst({
        where: { clientId: client.id, type: adresse.type, label: adresse.label },
      });
      if (!existante) {
        await prisma.clientAddress.create({
          data: { ...adresse, clientId: client.id, country: "Madagascar" },
        });
      }
    }

    for (const document of documentsParClient[nom] || []) {
      const existant = await prisma.clientDocument.findFirst({
        where: {
          clientId: client.id,
          documentType: document.documentType,
          documentNumber: document.documentNumber,
        },
      });
      if (!existant) {
        await prisma.clientDocument.create({
          data: {
            clientId: client.id,
            documentType: document.documentType,
            documentNumber: document.documentNumber,
            fileName: document.fileName,
            fileUrl: `/uploads/clients/${client.reference}/${document.fileName}`,
            issuedAt: document.issuedAt,
            expiresAt: document.expiresAt,
            verifiedAt: document.verifiedAt,
            notes: document.notes,
          },
        });
      }
    }
  }

  // Les clients crees par le script de donnees logistiques recoivent eux
  // aussi une adresse, afin que la table des adresses soit alimentee pour
  // l'ensemble du referentiel.
  const autresClients = await prisma.client.findMany({
    where: { reference: { startsWith: "CLI-2026-" } },
    include: { addresses: true },
  });
  for (const client of autresClients) {
    if (client.addresses.length > 0) continue;
    await prisma.clientAddress.create({
      data: {
        clientId: client.id,
        type: "BOTH",
        label: "Adresse principale",
        addressLine1: "Quai de déchargement, emplacement 4",
        city: "Toamasina",
        region: "Atsinanana",
        postalCode: "501",
        country: "Madagascar",
        isDefault: true,
      },
    });
  }

  console.log("5. Notifications et lectures");
  const enAttente = employesCrees.filter((e) => !e.avecAcces);
  const notifications = [
    {
      type: "ACCESS_REQUEST",
      message: `${enAttente[0].name} (${enAttente[0].employe.matricule}) a besoin d'un accès à l'application.`,
      targetModule: "USERS",
      targetAction: "CREATE",
      payload: { employeeId: enAttente[0].employe.id },
    },
    {
      type: "ACCESS_REQUEST",
      message: `${enAttente[1].name} (${enAttente[1].employe.matricule}) a besoin d'un accès à l'application.`,
      targetModule: "USERS",
      targetAction: "CREATE",
      payload: { employeeId: enAttente[1].employe.id },
    },
    {
      type: "PLAN_VALIDATED",
      message: "Le plan de chargement PL-13E-2026 a été validé.",
      targetModule: "LOADING_PLANS",
      targetAction: "READ",
      payload: { reference: "PL-13E-2026" },
    },
    {
      type: "CLIENT_CREATED",
      message: "Le client ETS RAKOTOVOINTSAKA a été enregistré.",
      targetModule: "CLIENT",
      targetAction: "READ",
      payload: { reference: "CLI-2026-0001" },
    },
    {
      type: "PLAN_UNLOAD_CREATED",
      message: "Le plan de déchargement DECH-PL-13E-2026 a été généré automatiquement.",
      targetModule: "LOADING_PLANS",
      targetAction: "READ",
      payload: { reference: "DECH-PL-13E-2026" },
    },
    {
      type: "VESSEL_ASSIGNED",
      message: "Le voyage 14E VOYAGE a été affecté au navire LCT AZAD FENOVAVY.",
      targetModule: "VOYAGES",
      targetAction: "READ",
      payload: { voyageNumber: "14E VOYAGE" },
    },
  ];

  for (const notification of notifications) {
    const existante = await prisma.notification.findFirst({
      where: { type: notification.type, message: notification.message },
    });
    if (!existante) {
      await prisma.notification.create({
        data: {
          type: notification.type,
          message: notification.message,
          payload: notification.payload,
          targetModule: notification.targetModule,
          targetAction: notification.targetAction,
        },
      });
    }
  }

  const notificationsEnBase = await prisma.notification.findMany({
    orderBy: { createdAt: "asc" },
  });
  const lecteur = employesCrees.find((e) => e.email === "t.rabe@lct.mg");
  if (lecteur) {
    for (const notification of notificationsEnBase.slice(0, 3)) {
      const lue = await prisma.notificationRead.findFirst({
        where: { notificationId: notification.id, employeeId: lecteur.employe.id },
      });
      if (!lue) {
        await prisma.notificationRead.create({
          data: { notificationId: notification.id, employeeId: lecteur.employe.id },
        });
      }
    }
  }

  console.log("6. Journal d'audit");
  const journal = [
    {
      action: "POST /auth/login",
      method: "POST",
      route: "/api/v1/auth/login",
      payload: { identifier: "admin@lct.mg" },
    },
    {
      action: "POST /employees",
      method: "POST",
      route: "/api/v1/employees",
      payload: { name: "RABEMANANARISOA Toky", email: "t.rabemananarisoa@lct.mg" },
      newValues: { hasAppAccess: true, isActive: true },
    },
    {
      action: "POST /clients",
      method: "POST",
      route: "/api/v1/clients",
      payload: { reference: "CLI-2026-0001", name: "ETS RAKOTOVOINTSAKA" },
    },
    {
      action: "PUT /clients",
      method: "PUT",
      route: "/api/v1/clients",
      payload: { reference: "CLI-2026-0004" },
      oldValues: { paymentTerms: "Comptant" },
      newValues: { paymentTerms: "30 jours fin de mois" },
    },
    {
      action: "POST /loading-plans",
      method: "POST",
      route: "/api/v1/loading-plans",
      payload: { reference: "PL-14E-2026" },
    },
    {
      action: "PUT /loading-plans",
      method: "PUT",
      route: "/api/v1/loading-plans",
      payload: { reference: "PL-13E-2026" },
      oldValues: { status: false },
      newValues: { status: true, totalWeightKg: "95444" },
    },
    {
      action: "DELETE /loading-plans",
      method: "DELETE",
      route: "/api/v1/loading-plans",
      payload: { reference: "PL-21E-2026" },
    },
    {
      action: "POST /users/permissions",
      method: "POST",
      route: "/api/v1/users/permissions",
      payload: { module: "LOADING_PLANS", action: "UPDATE" },
    },
  ];

  for (const entree of journal) {
    const existante = await prisma.auditLog.findFirst({
      where: { action: entree.action, route: entree.route },
    });
    if (!existante) {
      await prisma.auditLog.create({
        data: {
          employeeId: lecteur ? lecteur.employe.id : null,
          action: entree.action,
          method: entree.method,
          route: entree.route,
          ipAddress: "192.168.1.24",
          payload: entree.payload,
          oldValues: entree.oldValues,
          newValues: entree.newValues,
        },
      });
    }
  }

  console.log("7. Jetons de session (exemple)");
  const admin = await prisma.employee.findUnique({
    where: { email: process.env.ADMIN_EMAIL || "admin@lct.mg" },
  });
  if (admin) {
    const famille = "demo-famille-0001";
    const existant = await prisma.refreshToken.findFirst({
      where: { familyId: famille },
    });
    if (!existant) {
      await prisma.refreshToken.create({
        data: {
          employeeId: admin.id,
          tokenHash:
            "0000000000000000000000000000000000000000000000000000000000000000",
          familyId: famille,
          jti: "demo-jti-0001",
          expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000),
          lastUsedAt: new Date(),
        },
      });
      await prisma.refreshToken.create({
        data: {
          employeeId: admin.id,
          tokenHash:
            "1111111111111111111111111111111111111111111111111111111111111111",
          familyId: famille,
          jti: "demo-jti-0002",
          expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000),
          revokedAt: new Date(),
          revokedReason: "Rotation",
        },
      });
    }
  }

  console.log("✅ Jeu de démonstration complet.");
  console.log("   Contenu des tables :");
  for (const [table, modele] of TABLES) {
    const total = await prisma[modele].count();
    console.log(`     ${table.padEnd(22)} ${total}`);
  }
  console.log(
    `   Mot de passe des employés de démonstration : ${MOT_DE_PASSE_DEMO}`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

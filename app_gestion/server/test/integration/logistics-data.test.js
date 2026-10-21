const test = require("node:test");
const assert = require("node:assert/strict");
require("dotenv").config({ path: ".env.development" });
require("dotenv").config();

const { PrismaClient } = require("../../src/generated/prisma");
const { PrismaPg } = require("@prisma/adapter-pg");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

test.after(async () => {
  await prisma.$disconnect();
});

test("le referentiel de l'entreprise est complet", async () => {
  const [departements, postes, employes, clients, modules] = await Promise.all([
    prisma.department.count(),
    prisma.position.count(),
    prisma.employee.count(),
    prisma.client.count(),
    prisma.appModule.count(),
  ]);

  assert.ok(departements >= 5);
  assert.ok(postes >= 14);
  assert.ok(employes >= 16);
  assert.ok(clients >= 14);
  assert.ok(modules >= 12);
});

test("le referentiel maritime couvre les ports, les navires et les voyages", async () => {
  const [ports, navires, voyages] = await Promise.all([
    prisma.port.count(),
    prisma.vessel.count(),
    prisma.voyage.count({ where: { deletedAt: null } }),
  ]);

  assert.ok(ports >= 6);
  assert.ok(navires >= 3);
  assert.ok(voyages >= 16);
});

test("les voyages couvrent une annee et demie d'exploitation", async () => {
  const voyages = await prisma.voyage.findMany({
    where: { deletedAt: null },
    select: { status: true, departureDate: true },
  });

  const termines = voyages.filter((v) => v.status === "ARRIVED");
  const enCours = voyages.filter((v) => v.status === "IN_TRANSIT");
  const aVenir = voyages.filter((v) => v.status === "SCHEDULED");

  assert.ok(termines.length >= 10, "des voyages termines sont attendus");
  assert.equal(enCours.length, 1, "un seul voyage est en cours");
  assert.ok(aVenir.length >= 3, "des voyages a venir sont attendus");

  const plusAncien = termines.reduce(
    (min, v) => (min === null || v.departureDate < min ? v.departureDate : min),
    null,
  );
  const plusRecent = aVenir.reduce(
    (max, v) => (max === null || v.departureDate > max ? v.departureDate : max),
    null,
  );
  const ecartJours =
    (plusRecent.getTime() - plusAncien.getTime()) / (24 * 60 * 60 * 1000);

  assert.ok(ecartJours > 400, "l'historique doit couvrir plus d'un an");
  assert.ok(plusAncien < new Date(), "aucun voyage termine ne peut etre a venir");
});

test("un plan de chargement valide a genere son plan de dechargement", async () => {
  const plans = await prisma.loadingPlan.findMany({
    where: { operationType: "LOAD", status: true, deletedAt: null },
    include: { sourceLoadingPlan: true },
  });

  assert.ok(plans.length >= 10);
  for (const plan of plans) {
    const dechargement = await prisma.loadingPlan.findUnique({
      where: { sourceLoadingPlanId: plan.id },
    });
    assert.ok(
      dechargement,
      `le plan ${plan.reference} doit avoir un plan de dechargement`,
    );
  }
});

test("les marchandises d'un voyage en route ne sont pas encore dechargees", async () => {
  const voyage = await prisma.voyage.findFirst({
    where: { status: "IN_TRANSIT", deletedAt: null },
  });
  assert.ok(voyage, "un voyage doit etre en route");

  const plan = await prisma.loadingPlan.findFirst({
    where: { voyageId: voyage.id, operationType: "UNLOAD" },
  });
  assert.ok(plan, "le plan de dechargement doit exister");
  assert.equal(plan.status, false, "le dechargement n'est pas termine");

  const lignes = await prisma.load.findMany({
    where: { loadingPlanId: plan.id, deletedAt: null },
  });
  assert.ok(lignes.every((ligne) => ligne.status === "PENDING"));
});

test("le total d'un plan correspond a la somme de ses lignes", async () => {
  const plans = await prisma.loadingPlan.findMany({
    where: { operationType: "LOAD", deletedAt: null },
    include: { loads: { where: { deletedAt: null } } },
  });

  for (const plan of plans) {
    const somme = plan.loads
      .filter((ligne) => ligne.status !== "CANCELLED")
      .reduce((total, ligne) => total + Number(ligne.weightKg), 0);
    assert.equal(
      Number(plan.totalWeightKg),
      somme,
      `le total du plan ${plan.reference} est incoherent`,
    );
  }
});

test("les marchandises en entrepot proviennent d'un dechargement valide", async () => {
  const articles = await prisma.warehouseItem.findMany({
    where: { deletedAt: null },
    include: { load: { include: { loadingPlan: true } } },
  });

  assert.ok(articles.length >= 4);
  for (const article of articles) {
    assert.ok(article.loadId, "chaque marchandise garde sa provenance");
    assert.equal(article.load.loadingPlan.operationType, "UNLOAD");
    assert.equal(article.load.loadingPlan.status, true);
  }
});

test("le stock comporte des sorties de chaque nature", async () => {
  const articles = await prisma.warehouseItem.findMany({
    where: { deletedAt: null },
    select: { status: true },
  });

  const statuts = new Set(articles.map((article) => article.status));
  assert.ok(statuts.has("IN_STOCK"), "des marchandises attendent en entrepot");
  assert.ok(statuts.has("PICKED_UP"), "une marchandise a ete retiree");
  assert.ok(statuts.has("EMBARKED"), "une marchandise a ete reembarquee");
});

test("les poids a confirmer sont marques comme tels", async () => {
  const lignes = await prisma.load.findMany({
    where: { deletedAt: null, anomaly: { not: null } },
  });

  assert.equal(lignes.length, 2);
  for (const ligne of lignes) {
    assert.equal(ligne.status, "PENDING");
    // L'interface de programmation refuse un poids nul : la marchandise
    // porte une estimation, signalee comme a confirmer au pesage.
    assert.ok(ligne.weightKg.toNumber() > 0);
    assert.match(ligne.anomaly, /confirmer/i);
  }
});

test("les positions de chargement designent les quais de Toamasina", async () => {
  const lignes = await prisma.load.findMany({
    where: { deletedAt: null },
    select: { loadingPosition: true },
  });

  const quais = new Set(lignes.map((ligne) => ligne.loadingPosition));
  for (const quai of quais) {
    assert.ok(
      ["QUAI 1", "QUAI 2", "QUAI 3"].includes(quai),
      `le quai ${quai} n'est pas un quai de Toamasina`,
    );
  }
});

test("les demandes d'acces concernent des employes sans acces", async () => {
  const demandes = await prisma.notification.findMany({
    where: { type: "ACCESS_REQUEST" },
  });

  assert.equal(demandes.length, 3);
  for (const demande of demandes) {
    const employe = await prisma.employee.findUnique({
      where: { id: demande.payload.employeeId },
    });
    assert.ok(employe);
    assert.equal(employe.hasAppAccess, false);
  }
});

test("le journal d'audit retrace l'exploitation", async () => {
  const entrees = await prisma.auditLog.findMany({
    orderBy: { createdAt: "asc" },
  });

  assert.ok(entrees.length >= 80, "l'historique doit etre fourni");
  assert.ok(
    entrees.some((entree) => entree.action === "POST_LOADING-PLANS"),
    "des plans de manutention ont ete saisis",
  );
  assert.ok(
    entrees.some((entree) => entree.action === "PUT_LOADING-PLANS"),
    "des plans de manutention ont ete valides",
  );
  assert.ok(
    entrees.every((entree) => entree.createdAt <= new Date()),
    "aucune operation ne peut etre datee dans le futur",
  );
});

test("le seed est rejouable sans dupliquer les referentiels", async () => {
  const [plans, navires, ports] = await Promise.all([
    prisma.loadingPlan.count({ where: { reference: "PL-2026-00111" } }),
    prisma.vessel.count({ where: { registrationNumber: "MG-LCT-AZAD" } }),
    prisma.port.count({ where: { code: "MGTOA" } }),
  ]);

  assert.equal(plans, 1);
  assert.equal(navires, 1);
  assert.equal(ports, 1);
});

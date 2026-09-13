require("dotenv").config({ path: ".env.development" });

const test = require("node:test");
const assert = require("node:assert/strict");
const { PrismaClient } = require("../../src/generated/prisma");
const { PrismaPg } = require("@prisma/adapter-pg");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

test.after(async () => {
  await prisma.$disconnect();
});

test("les données logistiques de démonstration sont présentes", async () => {
  const [vessels, ports, voyages, vehicles, clients, drivers, plans, lines] =
    await Promise.all([
      prisma.vessel.count(),
      prisma.port.count(),
      prisma.voyage.count(),
      prisma.vehicle.count(),
      prisma.client.count(),
      prisma.driver.count(),
      prisma.loadingPlan.count(),
      prisma.cargoLine.count(),
    ]);

  assert.ok(vessels >= 2);
  assert.ok(ports >= 4);
  assert.ok(voyages >= 3);
  assert.ok(vehicles >= 5);
  assert.ok(clients >= 7);
  assert.ok(drivers >= 6);
  assert.ok(plans >= 3);
  assert.ok(lines >= 16);
});

test("le plan de référence conserve le total attendu", async () => {
  const plan = await prisma.loadingPlan.findUnique({
    where: { reference: "PL-13E-2026" },
    include: { cargoLines: true },
  });

  assert.ok(plan, "Le plan PL-13E-2026 doit exister");
  assert.equal(plan.status, "SUBMITTED");
  assert.equal(plan.totalWeightKg.toString(), "95444");
  assert.equal(plan.cargoLines.length, 11);
});

test("le seed est rejouable sans dupliquer les référentiels", async () => {
  const [referencePlans, referenceVessels, referencePorts] = await Promise.all([
    prisma.loadingPlan.count({ where: { reference: "PL-13E-2026" } }),
    prisma.vessel.count({ where: { registrationNumber: "MG-LCT-AZAD" } }),
    prisma.port.count({ where: { code: "MGTOA" } }),
  ]);

  assert.equal(referencePlans, 1);
  assert.equal(referenceVessels, 1);
  assert.equal(referencePorts, 1);
});

test("les poids à confirmer du document sont identifiés comme lignes en attente", async () => {
  const pendingLines = await prisma.cargoLine.findMany({
    where: {
      loadingPlan: { reference: "PL-13E-2026" },
      status: "PENDING",
    },
  });

  assert.equal(pendingLines.length, 2);
  assert.ok(pendingLines.every((line) => line.anomaly));
});

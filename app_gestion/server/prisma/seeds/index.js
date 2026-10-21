// prisma/seeds/index.js
// Orchestration des scripts de donnees de reference.
//
//   node prisma/seeds/index.js            jeu complet (structure et exploitation)
//   node prisma/seeds/index.js --base     socle minimal (structure, modules, acces)
//   node prisma/seeds/index.js --reset    vide les tables avant de rejouer
require("dotenv").config({ path: ".env.development" });
require("dotenv").config();

const { PrismaClient, Prisma } = require("../../src/generated/prisma");
const { PrismaPg } = require("@prisma/adapter-pg");

const structure = require("./00_structure");
const modules = require("./01_modules");
const employes = require("./02_employes");
const clients = require("./03_clients");
const maritime = require("./04_maritime");
const manutention = require("./05_manutention");
const entrepot = require("./06_entrepot");
const suivi = require("./07_suivi");

const argumentsProcess = process.argv.slice(2);
const seulementBase = argumentsProcess.includes("--base");
const vider = argumentsProcess.includes("--reset");

const TABLES = [
  "notification_reads",
  "notifications",
  "audit_logs",
  "refresh_tokens",
  "warehouse_movements",
  "warehouse_items",
  "warehouses",
  "loads",
  "loading_plans",
  "voyages",
  "vessels",
  "ports",
  "client_addresses",
  "clients",
  "employee_permissions",
  "employees",
  "app_modules",
  "positions",
  "departments",
];

async function viderLesTables(prisma) {
  await prisma.$executeRawUnsafe(
    `TRUNCATE TABLE ${TABLES.map((t) => `"${t}"`).join(", ")} RESTART IDENTITY CASCADE;`,
  );
}

async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });

  console.log("🌾 Jeu de donnees de reference");
  console.log(`   base : ${prisma ? "connectee" : ""}`);

  if (vider) {
    await viderLesTables(prisma);
    console.log("   tables videes");
  }

  await structure.run(prisma);
  await modules.run(prisma);

  const employesCrees = await employes.run(prisma);

  if (seulementBase) {
    console.log("✅ Socle minimal installe.");
    await prisma.$disconnect();
    return;
  }

  const clientsCrees = await clients.run(prisma);
  const voyages = await maritime.run(prisma);
  const plansCrees = await manutention.run(prisma, {
    voyages,
    clientsCrees,
    employesCrees,
  });
  await entrepot.run(prisma, { plansCrees, clientsCrees, employesCrees });
  await suivi.run(prisma, { plansCrees, clientsCrees, employesCrees, voyages });

  console.log("✅ Jeu de donnees complet installe.");
  await prisma.$disconnect();
}

main().catch((erreur) => {
  console.error(erreur);
  process.exit(1);
});

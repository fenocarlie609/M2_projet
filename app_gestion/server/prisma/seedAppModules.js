// prisma/seedAppModules.js
// ⚠️ Complète cette liste avec les vraies valeurs de ton
// src/common/utils/constants.js (APP_MODULES). Ce fichier n'est qu'un
// gabarit avec quelques exemples devinés depuis le reste du code.
require("dotenv").config({ path: ".env.development" });
const { PrismaClient } = require("../src/generated/prisma");
const { PrismaPg } = require("@prisma/adapter-pg");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const modules = [
    { code: "*", label: "Tous les modules (super-accès)" },
    { code: "EMPLOYEES", label: "Employés" },
    { code: "USERS", label: "Utilisateurs & Accès" },
    { code: "DEPARTMENTS", label: "Départements & Postes" },
    // TODO: ajouter les autres modules réels (ex: "CHARGEMENT", "AUDIT", ...)
  ];

  for (const m of modules) {
    await prisma.appModule.upsert({
      where: { code: m.code },
      update: { label: m.label },
      create: m,
    });
  }

  console.log("✅ Modules applicatifs insérés.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

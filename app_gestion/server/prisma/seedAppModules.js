// prisma/seedAppModules.js
// Catalogue des modules de permissions.
//
// La liste ci-dessous reprend exactement les codes de modules verifies par
// l'interface de programmation (middleware authorize) et par l'interface
// (routeConfig). Ajouter un module ici a pour effet de le rendre
// attribuable aux employes ; un code absent ici ne peut pas etre coche
// dans l'ecran de gestion des permissions.
// L'environnement de developpement est prioritaire ; en conteneur, les
// variables proviennent de l'orchestrateur.
require("dotenv").config({ path: ".env.development" });
require("dotenv").config();
const { PrismaClient } = require("../src/generated/prisma");
const { PrismaPg } = require("@prisma/adapter-pg");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const modules = [
    { code: "*", label: "Tous les modules (super-accès)" },
    { code: "EMPLOYEES", label: "Employés" },
    { code: "USERS", label: "Utilisateurs & Accès" },
    { code: "COMPANY_STRUCTURE", label: "Structure de l'entreprise" },
    { code: "MODULE", label: "Modules de permissions" },
    { code: "CLIENT", label: "Clients" },
    { code: "VESSELS", label: "Navires" },
    { code: "PORTS", label: "Ports" },
    { code: "VOYAGES", label: "Voyages maritimes" },
    { code: "LOADING_PLANS", label: "Plans de manutention" },
    { code: "CARGO", label: "Marchandises" },
  ];

  for (const m of modules) {
    await prisma.appModule.upsert({
      where: { code: m.code },
      update: { label: m.label },
      create: m,
    });
  }

  // Les modules devenus inutiles sont retires du catalogue.
  const obsolete = await prisma.appModule.findMany({
    where: { code: { notIn: modules.map((m) => m.code) } },
  });
  for (const module of obsolete) {
    await prisma.appModule.delete({ where: { id: module.id } });
  }

  console.log(`✅ ${modules.length} modules applicatifs insérés.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

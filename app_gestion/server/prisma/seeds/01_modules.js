// prisma/seeds/01_modules.js
// Catalogue des modules de permissions.
// La liste reprend exactement les codes verifies par l'interface de
// programmation (middleware authorize) et par l'interface (routeConfig).
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
  { code: "ENTREPOTS", label: "Entrepôts & stock" },
];

async function run(prisma) {
  for (const module of modules) {
    await prisma.appModule.upsert({
      where: { code: module.code },
      update: { label: module.label },
      create: module,
    });
  }

  // Les modules devenus inutiles sont retires du catalogue.
  const obsoletes = await prisma.appModule.findMany({
    where: { code: { notIn: modules.map((m) => m.code) } },
  });
  for (const module of obsoletes) {
    await prisma.appModule.delete({ where: { id: module.id } });
  }

  console.log(`   modules : ${modules.length} modules de permissions`);
}

module.exports = { run, modules };

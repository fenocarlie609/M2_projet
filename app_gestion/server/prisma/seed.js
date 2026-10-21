// prisma/seed.js
// L'environnement de developpement est prioritaire ; en conteneur, les
// variables proviennent de l'orchestrateur.
require("dotenv").config({ path: ".env.development" });
require("dotenv").config(); // Charge DATABASE_URL sans passer par le wrapper npx dotenv
const { PrismaClient } = require("../src/generated/prisma"); // Adapté selon ton output personnalisé
const { PrismaPg } = require("@prisma/adapter-pg");

// Prisma 7 a supprimé le moteur de connexion intégré : il faut désormais
// fournir explicitement un adapter de driver (ici pg pour PostgreSQL).
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const structure = [
    {
      code: "LOGISTICS",
      label: "Logistique & Opérations Maritimes",
      positions: [
        { code: "QUAY_AGENT", label: "Agent de quai" },
        { code: "CREW_MEMBER", label: "Membre d'équipage" },
        { code: "FLEET_MGR", label: "Gestionnaire de flotte" },
        { code: "LOGISTICS_COORD", label: "Coordinateur logistique" },
      ],
    },
    {
      code: "ADMIN",
      label: "Administration & RH",
      positions: [
        { code: "HR_MGR", label: "Responsable Ressources Humaines" },
        { code: "ADMIN_ASST", label: "Assistant administratif" },
        { code: "DIRECTOR", label: "Directeur des opérations" },
      ],
    },
    {
      code: "FINANCE",
      label: "Finance & Comptabilité",
      positions: [
        { code: "ACCOUNTANT", label: "Comptable" },
        { code: "FINANCIAL_ANALYST", label: "Analyste financier" },
      ],
    },
    {
      code: "TECH",
      label: "Technologie & Systèmes",
      positions: [
        { code: "SOFTWARE_ENG", label: "Ingénieur Logiciel" },
        { code: "SYS_ADMIN", label: "Administrateur Système / Réseau" },
        { code: "DBA", label: "Administrateur de Base de Données" },
      ],
    },
    {
      code: "COMMERCIAL",
      label: "Commercial & Relation Client",
      positions: [
        { code: "SALES_REPRESENTATIVE", label: "Chargé de clientèle" },
        { code: "COMMERCIAL_MGR", label: "Responsable Commercial" },
      ],
    },
  ];

  console.log("🌱 Début du seed de l'architecture d'entreprise...");

  for (const dept of structure) {
    await prisma.department.upsert({
      where: { code: dept.code },
      update: { label: dept.label },
      create: {
        code: dept.code,
        label: dept.label,
        positions: {
          create: dept.positions.map((pos) => ({
            code: pos.code,
            label: pos.label,
          })),
        },
      },
    });
  }

  console.log("✅ Seed de l'architecture d'entreprise terminé !");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

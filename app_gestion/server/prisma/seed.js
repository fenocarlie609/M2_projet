// prisma/seed.js
require("dotenv").config({ path: ".env.development" });
require("dotenv").config();
const { PrismaClient } = require("../src/generated/prisma"); // Adapté selon ton output personnalisé
const { PrismaPg } = require("@prisma/adapter-pg");
const { structure } = require("./structure");

// Prisma 7 a supprimé le moteur de connexion intégré : il faut désormais
// fournir explicitement un adapter de driver (ici pg pour PostgreSQL).
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
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

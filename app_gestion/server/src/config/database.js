// src/config/database.js
// 1. Import des dépendances nécessaires
const { Pool } = require("pg");
const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient } = require("../generated/prisma");
const logger = require("./logger");

// 2. Configuration du pool de connexion PostgreSQL natif
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// 3. Création de l'adaptateur requis par Prisma v7
const adapter = new PrismaPg(pool);

// 4. Instanciation de base de Prisma
const basePrisma = new PrismaClient({
  adapter: adapter,
  log:
    process.env.NODE_ENV === "development"
      ? ["query", "info", "warn", "error"]
      : ["error", "warn"],
});

// 5. Remplacement du middleware $use par les extensions Prisma v7
const prisma =
  process.env.NODE_ENV === "development"
    ? basePrisma.$extends({
        query: {
          $allModels: {
            async $allOperations({ model, operation, args, query }) {
              const start = Date.now();
              const result = await query(args);
              const duration = Date.now() - start;

              logger.info(
                `Prisma Query: ${model}.${operation} - Exécutée en ${duration}ms`,
              );
              return result;
            },
          },
        },
      })
    : basePrisma;

// 6. Fonction pour tester proprement la connexion au démarrage du serveur principal
const connectDB = async () => {
  try {
    // Note : On utilise basePrisma ici pour le pont de connexion initial
    await basePrisma.$connect();
    logger.info(
      "Connexion à la base de données PostgreSQL réussie via Prisma. 🐘",
    );
  } catch (error) {
    logger.error(
      "Impossible de se connecter à la base de données PostgreSQL ! 💥",
    );
    logger.error(error);
    process.exit(1);
  }
};

// On exporte l'instance "prisma" (éventuellement étendue) et la fonction connectDB
module.exports = {
  prisma,
  connectDB,
};

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

// 4. Instanciation de base de Prisma (Instancié UNE SEULE fois pour l'application)
const basePrisma = new PrismaClient({
  adapter: adapter,
  log:
    process.env.NODE_ENV === "development"
      ? ["info", "warn", "error"]
      : ["error", "warn"],
});

// 5. Extension Prisma v7 : mesure de performance uniquement.
// L'audit trail est désormais géré globalement par
// src/common/middlewares/audit.middleware.js (auditTrail), qui intercepte
// chaque requête HTTP mutante. On NE réécrit PAS de ligne audit_logs ici pour
// éviter un double enregistrement (un via cette extension, un via le middleware).
const prisma = basePrisma.$extends({
  query: {
    $allOperations: async ({ model, operation, args, query }) => {
      const start = Date.now();

      // On nettoie une éventuelle propriété "context" restée dans d'anciens
      // appels de service, pour ne pas faire échouer le validateur strict de Prisma.
      if (args.context) {
        delete args.context;
      }

      const result = await query(args);

      if (process.env.NODE_ENV === "development") {
        const duration = Date.now() - start;
        logger.info(
          `Prisma Query: ${model}.${operation} - Exécutée en ${duration}ms`,
        );
      }

      return result;
    },
  },
});

// 6. Fonction pour tester proprement la connexion au démarrage du serveur principal
const connectDB = async () => {
  try {
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

module.exports = {
  prisma,
  connectDB,
};

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
      ? ["info", "warn", "error"] // On évite de dupliquer "query" car l'extension s'en charge
      : ["error", "warn"],
});

// 5. Remplacement des middlewares par les extensions Prisma v7
// Actif sur tous les environnements pour capturer l'audit et mesurer les performances
const prisma = basePrisma.$extends({
  query: {
    // Écoute absolument toutes les opérations sur tous les modèles
    $allOperations: async ({ model, operation, args, query }) => {
      const start = Date.now();

      // EXTRACTION ET NETTOYAGE DU CONTEXTE D'AUDIT
      // On récupère le contexte passé depuis le service s'il existe
      const auditContext = args.context;

      // CRUCIAL : On supprime la propriété 'context' de l'objet args.
      // Si on la laisse, le validateur strict de Prisma lève une exception 'PrismaClientValidationError'
      if (args.context) {
        delete args.context;
      }

      // Exécution de la requête SQL normale (Valide pour Prisma désormais)
      const result = await query(args);

      const duration = Date.now() - start;

      // 1. Log de performance (uniquement en développement pour ne pas polluer les fichiers logs de prod)
      if (process.env.NODE_ENV === "development") {
        logger.info(
          `Prisma Query: ${model}.${operation} - Exécutée en ${duration}ms`,
        );
      }

      // 2. Système d'audit (Actif en Dev et en Production)
      // Si un contexte d'audit est fourni et qu'il s'agit d'une modification de données
      if (
        auditContext &&
        ["create", "update", "delete", "updateMany", "deleteMany"].includes(
          operation,
        )
      ) {
        try {
          // Ici, tu pourras appeler ton service ou client brut pour insérer la ligne d'audit
          // Exemple :
          // await basePrisma.auditLog.create({ data: { ...auditContext, action: `${model}_${operation.toUpperCase()}` } });
        } catch (auditError) {
          // On capture l'erreur d'audit pour éviter de bloquer l'action principale de l'utilisateur
          logger.error(
            "Échec de l'enregistrement de l'audit log :",
            auditError,
          );
        }
      }

      return result;
    },
  },
});

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

// On exporte l'instance "prisma" sécurisée et la fonction connectDB
module.exports = {
  prisma,
  connectDB,
};

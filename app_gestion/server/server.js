// server.js
const path = require("path");
const dotenv = require("dotenv");

// 1. CHARGEMENT DE L'ENVIRONNEMENT EN PREMIER (Crucial !)
const environment = process.env.NODE_ENV || "development";
dotenv.config({ path: path.resolve(process.cwd(), `.env.${environment}`) });

// 2. IMPORT DES CONFIGURATIONS (Maintenant process.env.NODE_ENV est bien 'development')
const logger = require("./src/config/logger");
const { connectDB } = require("./src/config/database");

// 3. CAPTURE DES EXCEPTIONS GLOBALES (Prêt à écrire dans logs/errors.log avec le bon environnement)
process.on("uncaughtException", (err) => {
  logger.error("UNCAUGHT EXCEPTION! 💥 Arrêt du serveur...");
  logger.error(err);
  process.exit(1);
});

let server;

// 4. IMPORT DE L'APPLICATION (Une fois que tout le système de log et d'env est prêt)
const app = require("./src/app");

const PORT = process.env.PORT || 5000;

// Connexion à la base de données avant de lancer le serveur
connectDB()
  .then(() => {
    server = app.listen(PORT, () => {
      logger.info(
        `Le serveur tourne en mode [${process.env.NODE_ENV}] sur le port ${PORT}`,
      );
    });
  })
  .catch((error) => {
    logger.error("Erreur lors de la connexion à la base de données ! 💥");
    logger.error(error);
    process.exit(1);
  });

// Gestion des promesses rejetées non interceptées
process.on("unhandledRejection", (err) => {
  logger.error("UNHANDLED REJECTION! 💥 Fermeture propre du serveur...");
  logger.error(err);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

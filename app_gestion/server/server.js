// server.js
const path = require("path");
const dotenv = require("dotenv");

// 1. CHARGEMENT DE L'ENVIRONNEMENT EN PREMIER (Crucial !)
const environment = process.env.NODE_ENV || "development";
dotenv.config({ path: path.resolve(process.cwd(), `.env.${environment}`) });

// 2. IMPORT DES CONFIGURATIONS
const logger = require("./src/config/logger");
const { connectDB } = require("./src/config/database");
const { initSocket } = require("./src/config/socket");

// 3. CAPTURE DES EXCEPTIONS GLOBALES
process.on("uncaughtException", (err) => {
  logger.error("UNCAUGHT EXCEPTION! 💥 Arrêt du serveur...");
  logger.error(err);
  process.exit(1);
});

// 4. IMPORT DE L'APPLICATION
const app = require("./src/app");
const PORT = process.env.PORT || 5000;

let server; // Contiendra l'instance du serveur HTTP listen

// Connexion à la base de données avant de lancer le serveur
connectDB()
  .then(() => {
    // CORRECTION : On démarre le serveur d'abord...
    server = app.listen(PORT, () => {
      logger.info(
        `Le serveur tourne en mode [${process.env.NODE_ENV}] sur le port ${PORT}`,
      );
    });

    // ... et ON INITIALISE le socket en lui passant la vraie instance du serveur !
    initSocket(server);
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

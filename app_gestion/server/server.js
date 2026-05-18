// server.js
const path = require("path");
const dotenv = require("dotenv");
const logger = require("./src/config/logger");
const { connectDB } = require("./src/config/database");

let server;

// Gestion des erreurs de syntaxe ou variables indéfinies synchrones (Uncaught Exceptions)
process.on("uncaughtException", (err) => {
  logger.error("UNCAUGHT EXCEPTION! 💥 Arrêt du serveur...");
  logger.error(err);
  process.exit(1);
});

// Chargement du fichier .env correspondant à NODE_ENV (par défaut development)
const environment = process.env.NODE_ENV || "development";
dotenv.config({ path: path.resolve(process.cwd(), `.env.${environment}`) });

const app = require("./src/app");

const PORT = process.env.PORT || 5000;

// Connect to the database before starting the server
connectDB()
  .then(() => {
    server = app.listen(PORT, () => {
      // On réaffecte sans 'const'
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

// Gestion des promesses rejetées non interceptées (Unhandled Rejections)
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

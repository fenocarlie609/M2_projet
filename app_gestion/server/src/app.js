// src/app.js
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mongoSanitize = require("express-mongo-sanitize");

const { errorHandler } = require("./common/middlewares/error.middleware");
const auditTrail = require("./common/middlewares/audit.middleware");
const { appLimiter } = require("./config/security");
const apiRoutes = require("./modules/_routes");
const logger = require("./config/logger");

const app = express();

// 1. CONFIANCE AU PROXY (Essentiel en production derrière un reverse proxy comme Nginx ou un hébergeur)
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

// 2. MIDDLEWARES DE SÉCURITÉ GLOBAUX

// Configuration de Helmet pour sécuriser les headers HTTP
app.use(helmet());

// Configuration de CORS (Cross-Origin Resource Sharing)
app.use(
  cors({
    origin: process.env.CLIENT_URL, // Autorise uniquement ton application Frontend
    credentials: true, // Autorise l'envoi et la réception des cookies httpOnly signés
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token"],
  }),
);

// Application du Rate Limiting global sur toutes les routes de l'API
app.use("/api", appLimiter);

// Parseurs de requêtes avec limitation stricte de la taille du body (évite les surcharges/DoS)
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// Parseur de cookies indispensable pour la gestion sécurisée du JWT (avec clé de signature)
app.use(cookieParser(process.env.COOKIE_SECRET));

// Assainissement des données entrantes (Sanitization) contre les injections de caractères suspects
app.use(mongoSanitize());

// 3. LOG TRACEUR DES REQUÊTES ENTRANTES (Winston)
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.originalUrl} - IP: ${req.ip}`);
  next();
});

// Activation de l'Audit Trail global (Log automatique des POST, PUT, DELETE)
app.use(auditTrail());

// 4. ROUTAGE CENTRAL
app.use("/api/v1", apiRoutes);

// Gestion globale des routes non trouvées (Renvoie vers le middleware d'erreur avec un 404)
app.use((req, res, next) => {
  const error = new Error(`Route non trouvée - ${req.originalUrl}`);
  res.status(404);
  next(error);
});

// 5. INTERCEPTEUR ET GESTIONNAIRE CENTRALISÉ DES ERREURS
app.use(errorHandler);

module.exports = app;

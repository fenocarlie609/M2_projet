// src/app.js
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");

const { errorHandler } = require("./common/middlewares/error.middleware");
const auditTrail = require("./common/middlewares/audit.middleware");
const { appLimiter } = require("./config/security");
const apiRoutes = require("./modules/_routes");
const logger = require("./config/logger");
const AppError = require("./common/utils/AppError");

const app = express();
const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";

if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

app.use(helmet());

app.use(
  cors({
    origin: clientUrl,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token"],
  }),
);

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

// CORRECTION : servir les fichiers statiques (photos uploadées) AVANT le
// catch-all 404 et errorHandler, sinon express.static n'est jamais atteint.
app.use("/uploads", express.static(path.join(__dirname, "../public/uploads")));

// Application du Rate Limiting global sur toutes les routes de l'API
app.use("/api", appLimiter);

// Parseurs de requêtes avec limitation stricte de la taille du body (évite les surcharges/DoS)
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// Parseur de cookies indispensable pour la gestion sécurisée du JWT (avec clé de signature)
app.use(cookieParser(process.env.COOKIE_SECRET));

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
  next(new AppError(`Route non trouvée - ${req.originalUrl}`, 404));
});

// 5. INTERCEPTEUR ET GESTIONNAIRE CENTRALISÉ DES ERREURS
app.use(errorHandler);

module.exports = app;

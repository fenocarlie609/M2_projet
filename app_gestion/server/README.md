# 🚀 App Gestion - Backend (Server)

Architecture modulaire Node.js + Express + Prisma pour une API RESTful scalable et maintenable.

## 🏗️ Structure du Projet

```
server/
├── src/
│   ├── app.js                    # Configuration Express
│   │
│   ├── config/                   # Configuration globale
│   │   ├── database.js           # Connexion Prisma
│   │   ├── logger.js             # Système de logs
│   │   └── security.js           # JWT, bcrypt, CORS
│   │
│   ├── common/                   # Code partagé
│   │   ├── middlewares/
│   │   │   ├── errorHandler.js   # Gestion erreurs centralisée
│   │   │   ├── authenticate.js   # Vérification JWT
│   │   │   ├── authorization.js  # Vérification rôles
│   │   │   └── validation.js     # Validation requêtes
│   │   └── utils/
│   │       ├── AppError.js       # Classe erreur personnalisée
│   │       ├── comparePassword.js
│   │       └── (autres utilitaires)
│   │
│   ├── modules/                  # Modules fonctionnels
│   │   ├── _routes.js            # Agrégation toutes les routes
│   │   │
│   │   ├── auth/                 # Module authentification
│   │   │   ├── auth.controller.js   # Handlers HTTP
│   │   │   ├── auth.service.js      # Logique métier
│   │   │   ├── auth.routes.js       # Endpoints
│   │   │   ├── auth.validation.js   # Schémas validation
│   │   │   └── auth.limiter.js      # Rate limiting
│   │   │
│   │   ├── users/                # Module utilisateurs
│   │   │   ├── users.controller.js
│   │   │   ├── users.service.js
│   │   │   ├── users.routes.js
│   │   │   ├── users.validation.js
│   │   │   └── index.js           # Barrel export
│   │   │
│   │   ├── boats/ (exemple)      # Nouveau module
│   │   │   ├── boats.controller.js
│   │   │   ├── boats.service.js
│   │   │   ├── boats.routes.js
│   │   │   ├── boats.validation.js
│   │   │   └── index.js
│   │   │
│   │   └── [autres modules]
│   │
│   └── generated/
│       └── prisma/               # Client Prisma généré
│
├── prisma/
│   ├── schema.prisma             # Modèles de données
│   └── migrations/               # Historique migrations
│
├── server.js                     # Entry point
└── package.json
```

## 🎯 Principes d'Architecture

### 1. **Séparation des Responsabilités**

Chaque module respecte:

- **Controller**: Gestion HTTP (req/res)
- **Service**: Logique métier
- **Routes**: Endpoints et middlewares
- **Validation**: Schémas et vérifications

### 2. **Gestion Centralisée des Erreurs**

```javascript
// Utiliser AppError pour erreurs contrôlées
if (!user) {
  throw new AppError("Utilisateur non trouvé", 404);
}

// Le middleware errorHandler capture et répond
```

### 3. **Middleware Stack**

1. Logging
2. CORS
3. Body Parser
4. Authentification
5. Autorisation (par route)
6. Rate Limiting (par endpoint)
7. Validation (par route)
8. Handlers métier
9. Error Handler (au final)

## 🚀 Comment Ajouter un Nouveau Module

### Exemple: Créer un module "Boats"

#### 1. Ajouter le modèle Prisma (`prisma/schema.prisma`)

```prisma
model Boat {
  id        Int     @id @default(autoincrement())
  name      String  @unique
  mmsi      String  @unique
  flag      String
  status    String  @default("active")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("boats")
}
```

#### 2. Créer migration

```bash
npx prisma migrate dev --name add_boats
```

#### 3. Créer le controller (`boats.controller.js`)

```javascript
import { boatsService } from "./boats.service.js";
import { AppError } from "../../common/utils/AppError.js";

export const boatsController = {
  // GET /boats
  getAll: async (req, res, next) => {
    try {
      const boats = await boatsService.getAll();
      res.status(200).json({
        success: true,
        data: boats,
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /boats/:id
  getById: async (req, res, next) => {
    try {
      const boat = await boatsService.getById(parseInt(req.params.id));
      if (!boat) {
        throw new AppError("Navire non trouvé", 404);
      }
      res.status(200).json({
        success: true,
        data: boat,
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /boats
  create: async (req, res, next) => {
    try {
      const boat = await boatsService.create(req.body);
      res.status(201).json({
        success: true,
        data: boat,
      });
    } catch (error) {
      next(error);
    }
  },

  // PUT /boats/:id
  update: async (req, res, next) => {
    try {
      const boat = await boatsService.update(parseInt(req.params.id), req.body);
      res.status(200).json({
        success: true,
        data: boat,
      });
    } catch (error) {
      next(error);
    }
  },

  // DELETE /boats/:id
  delete: async (req, res, next) => {
    try {
      await boatsService.delete(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
};
```

#### 4. Créer le service (`boats.service.js`)

```javascript
import prisma from "../../config/database.js";
import { AppError } from "../../common/utils/AppError.js";

export const boatsService = {
  async getAll() {
    return await prisma.boat.findMany();
  },

  async getById(id) {
    return await prisma.boat.findUnique({
      where: { id },
    });
  },

  async create(data) {
    // Vérifier doublon
    const existing = await prisma.boat.findUnique({
      where: { mmsi: data.mmsi },
    });
    if (existing) {
      throw new AppError("MMSI déjà enregistré", 400);
    }

    return await prisma.boat.create({
      data,
    });
  },

  async update(id, data) {
    return await prisma.boat.update({
      where: { id },
      data,
    });
  },

  async delete(id) {
    return await prisma.boat.delete({
      where: { id },
    });
  },
};
```

#### 5. Créer la validation (`boats.validation.js`)

```javascript
export const boatsValidation = {
  create: {
    body: {
      name: { type: String, required: true },
      mmsi: { type: String, required: true, unique: true },
      flag: { type: String, required: true },
      status: { type: String, enum: ["active", "inactive"] },
    },
  },
  update: {
    body: {
      name: { type: String },
      status: { type: String, enum: ["active", "inactive"] },
    },
  },
};
```

#### 6. Créer les routes (`boats.routes.js`)

```javascript
import { Router } from "express";
import { boatsController } from "./boats.controller.js";
import { protect } from "../../common/middlewares/authenticate.js";
import { authorize } from "../../common/middlewares/authorization.js";

export const boatsRoutes = Router();

// Toutes les routes protégées
boatsRoutes.use(protect);

// GET /api/v1/boats
boatsRoutes.get("/", boatsController.getAll);

// GET /api/v1/boats/:id
boatsRoutes.get("/:id", boatsController.getById);

// POST /api/v1/boats (admin seulement)
boatsRoutes.post(
  "/",
  authorize(["admin", "superadmin"]),
  boatsController.create,
);

// PUT /api/v1/boats/:id (admin seulement)
boatsRoutes.put(
  "/:id",
  authorize(["admin", "superadmin"]),
  boatsController.update,
);

// DELETE /api/v1/boats/:id (superadmin seulement)
boatsRoutes.delete("/:id", authorize(["superadmin"]), boatsController.delete);

export default boatsRoutes;
```

#### 7. Créer barrel export (`index.js`)

```javascript
export { boatsRoutes } from "./boats.routes.js";
export { boatsController } from "./boats.controller.js";
export { boatsService } from "./boats.service.js";
```

#### 8. Ajouter les routes dans `_routes.js`

```javascript
import { boatsRoutes } from "./boats/index.js";

export const setupRoutes = (app) => {
  // Autres modules...
  app.use("/api/v1/boats", boatsRoutes);
};
```

## 🔐 Authentification & Autorisation

### Middleware Protect (Vérifier Token JWT)

```javascript
import { protect } from "@/common/middlewares/authenticate";

// Route protégée
router.get("/profile", protect, controller.getProfile);
// ✅ Token valide → accès accordé
// ❌ Pas de token → 401 Unauthorized
```

### Middleware Authorize (Vérifier Rôles)

```javascript
import { authorize } from "@/common/middlewares/authorization";

// Admin ou SuperAdmin seulement
router.post("/users", authorize(["admin", "superadmin"]), controller.create);
// ✅ user.role = "admin" → accès accordé
// ❌ user.role = "user" → 403 Forbidden
```

## 💾 Prisma ORM

### Commandes Utiles

```bash
# Voir état des migrations
npx prisma migrate status

# Créer nouvelle migration
npx prisma migrate dev --name [description]

# Appliquer migrations (prod)
npx prisma migrate deploy

# Reset DB (DEV ONLY!)
npx prisma migrate reset

# Ouvrir Prisma Studio (UI données)
npx prisma studio
```

### Utilisation dans les Services

```javascript
import prisma from "@/config/database";

// CRUD de base
await prisma.user.create({ data });
await prisma.user.findMany();
await prisma.user.findUnique({ where: { id } });
await prisma.user.update({ where: { id }, data });
await prisma.user.delete({ where: { id } });

// Avec relations
await prisma.user.findUnique({
  where: { id },
  include: { boats: true, logs: true },
});

// Transactions
await prisma.$transaction([
  prisma.user.create({ data: userData }),
  prisma.log.create({ data: logData }),
]);
```

## 🔒 Configuration Sécurité

### Variables Environnement (`.env`)

```env
DATABASE_URL=postgresql://user:pass@localhost:5432/app_gestion
JWT_SECRET=your_secret_key_here
JWT_EXPIRES_IN=15m
NODE_ENV=development
PORT=5000
```

### Rate Limiting

```javascript
// Défini par route
app.post("/auth/login", authLimiter, controller.login);
// Max 5 tentatives par 15 minutes
```

### Bcrypt pour Mots de Passe

```javascript
import bcrypt from "bcryptjs";

// Hasher mot de passe
const hash = await bcrypt.hash(password, 10);

// Comparer
const isValid = await bcrypt.compare(password, hash);
```

## 🚀 Démarrage

```bash
# Installation dépendances
npm install

# Configurer .env
cp .env.example .env

# Migration DB
npx prisma migrate dev

# Démarrer serveur (avec nodemon)
npm run dev

# Démarrer prod
npm start
```

## 🛠️ Dépendances Principales

- **Express** - Framework HTTP
- **Prisma** - ORM & migrations
- **PostgreSQL** - Base de données
- **jsonwebtoken** - JWT tokens
- **bcryptjs** - Hash mots de passe
- **express-rate-limit** - Rate limiting
- **dotenv** - Variables environnement
- **cors** - Cross-origin

## 📋 Checklist pour Nouveau Module

- [ ] Ajouter modèle dans `schema.prisma`
- [ ] Créer migration Prisma
- [ ] Créer controller avec CRUD
- [ ] Créer service avec logique métier
- [ ] Créer validation schemas
- [ ] Créer routes avec middlewares
- [ ] Créer barrel export
- [ ] Ajouter routes dans `_routes.js`
- [ ] Tester avec Postman/curl
- [ ] Ajouter logs appropriés

## 🐛 Debugging

### Logs

```javascript
import logger from "@/config/logger";

logger.info("Message info");
logger.error("Erreur:", error);
```

### Prisma Studio

```bash
npx prisma studio
# Ouvre UI pour inspecter/modifier données
```

### Network Logs

```bash
curl -X GET http://localhost:5000/api/v1/boats \
  -H "Authorization: Bearer token_here"
```

## 📞 Support

Pour toute question:

1. Consulter ce README
2. Voir modules existants
3. Vérifier logs serveur

---

**Version**: 1.0  
**Dernière mise à jour**: 2026-07-18

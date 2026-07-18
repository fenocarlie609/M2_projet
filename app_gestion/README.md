# 🌊 App Gestion - Maritime Management System

Système complet de gestion maritime avec architecture modulaire scalable.

## 📦 Structure du Projet

```
app_gestion/
├── client/                    # Frontend React + Vite
│   ├── src/
│   │   ├── core/             # Shell app & routing
│   │   ├── features/         # Modules (auth, dashboard, etc)
│   │   ├── shared/           # Services & utilitaires
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── README.md             # 📖 Docs frontend complet
│
├── server/                    # Backend Node.js + Express
│   ├── src/
│   │   ├── config/           # Configuration globale
│   │   ├── common/           # Middlewares & utilitaires
│   │   ├── modules/          # Modules API (auth, users, etc)
│   │   └── app.js
│   ├── prisma/
│   │   ├── schema.prisma     # Modèles de données
│   │   └── migrations/
│   ├── package.json
│   ├── server.js
│   └── README.md             # 📖 Docs backend complet
│
├── vitrine/                   # Site marketing (optionnel)
├── README.md                 # Ce fichier
└── .gitignore
```

## 🚀 Démarrage Rapide

### Frontend

```bash
cd client
npm install
npm run dev        # http://localhost:5173
```

### Backend

```bash
cd server
npm install
npx prisma migrate dev   # Initialiser DB
npm run dev              # http://localhost:5000
```

**L'API frontend appelle automatiquement `http://localhost:5000` via Vite proxy.**

## 🏗️ Architecture Modulaire

### Frontend: Feature-Based Structure

Chaque fonctionnalité est un module isolé:

- **Auth** → Login, contexts, services
- **Dashboard** → Layouts, pages
- **Admin** → Pages admin spécifiques
- **Shared** → Services API, utilitaires, composants génériques

✅ **Avantage**: Ajouter/modifier une feature sans impacter les autres

### Backend: MVC par Module

Chaque module (Auth, Users, Boats, etc.):

- **Controller** → Gestion HTTP
- **Service** → Logique métier
- **Routes** → Endpoints + middlewares
- **Validation** → Schémas

✅ **Avantage**: Code maintenable et testable

## 🔐 Stack Authentification

### Flux Login

```
1. Client POST /api/v1/auth/login {email, password}
2. Server valide credentials, génère JWT (15min)
3. Server répond avec token + user data
4. Client sauvegarde token en localStorage
5. Frontend redirige vers /dashboard
6. Chaque requête envoie token via Authorization header
```

### Rôles & Autorisation

- **admin**: Accès gestion + dashboard
- **superadmin**: Accès complet
- **user**: Accès basique

Routes protégées automatiquement selon rôle.

## 📚 Documentation Détaillée

### Pour le Frontend 👉 [client/README.md](./client/README.md)

- Structure complète
- Ajouter un module étape par étape
- Services API
- Styling & composants

### Pour le Backend 👉 [server/README.md](./server/README.md)

- Architecture MVC
- Ajouter un endpoint
- Prisma ORM
- Authentification & sécurité

## 🛠️ Stack Technique

### Frontend

- React 18
- Vite (dev server + build)
- React Router v6 (SPA)
- Tailwind CSS 4
- Axios + custom interceptors
- React Icons + React Toastify
- Zustand (state management)

### Backend

- Node.js + Express
- Prisma ORM
- PostgreSQL
- JWT (jsonwebtoken)
- Bcrypt (password hashing)
- Express Rate Limit
- CORS

## 📋 Workflow Ajouter une Nouvelle Fonctionnalité

### 1️⃣ Backend d'abord

```bash
cd server

# 1. Ajouter modèle Prisma (schema.prisma)
# 2. Créer migration
npx prisma migrate dev --name add_features

# 3. Créer controller, service, routes, validation
# 4. Ajouter dans _routes.js
# 5. Tester avec curl/Postman
```

### 2️⃣ Puis Frontend

```bash
cd client

# 1. Créer structure features/[nom]/
# 2. Créer service API
# 3. Créer page/composants
# 4. Ajouter route dans routeConfig.jsx
# 5. Tester en browser
```

## 🔗 Points Clés d'Intégration

### API Communication

- **Frontend**: `axiosInstance` avec `baseURL: /api/v1`
- **Backend**: Endpoints à `/api/v1/*`
- **Cookies**: JWT stocké en httpOnly signed cookie
- **CORS**: Configuré pour localhost (dev)

### Database

- **Type**: PostgreSQL
- **ORM**: Prisma
- **Migrations**: Versionnées dans `prisma/migrations/`
- **Inspection**: `npx prisma studio`

### Authentication

- **Token**: JWT avec expiration 15 minutes
- **Storage**: localStorage (frontend) + httpOnly cookie
- **Refresh**: Automatique via intercepteur si 401

## 🚦 Commandes Utiles

### Development

```bash
# Frontend
cd client && npm run dev

# Backend
cd server && npm run dev

# Both terminals
npm run dev (in each folder separately)
```

### Database

```bash
cd server

# Voir migrations
npx prisma migrate status

# Reset DB (DEV ONLY!)
npx prisma migrate reset

# UI données
npx prisma studio
```

### Production Build

```bash
# Frontend
cd client && npm run build

# Backend
cd server && npm run build (if using TypeScript)
```

## 📊 Modules Existants

- ✅ **Auth** - Login, logout, session
- ✅ **Dashboard** - Page principale + layouts
- ✅ **Admin** - Pages admin
- ✅ **SuperAdmin** - Pages superadmin
- ✅ **User** - Pages utilisateur

## 🆕 Template Ajouter un Module

Voir documentation:

- **Frontend**: [client/README.md#comment-ajouter-un-nouveau-module](./client/README.md)
- **Backend**: [server/README.md#comment-ajouter-un-nouveau-module](./server/README.md)

## 🐛 Troubleshooting

### Frontend erreurs

- Vérifier imports depuis `/shared`, `/features`
- Vérifier Tailwind config pour couleurs custom
- Vérifier token stocké dans localStorage

### Backend erreurs

- Vérifier `.env` (DATABASE_URL, JWT_SECRET)
- Vérifier migrations: `npx prisma migrate status`
- Vérifier logs serveur pour erreurs

### CORS / Cookies

- Frontend: `withCredentials: true` (déjà dans axiosInstance)
- Backend: `sameSite: "lax"` configuré pour dev

## 📞 Contacts & Support

Pour questions spécifiques:

1. **Frontend** → Voir [client/README.md](./client/README.md)
2. **Backend** → Voir [server/README.md](./server/README.md)
3. **Architecture** → Consulter ce fichier

## 📈 Roadmap Maintenance

- [ ] Tester chaque nouveau module
- [ ] Mettre à jour README si architecture change
- [ ] Surveiller migrations Prisma
- [ ] Auditeur sécurité JWT/cookies
- [ ] Optimiser bundle Vite (lazy loading)
- [ ] Ajouter tests unitaires

## ✅ Checklist Avant Production

- [ ] Variables `.env` configurées
- [ ] Database PostgreSQL live
- [ ] CORS configuré pour domaine prod
- [ ] JWT_SECRET sécurisé
- [ ] Cookie secure: true (HTTPS)
- [ ] Build optimisé frontend
- [ ] Tests login flow end-to-end

---

**Version**: 1.0  
**Architecture**: Feature-Based Modularity  
**Dernière mise à jour**: 2026-07-18

**Développé avec ❤️ pour la gestion maritime**

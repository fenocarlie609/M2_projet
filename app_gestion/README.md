# ERP maritime et gestion de fret : `app_gestion`

> **Conception et mise en place d'une architecture modulaire évolutive pour un ERP de suivi logistique et de gestion de fret maritime.**

Application web de back-office (React + Node.js/Express + PostgreSQL/Prisma) pour gérer une compagnie de transport maritime : employés et permissions, clients, navires, ports, voyages, plans de chargement/déchargement et manifestes PDF.

- **Contexte académique** : projet de mémoire de fin d'études (Master 2, École Nationale d'Informatique de Fianarantsoa, parcours Génie Logiciel et Base de Données).
- **Contexte métier** : Madagascar (devise par défaut `MGA`, pays par défaut `Madagascar`, interface et messages en **français**).
- **État de référence de ce document : 13 octobre 2026**, établi par lecture du code (dernier commit : merge de la PR #8). Les tests n'ont pas été exécutés pour rédiger ce document : une case cochée signifie « présent dans le code », pas « testé en production ».

## Sommaire

1. [À lire en premier (assistants IA)](#1-à-lire-en-premier-assistants-ia)
2. [État global](#2-état-global)
3. [Stack technique](#3-stack-technique)
4. [Structure du code](#4-structure-du-code)
5. [Structure de la base de données](#5-structure-de-la-base-de-données)
6. [Authentification et sécurité](#6-authentification-et-sécurité)
7. [Permissions](#7-permissions)
8. [API REST](#8-api-rest)
9. [Règles métier des plans de chargement](#9-règles-métier-des-plans-de-chargement)
10. [Temps réel (Socket.IO)](#10-temps-réel-socketio)
11. [Frontend : pages et routes](#11-frontend--pages-et-routes)
12. [Installation, configuration, commandes](#12-installation-configuration-commandes)
13. [Tests](#13-tests)
14. [Écarts connus et dette technique](#14-écarts-connus-et-dette-technique)
15. [Feuille de route](#15-feuille-de-route)
16. [Documents liés](#16-documents-liés)

---

## 1. À lire en premier (assistants IA)

Règles à respecter pour toute modification, sous peine de casser l'application ou de diverger de l'existant.

### Conventions de code

| Sujet | Règle |
| --- | --- |
| Langue | Interface, messages d'erreur, commentaires et README en **français**. Identifiants de code en anglais. |
| Backend | **CommonJS** (`require` / `module.exports`), pas d'ES modules. Node.js 18+. |
| Validation | **Zod** (v4) via `validate()` (`server/src/common/middlewares/validate.middleware.js`). **Pas Joi** : `joi` est dans les dépendances mais n'est pas utilisé. |
| Prisma | Prisma **7** avec `@prisma/adapter-pg`. Client généré dans `server/src/generated/prisma` (ignoré par git : lancer `npx prisma generate` après clonage). Les accesseurs sont en minuscule : `prisma.employee`, jamais `prisma.Employee`. |
| Pattern d'un module backend | `module.routes.js` → `module.controller.js` → `module.service.js` + `module.validation.js` + `index.js` (barrel). Voir `server/src/modules/clients/` comme référence. |
| Erreurs | `throw new AppError(message, statusCode)` ; handlers enveloppés dans `catchAsync`. |
| Réponses | `sendSuccess` / `sendCreated` / `sendDeleted` (`server/src/common/utils/response.js`), forme `{ status: "success", ... }`. |
| Autorisation | Permissions **module + action** (`authorize("MODULE", APP_ACTIONS.READ)`), jamais de rôles. Voir [section 7](#7-permissions). |
| Frontend | Organisation par features (`client/src/features/<feature>/{components,pages,service}` + `index.js`), alias `@/` vers `client/src`. Référence : feature `client`. |
| Appels API | Toujours via `axiosInstance` ou `createCrudService` (`client/src/shared/services/`), qui gèrent cookies, CSRF et refresh. |
| Secrets | Jamais de vrais secrets dans le dépôt. Il n'y a **pas de `.env.example`** : le créer si besoin (voir [section 12](#12-installation-configuration-commandes)). |

### Pièges connus

- **Casse d'un nom de fichier** : corrigé. Le middleware est désormais `server/src/common/middlewares/restrictToDepartment.middleware.js`, avec le même nom dans les imports ; le démarrage sous Linux ne dépend plus de la insensibilité à la casse du système de fichiers.
- **CORS + Socket.IO** : ne jamais mettre `"*"` avec `credentials: true`. L'origine doit être `process.env.CLIENT_URL` (par défaut `http://localhost:5173`).
- **`express.static("/uploads")`** doit rester déclaré **avant** le catch-all 404 et l'`errorHandler` dans `app.js`.
- **Corps JSON limité à 10 ko** (`express.json({ limit: "10kb" })`) : tout payload plus gros reçoit une erreur.
- **Une seule API Voyage** : `/api/v1/voyages` (module `voyage`, permission `VOYAGES`). La route `/maritime/voyages` a été retirée ; les statuts sont `SCHEDULED`, `IN_TRANSIT`, `ARRIVED` et `CANCELLED`, la valeur par défaut du schéma ayant été alignée sur `SCHEDULED`.
- **Les tables `drivers` et `vehicles` n'existent plus** (migration `20260915100824_remove_vehicle_driver_tables`). Chauffeur et plaque sont de simples champs texte de `Load` (`driverName`, `vehiclePlate`). Le module `driver` (back et front), la route `/maritime/vehicles` et l'écrans `driver` et `maritime` du client ont été retirés.
- **Migrations** : ne jamais lancer `prisma migrate reset` sur une base contenant des données. La migration `rename_cargo_lines_to_loads` supprime `cargo_lines` sans copier les données.
- **Seed `seedLoadingPlan.js`** : il supprime puis recrée les marchandises des plans de référence. Ne pas l'exécuter sur une base réelle.
- **Poids** : stockés en **kilogrammes** (`Decimal`), affichés en **tonnes** (`kg / 1000`).
- **Login** : le limiteur `authLimiter` est réglé sur **5 tentatives par minute** (valeur « pour les tests » ; la valeur prévue était 15 minutes).

---

## 2. État global

| Domaine | État | Détail vérifié dans le code |
| --- | --- | --- |
| Architecture modulaire | Terminé | Frontend par features, backend par modules |
| Authentification | Terminé | JWT access + refresh avec rotation, cookies signés, CSRF double-submit |
| Permissions granulaires | Terminé | `EmployeePermission` (module, action), joker `*` |
| Administration | Partiel | Employés, utilisateurs/accès, modules, structure (départements/postes) |
| Clients | Partiel | Fiche enrichie (identité, fiscalité, adresses, documents) |
| Navires, ports, voyages | Partiel | CRUD back + écrans front ; incohérences, voir section 14 |
| Plans de chargement / déchargement | Partiel | Lignes, capacité, validation, plan de déchargement auto, **export PDF du manifeste côté client** |
| Sécurité API | Partiel | Constats P1 de l'audit du 3 octobre 2026 corrigés ; P2 restants |
| Tests automatisés | Partiel | Tests unitaires `node --test` (voir section 13), pas de tests HTTP/permissions |
| Chauffeurs / véhicules | Abandonné | Tables supprimées, code résiduel |

## 3. Stack technique

**Backend** (`server/`) : Node.js 18+, Express 5, Prisma 7 (`@prisma/adapter-pg`, `pg`), PostgreSQL, Zod 4, JWT (`jsonwebtoken`), bcrypt, Helmet, CORS, `express-rate-limit`, `cookie-parser`, Multer (upload en mémoire), Socket.IO 4, Winston (logs fichiers + console), `node --test` pour les tests.

**Frontend** (`client/`) : React 18, Vite 6, Tailwind CSS 4 (`@tailwindcss/vite`), React Router 6, Axios, Socket.IO client, `react-toastify`, `react-icons`, `jspdf` + `jspdf-autotable` (manifeste PDF), `vite-plugin-pwa` (PWA, mise à jour automatique du service worker).
Installées mais **non utilisées** dans le code : `antd`, `@ant-design/icons`, `zustand`. Les composants UI sont maison (`client/src/shared/components/ui/`).

## 4. Structure du code

### 4.1 Vue d'ensemble

Deux applications indépendantes dans un même dossier, qui communiquent par HTTP (REST, JSON) et par WebSocket (Socket.IO) :

```text
Navigateur (client/)                                   Serveur (server/)                          Base
┌───────────────────────────┐   HTTP /api/v1 (cookies,  ┌───────────────────────────────┐        ┌────────────┐
│ React 18 + Vite           │   CSRF, JSON)             │ Express 5                     │        │ PostgreSQL │
│ features/* → service/*    │ ───────────────────────►  │ routes → authorize → validate │ Prisma │            │
│ axiosInstance (refresh)   │                           │ → controller → service        │ ─────► │ 17 tables  │
│ socket.io-client          │ ◄───────────────────────  │ Socket.IO (rooms employee_<id>)│        │            │
└───────────────────────────┘   WebSocket (cookie signé)└───────────────────────────────┘        └────────────┘
```

Principes d'architecture :

- **Modularité par fonctionnalité** : un dossier par module métier côté serveur (`server/src/modules/<module>/`) et côté client (`client/src/features/<feature>/`). Ajouter une fonctionnalité = ajouter un dossier, sans toucher aux autres.
- **Couches côté serveur** : `routes` (URL + droits + validation) → `controller` (HTTP) → `service` (logique métier + accès base). Aucune requête Prisma dans les routes ; aucun `req`/`res` dans les services.
- **Code transverse isolé** : authentification, CSRF, audit, validation, erreurs et upload vivent dans `server/src/common/` et sont réutilisés par tous les modules.
- **Une seule source de vérité** pour les routes et les permissions du frontend : `client/src/core/routes/routeConfig.jsx`.

### 4.2 Arborescence complète

Relevée sur le dépôt le 13 octobre 2026. Exclus de l'arbre : `node_modules/`, `package-lock.json`, `src/generated/prisma/` (client Prisma généré, ignoré par git), les 17 dossiers de `server/prisma/migrations/` (détaillés en [section 5.7](#57-migrations)), la collection Postman (`server/postman/`, `server/.postman/`) et `server/.vscode/`. Les fichiers sans commentaire suivent la convention de leur dossier.

```text
app_gestion/
├── client/                                                   # Back-office React + Vite (PWA)
│   ├── public/                                               # Ressources statiques et icônes PWA
│   │   ├── _redirects                                        # Fallback SPA (/* → /index.html)
│   │   ├── manifest.webmanifest
│   │   ├── nano tech logo.ico
│   │   ├── nano tech logo.svg
│   │   ├── pwa-192x192.png
│   │   ├── pwa-512x512.png
│   │   └── vite.svg
│   ├── src/
│   │   ├── core/                                             # Coquille de l’application
│   │   │   ├── routes/
│   │   │   │   └── routeConfig.jsx                           # Source unique des routes, du menu et des permissions requises
│   │   │   └── App.jsx                                       # Routes publiques et protégées (RoleGuard), ToastContainer
│   │   ├── features/                                         # Un dossier par fonctionnalité (components / pages / service / index.js)
│   │   │   ├── auth/                                         # Connexion, contexte d’authentification, session
│   │   │   │   ├── contexts/
│   │   │   │   │   └── AuthContext.jsx                       # Utilisateur courant, login/logout, /auth/me, connexion Socket.IO
│   │   │   │   ├── pages/
│   │   │   │   │   └── LoginPage.jsx
│   │   │   │   ├── service/
│   │   │   │   │   └── login.service.js                      # Appels /auth/login
│   │   │   │   └── index.js
│   │   │   ├── client/                                       # Clients (feature de référence de la convention CRUD)
│   │   │   │   ├── components/
│   │   │   │   │   ├── ClientCard.jsx
│   │   │   │   │   ├── ClientForm.jsx
│   │   │   │   │   ├── ClientModal.jsx
│   │   │   │   │   └── ClientTable.jsx
│   │   │   │   ├── pages/
│   │   │   │   │   └── ClientPage.jsx
│   │   │   │   ├── service/
│   │   │   │   │   └── client.service.js
│   │   │   │   └── index.js
│   │   │   ├── companyStructure/                             # Départements et postes
│   │   │   │   ├── components/
│   │   │   │   │   ├── CompanyStructureCard.jsx
│   │   │   │   │   ├── Departmentaddmodal.jsx
│   │   │   │   │   ├── DepartmentEditModal.jsx
│   │   │   │   │   ├── Positionaddmodal.jsx
│   │   │   │   │   └── PositionEditModal.jsx
│   │   │   │   ├── pages/
│   │   │   │   │   └── CompanyStructurePage.jsx
│   │   │   │   ├── service/
│   │   │   │   │   └── companyStructure.service.js
│   │   │   │   └── index.js
│   │   │   ├── dashboard/                                    # Layout (Header, Sidebar) et page d’accueil
│   │   │   │   ├── layouts/
│   │   │   │   │   ├── DashboardLayout.jsx
│   │   │   │   │   ├── Header.jsx
│   │   │   │   │   ├── index.js
│   │   │   │   │   └── Sidebar.jsx                           # Menu construit depuis sidebarRoutes
│   │   │   │   ├── pages/
│   │   │   │   │   └── DashboardPage.jsx
│   │   │   │   └── index.js

│   │   │   │   ├── components/
│   │   │   │   │   ├── DriverCard.jsx
│   │   │   │   │   ├── DriverModal.jsx
│   │   │   │   │   └── DriverTable.jsx
│   │   │   │   ├── pages/
│   │   │   │   │   └── DriverPage.jsx
│   │   │   │   ├── service/
│   │   │   │   │   └── driver.service.js
│   │   │   │   └── index.js
│   │   │   ├── employee/                                     # Employés
│   │   │   │   ├── components/
│   │   │   │   │   ├── EmployeeCard.jsx
│   │   │   │   │   ├── EmployeeModal.jsx
│   │   │   │   │   └── Employeetable.jsx
│   │   │   │   ├── pages/
│   │   │   │   │   └── Employeepage.jsx
│   │   │   │   ├── service/
│   │   │   │   │   └── employee.service.js
│   │   │   │   └── index.js

│   │   │   │   ├── pages/
│   │   │   │   │   └── MaritimePage.jsx
│   │   │   │   ├── service/
│   │   │   │   │   └── maritime.service.js
│   │   │   │   └── index.js
│   │   │   ├── module/                                       # Modules de permissions (AppModule)
│   │   │   │   ├── components/
│   │   │   │   │   ├── ModuleCard.jsx
│   │   │   │   │   ├── ModuleModal.jsx
│   │   │   │   │   └── ModuleTable.jsx
│   │   │   │   ├── pages/
│   │   │   │   │   └── ModulePage.jsx
│   │   │   │   ├── service/
│   │   │   │   │   └── modules.service.js
│   │   │   │   └── index.js
│   │   │   ├── notifications/                                # Notifications temps réel (contexte + cloche)
│   │   │   │   ├── components/
│   │   │   │   │   └── NotificationBell.jsx
│   │   │   │   ├── contexts/
│   │   │   │   │   └── NotificationContext.jsx
│   │   │   │   ├── service/
│   │   │   │   │   └── notifications.service.js
│   │   │   │   └── index.js
│   │   │   ├── plans/                                        # Plans de chargement/déchargement, lignes, manifeste PDF
│   │   │   │   ├── components/
│   │   │   │   │   ├── LoadEditorModal.jsx
│   │   │   │   │   ├── LoadingManifestPdf.jsx                # Génération du manifeste PDF dans le navigateur (jspdf)
│   │   │   │   │   ├── LoadPlanForm.jsx
│   │   │   │   │   ├── LoadPlanModal.jsx
│   │   │   │   │   ├── LoadPlanTable.jsx
│   │   │   │   │   ├── PlanLoadsSection.jsx
│   │   │   │   │   └── PlanOverview.jsx
│   │   │   │   ├── pages/
│   │   │   │   │   ├── LoadPage.jsx                          # Saisie des lignes d’un plan (LOAD ou UNLOAD)
│   │   │   │   │   └── PlansPage.jsx                         # Liste et création des plans
│   │   │   │   ├── service/
│   │   │   │   │   └── loadingPlan.service.js                # Appels /loading-plans et lignes
│   │   │   │   └── index.js
│   │   │   ├── ports/                                        # Ports
│   │   │   │   ├── components/
│   │   │   │   │   ├── PortCard.jsx
│   │   │   │   │   ├── PortForm.jsx
│   │   │   │   │   ├── PortModal.jsx
│   │   │   │   │   └── PortTable.jsx
│   │   │   │   ├── pages/
│   │   │   │   │   └── PortPage.jsx
│   │   │   │   ├── service/
│   │   │   │   │   └── port.service.js
│   │   │   │   └── index.js
│   │   │   ├── ship/                                         # Navires
│   │   │   │   ├── components/
│   │   │   │   │   ├── ShipCard.jsx
│   │   │   │   │   ├── ShipForm.jsx
│   │   │   │   │   ├── ShipModal.jsx
│   │   │   │   │   └── ShipTable.jsx
│   │   │   │   ├── pages/
│   │   │   │   │   └── ShipPage.jsx
│   │   │   │   ├── service/
│   │   │   │   │   └── ship.service.js
│   │   │   │   └── index.js
│   │   │   ├── template/                                     # Laboratoire visuel sans persistance
│   │   │   │   ├── pages/
│   │   │   │   │   └── TemplatePage.jsx
│   │   │   │   └── index.js
│   │   │   ├── users/                                        # Accès à l’application et permissions des employés
│   │   │   │   ├── components/
│   │   │   │   │   ├── GrantAccessModal.jsx
│   │   │   │   │   ├── PermissionsModal.jsx
│   │   │   │   │   ├── ResetPasswordModal.jsx
│   │   │   │   │   ├── UserPasswordModal.jsx
│   │   │   │   │   ├── UsersPermissionsTable.jsx
│   │   │   │   │   └── UsersTable.jsx
│   │   │   │   ├── pages/
│   │   │   │   │   └── UsersPage.jsx
│   │   │   │   ├── service/
│   │   │   │   │   └── users.service.js
│   │   │   │   └── index.js
│   │   │   └── voyages/                                      # Voyages
│   │   │       ├── components/
│   │   │       │   ├── VoyageCard.jsx
│   │   │       │   ├── VoyageForm.jsx
│   │   │       │   ├── VoyageModal.jsx
│   │   │       │   └── VoyageTable.jsx
│   │   │       ├── pages/
│   │   │       │   └── VoyagePage.jsx
│   │   │       ├── service/
│   │   │       │   └── voyage.service.js
│   │   │       └── index.js
│   │   ├── shared/                                           # Code réutilisable
│   │   │   ├── components/
│   │   │   │   ├── layout/
│   │   │   │   │   ├── index.js
│   │   │   │   │   └── RoleGuard.jsx                         # Garde de route : session + permission
│   │   │   │   └── ui/                                       # Composants UI maison (Button, Input, Table, Modal…)
│   │   │   │       ├── Alert.jsx
│   │   │   │       ├── AlertDialog.jsx
│   │   │   │       ├── Badge.jsx
│   │   │   │       ├── Button.jsx
│   │   │   │       ├── Calendar.jsx
│   │   │   │       ├── Card.jsx
│   │   │   │       ├── ContextMenu.jsx
│   │   │   │       ├── DropdownMenu.jsx
│   │   │   │       ├── Form.jsx
│   │   │   │       ├── index.js
│   │   │   │       ├── Input.jsx
│   │   │   │       ├── Modal.jsx
│   │   │   │       ├── PageHeader.jsx
│   │   │   │       ├── Select.jsx
│   │   │   │       ├── StatsCard.jsx
│   │   │   │       ├── Stepper.jsx
│   │   │   │       ├── Table.jsx
│   │   │   │       └── Tabs.jsx
│   │   │   ├── services/
│   │   │   │   ├── api.js                                    # Wrapper get/post/put/patch/delete
│   │   │   │   ├── axiosInstance.js                          # Axios : cookies, CSRF, refresh automatique sur 401
│   │   │   │   ├── crudService.js                            # Fabrique de services CRUD (createCrudService)
│   │   │   │   ├── index.js
│   │   │   │   └── socket.js                                 # Instance Socket.IO (autoConnect: false)
│   │   │   └── utils/
│   │   │       ├── apiErrors.js                              # Erreurs de champs renvoyées par l’API
│   │   │       ├── formatDate.js                             # Formatage des dates
│   │   │       ├── getApiErrorMessage.js                     # Message d’erreur lisible
│   │   │       ├── index.js
│   │   │       ├── Load.jsx                                  # Indicateur de chargement
│   │   │       ├── permissions.js                            # hasPermission, normalizePermissions
│   │   │       └── toast.jsx                                 # Notifications (react-toastify)
│   │   ├── index.css                                         # Styles globaux (Tailwind)
│   │   └── main.jsx                                          # BrowserRouter > AuthProvider > NotificationProvider > App ; service worker
│   ├── index.html                                            # Page HTML racine Vite
│   ├── package.json                                          # Dépendances et scripts (dev, build, preview)
│   ├── README.md                                             # Documentation du frontend
│   ├── tailwind.config.js                                    # Couleurs de marque (navy-*, brand-primary)
│   └── vite.config.js                                        # Vite : plugins React, Tailwind, PWA ; proxy /api ; alias @/
├── server/                                                   # API REST Node.js / Express / Prisma
│   ├── prisma/                                               # Schéma, migrations, seeds
│   │   ├── migrations/                                       # 17 dossiers de migration SQL (voir « Structure de la base de données »)
│   │   ├── schema.prisma                                     # Source de vérité du modèle de données
│   │   ├── seed.js                                           # Départements et postes
│   │   ├── seedAppModules.js                                 # Catalogue des modules de permissions (dont ENTREPOTS)
│   │   ├── seedAdmin.js                                      # Administrateur universel (droit *,*)
│   │   ├── seedDemo.js                                       # Jeu de demonstration complet (toutes tables)
│   │   ├── structure.js                                     # Structure de l'entreprise partagee par les seeds
│   │   └── seedLoadingPlan.js                                # Navires, voyages, clients et plans de référence (destructif)
│   ├── src/
│   │   ├── common/                                           # Code partagé
│   │   │   ├── middlewares/
│   │   │   │   ├── audit.middleware.js                       # Journal d’audit (AuditLog) avec masquage des secrets
│   │   │   │   ├── auth.middleware.js                        # protect (cookie/Bearer) et authorize(module, action)
│   │   │   │   ├── csrf.middleware.js                        # CSRF double-submit (xsrf-token / X-CSRF-Token)
│   │   │   │   ├── error.middleware.js                       # errorHandler centralisé (dev/prod, erreurs Prisma)
│   │   │   │   ├── owner.middleware.js                       # isSelfOrAuthorized (anti auto-élévation)
│   │   │   │   ├── rateLimiter.middleware.js                 # authLimiter (5 tentatives / minute)
│   │   │   │   ├── restrictToDepartment.middleware.js        # restrictToDepartment (département technique)
│   │   │   │   ├── upload.middleware.js                      # Multer en mémoire, détection de signature d’image
│   │   │   │   └── validate.middleware.js                    # validate({ body, query, params }) avec Zod
│   │   │   └── utils/
│   │   │       ├── AppError.js                               # Erreur opérationnelle (message, statusCode)
│   │   │       ├── catchAsync.js                             # Enveloppe les handlers async
│   │   │       ├── constants.js                              # APP_ACTIONS (CREATE, READ, UPDATE, DELETE, *)
│   │   │       ├── password.utils.js                         # Hachage et comparaison de mots de passe
│   │   │       ├── response.js                               # sendSuccess, sendCreated, sendDeleted
│   │   │       ├── socketAuth.js                             # Extraction de l’employé depuis le cookie signé du handshake
│   │   │       └── validation.schemas.js                     # Schémas de validation partagés
│   │   ├── config/                                           # Configuration globale
│   │   │   ├── database.js                                   # Pool pg + PrismaPg + client Prisma unique
│   │   │   ├── env.js                                        # validateEnv : variables obligatoires
│   │   │   ├── logger.js                                     # Winston (logs/errors.log, logs/combined.log)
│   │   │   ├── security.js                                   # appLimiter (rate limit global /api)
│   │   │   └── socket.js                                     # Socket.IO authentifié (initSocket, getIO)
│   │   ├── modules/                                          # Un dossier par module métier
│   │   │   ├── auth/                                         # Login, refresh (rotation), me, logout, csrf-token
│   │   │   │   ├── auth.controller.js                        # Contrôleur HTTP
│   │   │   │   ├── auth.routes.js                            # Routes et contrôle d’accès
│   │   │   │   ├── auth.service.js                           # Logique métier + Prisma
│   │   │   │   └── auth.validation.js                        # Schémas Zod
│   │   │   ├── clients/                                      # Clients (module de référence)
│   │   │   ├── dashboard/                                   # Tableau de bord : indicateurs filtres par permission
│   │   │   ├── warehouse/                                   # Entrepots, marchandises en stock et mouvements
│   │   │   │   ├── client.controller.js                      # Contrôleur HTTP
│   │   │   │   ├── client.routes.js                          # Routes et contrôle d’accès
│   │   │   │   ├── client.service.js                         # Logique métier + Prisma
│   │   │   │   ├── client.validation.js                      # Schémas Zod
│   │   │   │   └── index.js                                  # Barrel d’exports du module
│   │   │   ├── company-structure/                            # Départements et postes
│   │   │   │   ├── company-structure.controller.js           # Contrôleur HTTP
│   │   │   │   ├── company-structure.routes.js               # Routes et contrôle d’accès
│   │   │   │   ├── company-structure.service.js              # Logique métier + Prisma
│   │   │   │   ├── company-structure.validation.js           # Schémas Zod
│   │   │   │   └── index.js                                  # Barrel d’exports du module

│   │   │   │   ├── driver.controller.js                      # Contrôleur HTTP
│   │   │   │   ├── driver.routes.js                          # Routes et contrôle d’accès
│   │   │   │   ├── driver.service.js                         # Logique métier + Prisma
│   │   │   │   ├── driver.validation.js                      # Schémas Zod
│   │   │   │   └── index.js                                  # Barrel d’exports du module
│   │   │   ├── employees/                                    # Employés
│   │   │   │   ├── employee.controller.js                    # Contrôleur HTTP
│   │   │   │   ├── employee.routes.js                        # Routes et contrôle d’accès
│   │   │   │   ├── employee.service.js                       # Logique métier + Prisma
│   │   │   │   ├── employee.validation.js                    # Schémas Zod
│   │   │   │   └── index.js                                  # Barrel d’exports du module
│   │   │   ├── loading-plans/                                # Plans de chargement/déchargement et lignes (Load)
│   │   │   │   ├── index.js                                  # Barrel d’exports du module
│   │   │   │   ├── load.controller.js                        # Contrôleur HTTP

│   │   │   │   ├── load.service.js                           # Logique métier + Prisma
│   │   │   │   ├── load.validation.js                        # Schémas Zod
│   │   │   │   ├── loading-plan.controller.js                # Contrôleur HTTP
│   │   │   │   ├── loading-plan.routes.js                    # Routes et contrôle d’accès
│   │   │   │   ├── loading-plan.service.js                   # Logique métier + Prisma
│   │   │   │   └── loading-plan.validation.js                # Schémas Zod
│   │   │   ├── maritime/                                     # Navires et ports (CRUD générique, diffusion temps réel)
│   │   │   │   ├── index.js                                  # Barrel d’exports du module
│   │   │   │   ├── maritime.controller.js                    # Contrôleur HTTP
│   │   │   │   ├── maritime.routes.js                        # Routes et contrôle d’accès
│   │   │   │   ├── maritime.service.js                       # Logique métier + Prisma
│   │   │   │   └── maritime.validation.js                    # Schémas Zod
│   │   │   ├── modules/                                      # Modules de permissions (AppModule)
│   │   │   │   ├── index.js                                  # Barrel d’exports du module
│   │   │   │   ├── module.controller.js                      # Contrôleur HTTP
│   │   │   │   ├── module.routes.js                          # Routes et contrôle d’accès
│   │   │   │   ├── module.service.js                         # Logique métier + Prisma
│   │   │   │   └── module.validation.js                      # Schémas Zod
│   │   │   ├── notifications/                                # Notifications ciblées par permission
│   │   │   │   ├── index.js                                  # Barrel d’exports du module
│   │   │   │   ├── notification.controller.js                # Contrôleur HTTP
│   │   │   │   ├── notification.routes.js                    # Routes et contrôle d’accès
│   │   │   │   └── notification.service.js                   # Logique métier + Prisma

│   │   │   │   ├── index.js                                  # Barrel d’exports du module
│   │   │   │   ├── ship.controller.js                        # Contrôleur HTTP
│   │   │   │   ├── ship.routes.js                            # Routes et contrôle d’accès
│   │   │   │   └── ship.service.js                           # Logique métier + Prisma
│   │   │   ├── uploads/                                      # Upload d’avatar
│   │   │   │   ├── index.js                                  # Barrel d’exports du module
│   │   │   │   ├── upload.controller.js                      # Contrôleur HTTP
│   │   │   │   └── upload.routes.js                          # Routes et contrôle d’accès
│   │   │   ├── users/                                        # Accès à l’application et permissions (département TECH)
│   │   │   │   ├── index.js                                  # Barrel d’exports du module
│   │   │   │   ├── user.controller.js                        # Contrôleur HTTP
│   │   │   │   ├── user.routes.js                            # Routes et contrôle d’accès
│   │   │   │   ├── user.service.js                           # Logique métier + Prisma
│   │   │   │   └── User.validation.js                        # Schémas Zod
│   │   │   ├── voyage/                                       # Voyages (API /voyages)
│   │   │   │   ├── index.js                                  # Barrel d’exports du module
│   │   │   │   ├── voyage.controller.js                      # Contrôleur HTTP
│   │   │   │   ├── voyage.route.js                           # Routes et contrôle d’accès
│   │   │   │   ├── voyage.service.js                         # Logique métier + Prisma
│   │   │   │   └── voyage.validation.js                      # Schémas Zod
│   │   │   └── _routes.js                                    # Agrégation des routes /api/v1 + CSRF + /health
│   │   └── app.js                                            # Express : helmet, CORS, static /uploads, rate limit, parsers, audit, routes, erreurs
│   ├── test/                                                 # Tests node --test
│   │   ├── integration/
│   │   │   └── logistics-data.test.js                        # Données de démonstration, total 95,444 t
│   │   └── unit/
│   │       ├── audit-redaction.test.js                       # Masquage des secrets dans l’audit
│   │       ├── client-validation.test.js                     # Validation des fiches client
│   │       ├── logistics-validation.test.js                  # Validation navire, port, voyage, plan, ligne
│   │       ├── socket-auth.test.js                           # Authentification du handshake Socket.IO
│   │       ├── upload-signature.test.js                      # Signature d’image (absent du script test:unit)
│   │       └── voyage-read-auth.test.js                      # VOYAGES:READ sur les lectures
│   ├── .gitignore                                            # node_modules, .env, src/generated/prisma
│   ├── package.json                                          # Dépendances et scripts (dev, start, test, seed, seed:admin)
│   ├── prisma.config.js                                      # Configuration Prisma 7 (schéma, migrations, DATABASE_URL)
│   ├── README.md                                             # Documentation du backend
│   └── server.js                                             # Point d’entrée : dotenv, validateEnv, connectDB, listen, initSocket
├── README.md                                                 # Documentation principale (ce fichier)
└── README_AUDIT_2026-10-03.md                                # Audit de sécurité et de cohérence du 3 octobre 2026
```

Des dossiers générés à l'exécution ne sont pas versionnés : `server/logs/` (Winston), `server/public/uploads/avatars/` (avatars téléversés), `server/src/generated/prisma/` (client Prisma).

### 4.3 Rôle des dossiers du backend (`server/`)

| Dossier / fichier | Responsabilité | Règle à respecter |
| --- | --- | --- |
| `server.js` | Charge les variables d'environnement, valide l'environnement, connecte la base, démarre HTTP puis Socket.IO | Ne contient aucune logique métier |
| `src/app.js` | Assemble Express : `helmet`, CORS, fichiers statiques `/uploads`, rate limit, parseurs (JSON limité à 10 ko), cookies signés, journal de requêtes, audit, routes `/api/v1`, 404, gestionnaire d'erreurs | L'ordre des middlewares est significatif (voir README serveur) |
| `src/config/` | Connexion Prisma (une seule instance), validation des variables d'environnement, Winston, limiteur global, Socket.IO | Importer `prisma` depuis `config/database.js`, jamais `new PrismaClient()` ailleurs |
| `src/common/middlewares/` | Transversal : `protect`/`authorize`, CSRF, validation Zod, audit, upload, anti auto-élévation, limiteur de login, gestion d'erreurs, restriction par département | Déclarés dans les fichiers `routes` des modules |
| `src/common/utils/` | `AppError`, `catchAsync`, formats de réponse, constantes d'actions, utilitaires de mot de passe et d'authentification Socket.IO | `AppError` pour toute erreur métier |
| `src/modules/<module>/` | Un module métier : `*.routes.js`, `*.controller.js`, `*.service.js`, `*.validation.js`, `index.js` | Module de référence : `clients/` |
| `src/modules/_routes.js` | Monte tous les routeurs sous `/api/v1`, applique le CSRF aux mutations, expose `/health` | Tout nouveau module doit être monté ici |
| `prisma/` | `schema.prisma`, migrations versionnées, seeds | Ne jamais modifier une migration déjà appliquée ; en créer une nouvelle |
| `test/` | `unit/` (validations, middlewares, sécurité) et `integration/` (données de démonstration) | Runner natif `node --test` |

### 4.4 Rôle des dossiers du frontend (`client/`)

| Dossier / fichier | Responsabilité | Règle à respecter |
| --- | --- | --- |
| `src/main.jsx` | Providers (`BrowserRouter`, `AuthProvider`, `NotificationProvider`), service worker PWA | — |
| `src/core/` | `App.jsx` (routage) et `routes/routeConfig.jsx` (routes, menu, permissions) | Toute page doit être déclarée dans `routeConfig.jsx` |
| `src/features/<feature>/` | Une fonctionnalité : `components/`, `pages/`, `service/`, `index.js` | Feature de référence : `client/` |
| `src/features/<feature>/service/` | Appels API de la fonctionnalité (`createCrudService` + méthodes spécifiques) | Aucun appel Axios direct dans les composants |
| `src/shared/components/ui/` | Composants UI génériques maison | Réutiliser avant de créer un nouveau composant |
| `src/shared/components/layout/` | `RoleGuard` (session + permission) | — |
| `src/shared/services/` | `axiosInstance` (cookies, CSRF, refresh), `crudService`, `api`, `socket` | Passer par ces services pour tout appel réseau |
| `src/shared/utils/` | Permissions, notifications toast, erreurs d'API, formats de date | — |
| `public/` | Icônes PWA, manifeste, `_redirects` | — |

### 4.5 Parcours d'une fonctionnalité de bout en bout (exemple : ajouter une ligne de marchandise)

1. **Page** `features/plans/pages/LoadPage.jsx` → modale `LoadEditorModal.jsx`.
2. **Service** `features/plans/service/loadingPlan.service.js` : `addLoad(planId, data)` → `POST /loading-plans/:id/loads` via `axiosInstance` (ajoute `X-CSRF-Token`, renvoie les cookies, rejoue la requête après un refresh si 401).
3. **Serveur** `modules/_routes.js` : contrôle CSRF → `loading-plan.routes.js` : `protect` → `authorize("CARGO", CREATE)` → `validate(loadValidation.create)` (Zod).
4. **Contrôleur** `loading-plan.controller.js` → **service** `loading-plan.service.js` : vérifie que le plan n'est pas validé, calcule le total, contrôle la capacité du navire, écrit via Prisma dans `loads` et met à jour `loading_plans.totalWeightKg` (transaction).
5. **Audit** : `audit.middleware.js` enregistre la mutation dans `audit_logs` (secrets masqués).
6. **Réponse** `{ status: "success", ... }` → la page se recharge et affiche le nouveau total.

### 4.6 Où ajouter quoi

| Besoin | Étapes |
| --- | --- |
| Nouvelle table | 1) modifier `server/prisma/schema.prisma` ; 2) `npx prisma migrate dev --name <nom>` ; 3) `npx prisma generate` ; 4) mettre à jour la [section 5](#5-structure-de-la-base-de-données) de ce README |
| Nouveau module backend | Créer `server/src/modules/<module>/` sur le modèle de `clients/` (routes, contrôleur, service, validation Zod, `index.js`) ; monter dans `modules/_routes.js` ; ajouter le module de permission dans `prisma/seedAppModules.js` |
| Nouvelle page frontend | Créer `client/src/features/<feature>/` sur le modèle de `client/` ; ajouter une entrée dans `core/routes/routeConfig.jsx` avec sa `requiredPermission` |
| Nouvelle permission | Choisir un code de module, protéger les routes avec `authorize("CODE", action)`, ajouter le code dans `seedAppModules.js`, utiliser le même code dans `routeConfig.jsx` |
| Nouvel événement temps réel | Émettre via `getIO().emit("<ressource>:changed", ...)` côté serveur et écouter le **même nom exact** dans la page concernée (voir [section 10](#10-temps-réel-socketio)) |

## 5. Structure de la base de données

Source de vérité : `server/prisma/schema.prisma`. SGBD **PostgreSQL**, accédé par **Prisma 7** (`@prisma/adapter-pg`). Base de développement : `lct_premium`. **17 tables**, **3 enums**, **17 migrations**. Diagramme UML complémentaire à la racine du dépôt : `../prisma-uml.png` (peut être en retard sur le schéma).

### 5.1 Conventions

- **Noms** : tables en `snake_case` pluriel (via `@@map`), colonnes en `camelCase` (donc entre guillemets doubles dans le SQL brut : `"departmentId"`).
- **Clés primaires** : `id` de type `text` contenant un UUID, **généré par Prisma** (`@default(uuid())`, pas de défaut SQL).
- **Horodatage** : `createdAt` (défaut SQL `now()`) et `updatedAt` (géré par Prisma, `@updatedAt`), en `timestamp(3)`.
- **Soft delete** (`deletedAt` nullable) sur 11 tables : `departments`, `positions`, `employees`, `clients`, `client_addresses`, `client_documents`, `vessels`, `ports`, `voyages`, `loading_plans`, `loads`. Les requêtes doivent filtrer `deletedAt: null`.
- **Poids et capacités** : `decimal(65,30)` (type `Decimal` de Prisma), poids en **kilogrammes**, capacité des navires en **tonnes**.
- **Suppression en cascade** : seules les relations indiquées `ON DELETE Cascade` ou `SetNull` ci-dessous sont explicites ; sinon Prisma applique son comportement par défaut (`RESTRICT` pour une relation obligatoire, `SET NULL` pour une relation facultative).
- **Statuts** : `Voyage.status`, `Vessel.status` et `Load.status` sont des **chaînes libres** (pas d'enum SQL) ; leurs valeurs sont contrôlées par les schémas Zod des modules.

### 5.2 Vue d'ensemble des tables

| Domaine | Table | Rôle | Soft delete |
| --- | --- | --- | --- |
| Structure interne | `departments` | Départements de l'entreprise (`code` unique) | oui |
| | `positions` | Postes, rattachés à un département | oui |
| | `employees` | Employés, avec ou sans accès à l'application (`hasAppAccess`) | oui |
| Accès et sécurité | `app_modules` | Catalogue des codes de module de permission (joker `*`) | non |
| | `employee_permissions` | Permissions `(module, action)` par employé | non |
| | `refresh_tokens` | Refresh tokens (hash, famille, rotation, révocation) | non |
| | `audit_logs` | Journal d'audit des requêtes mutantes | non |
| Clients | `clients` | Clients particuliers ou entreprises | oui |
| | `client_addresses` | Adresses de facturation/livraison | oui |
| | `client_documents` | Documents d'un client (type, numéro, validité) | oui |
| Maritime | `vessels` | Navires (capacité en tonnes) | oui |
| | `ports` | Ports (`code` unique) | oui |
| | `voyages` | Voyages : navire + port de départ + port d'arrivée | oui |
| Plans | `loading_plans` | Plans de chargement et de déchargement d'un voyage | oui |
| | `loads` | Lignes de marchandises d'un plan | oui |
| Notifications | `notifications` | Notifications ciblées par permission | non |
| | `notification_reads` | Lecture d'une notification par un employé | non |

### 5.3 Diagramme des relations

```mermaid
erDiagram
    departments ||--o{ positions : "contient"
    departments ||--o{ employees : "emploie"
    positions ||--o{ employees : "occupé par"
    employees ||--o{ employee_permissions : "possède"
    employees |o--o{ audit_logs : "agit"
    employees ||--o{ refresh_tokens : "session"
    employees ||--o{ notification_reads : "lit"
    notifications ||--o{ notification_reads : "lue par"
    clients ||--o{ client_addresses : "adresses"
    clients ||--o{ client_documents : "documents"
    clients ||--o{ loads : "marchandises"
    vessels ||--o{ voyages : "effectue"
    ports ||--o{ voyages : "départ"
    ports ||--o{ voyages : "arrivée"
    voyages ||--o{ loading_plans : "planifie"
    loading_plans ||--o{ loads : "contient"
    employees |o--o{ loading_plans : "valide"
    employees |o--o{ loads : "charge"
    loading_plans |o--o| loading_plans : "déchargement issu de"
```

`app_modules` n'a aucune clé étrangère : `employee_permissions.module` est une chaîne qui référence un code de module **par convention**, pas par contrainte SQL.

### 5.4 Chaîne logistique

```text
vessels ─┬─ voyages ── loading_plans ── loads ── clients
ports  ──┘  (départ, arrivée)  │          └── loadedBy → employees
                               ├── validatedBy → employees
                               └── sourceLoadingPlan ↔ unloadPlan (plan LOAD → plan UNLOAD, relation 1-1)
```

- `loading_plans.status` est un **booléen** (`false` = ouvert, `true` = validé), accompagné de `validatedAt` et `validatedById`. Ce n'est pas l'enum `DRAFT/SUBMITTED/VALIDATED/CLOSED` envisagé dans l'ancienne feuille de route.
- `loading_plans.operationType` distingue `LOAD` et `UNLOAD`. Un plan `UNLOAD` est **créé automatiquement** à la validation d'un plan `LOAD` (référence `DECH-<référence>`, lié par `sourceLoadingPlanId`, unique).
- `loads.status` : `PENDING` (défaut), `LOADED`, `CANCELLED` (valeurs utilisées par le service).
- `voyages.status` : défaut `DRAFT` dans le schéma, alors que l'API `/voyages` n'accepte que `SCHEDULED | IN_TRANSIT | ARRIVED | CANCELLED` (voir section 14).
- `employees.password` est nullable : un employé peut exister sans accès à l'application.
- `loads.driverName` et `loads.vehiclePlate` sont de simples **textes** : il n'existe plus de tables chauffeur ni véhicule.

### 5.5 Détail des enums, tables, colonnes, relations et index

Section générée à partir de `schema.prisma` (état du 13 octobre 2026). « Type SQL » est le type PostgreSQL produit par Prisma pour le type du schéma.

#### Enums PostgreSQL

| Enum | Valeurs |
| --- | --- |
| `EntityType` | `COMPANY`, `INDIVIDUAL` |
| `ClientAddressType` | `BILLING`, `DELIVERY`, `BOTH` |
| `LoadingPlanOperation` | `LOAD`, `UNLOAD` |

#### Table `departments` (modèle Prisma `Department`)

| Colonne | Type SQL | Null | Défaut | Contraintes / remarques |
| --- | --- | --- | --- | --- |
| `id` | text | non | `uuid()` | **PK** |
| `code` | text | non |  | unique; Ex: "LOGISTICS", "ADMIN", "FINANCE", "TECH", "COMMERCIAL" (correspond à companyStructure.js) |
| `label` | text | non |  | Ex: "Logistique & Opérations Maritimes" |
| `createdAt` | timestamp(3) | non | `now()` |  |
| `updatedAt` | timestamp(3) | non |  | géré par Prisma (`@updatedAt`) |
| `deletedAt` | timestamp(3) | oui |  | Soft delete pour le département |

Relations :

- `positions` → plusieurs `positions` (côté inverse)
- `employees` → plusieurs `employees` (côté inverse)

Index et contraintes de table :

- `index([deletedAt])`

#### Table `positions` (modèle Prisma `Position`)

| Colonne | Type SQL | Null | Défaut | Contraintes / remarques |
| --- | --- | --- | --- | --- |
| `id` | text | non | `uuid()` | **PK** |
| `code` | text | non |  | unique; Ex: "QUAY_AGENT", "HR_MGR" (unique globalement, comme dans companyStructure.js) |
| `label` | text | non |  | Ex: "Agent de quai" |
| `departmentId` | text | non |  |  |
| `createdAt` | timestamp(3) | non | `now()` |  |
| `updatedAt` | timestamp(3) | non |  | géré par Prisma (`@updatedAt`) |
| `deletedAt` | timestamp(3) | oui |  | Soft delete pour le poste |

Relations :

- `department` → un `departments` (clé étrangère `departmentId` → `id`, `ON DELETE Cascade`)
- `employees` → plusieurs `employees` (côté inverse)

Index et contraintes de table :

- `unique([id, departmentId])`
- `index([deletedAt])`

#### Table `employees` (modèle Prisma `Employee`)

| Colonne | Type SQL | Null | Défaut | Contraintes / remarques |
| --- | --- | --- | --- | --- |
| `id` | text | non | `uuid()` | **PK** |
| `name` | text | non |  |  |
| `cin` | text | oui |  | unique |
| `matricule` | text | non |  | unique |
| `phone` | text | oui |  |  |
| `avatarUrl` | text | oui |  |  |
| `departmentId` | text | non |  |  |
| `positionId` | text | non |  |  |
| `hasAppAccess` | boolean | non | `false` |  |
| `email` | text | oui |  | unique |
| `password` | text | oui |  |  |
| `isActive` | boolean | non | `false` |  |
| `createdAt` | timestamp(3) | non | `now()` |  |
| `updatedAt` | timestamp(3) | non |  | géré par Prisma (`@updatedAt`) |
| `deletedAt` | timestamp(3) | oui |  |  |

Relations :

- `department` → un `departments` (clé étrangère `departmentId` → `id`)
- `position` → un `positions` (clé étrangère `positionId, departmentId` → `id, departmentId`)
- `permissions` → plusieurs `employee_permissions` (côté inverse)
- `auditLogs` → plusieurs `audit_logs` (côté inverse)
- `notificationRead` → plusieurs `notification_reads` (côté inverse)
- `refreshTokens` → plusieurs `refresh_tokens` (côté inverse)
- `validatedLoadingPlans` → plusieurs `loading_plans` (côté inverse de la relation) — relation nommée `LoadingPlanValidator`
- `loadedLoads` → plusieurs `loads` (côté inverse de la relation) — relation nommée `LoadLoader`

#### Table `app_modules` (modèle Prisma `AppModule`)

| Colonne | Type SQL | Null | Défaut | Contraintes / remarques |
| --- | --- | --- | --- | --- |
| `id` | text | non | `uuid()` | **PK** |
| `code` | text | non |  | unique; Ex: "EMPLOYEES", "USERS", "DEPARTMENTS", "*" (tous modules) |
| `label` | text | non |  | Ex: "Employés", "Utilisateurs & Accès" |
| `createdAt` | timestamp(3) | non | `now()` |  |
| `updatedAt` | timestamp(3) | non |  | géré par Prisma (`@updatedAt`) |

#### Table `employee_permissions` (modèle Prisma `EmployeePermission`)

| Colonne | Type SQL | Null | Défaut | Contraintes / remarques |
| --- | --- | --- | --- | --- |
| `id` | text | non | `uuid()` | **PK** |
| `employeeId` | text | non |  |  |
| `module` | text | non |  | Le module visé (Ex: "CHARGEMENT", "AUDIT", "EMPLOYEES") |
| `action` | text | non |  | L'action autorisée (Ex: "CREATE", "READ", "UPDATE", "DELETE") |

Relations :

- `employee` → un `employees` (clé étrangère `employeeId` → `id`, `ON DELETE Cascade`)

Index et contraintes de table :

- `unique([employeeId, module, action])`

#### Table `audit_logs` (modèle Prisma `AuditLog`)

| Colonne | Type SQL | Null | Défaut | Contraintes / remarques |
| --- | --- | --- | --- | --- |
| `id` | text | non | `uuid()` | **PK** |
| `employeeId` | text | oui |  | Remplacé userId par employeeId |
| `action` | text | non |  | Ex: "LOADING_PLAN_CREATE" |
| `method` | text | non |  | GET, POST, PUT, DELETE |
| `route` | text | non |  |  |
| `ipAddress` | text | non |  |  |
| `payload` | jsonb | oui |  |  |
| `oldValues` | jsonb | oui |  |  |
| `newValues` | jsonb | oui |  |  |
| `createdAt` | timestamp(3) | non | `now()` |  |

Relations :

- `employee` → un `employees` (clé étrangère `employeeId` → `id`)

#### Table `clients` (modèle Prisma `Client`)

| Colonne | Type SQL | Null | Défaut | Contraintes / remarques |
| --- | --- | --- | --- | --- |
| `id` | text | non | `uuid()` | **PK** |
| `reference` | text | oui |  | unique |
| `name` | text | non |  |  |
| `type` | enum `EntityType` | non | `INDIVIDUAL` |  |
| `firstName` | text | oui |  |  |
| `lastName` | text | oui |  |  |
| `cin` | text | oui |  | unique |
| `cinIssuedAt` | timestamp(3) | oui |  |  |
| `cinIssuedPlace` | text | oui |  |  |
| `legalName` | text | oui |  |  |
| `tradeName` | text | oui |  |  |
| `nif` | text | oui |  | unique |
| `stat` | text | oui |  | unique |
| `rcs` | text | oui |  |  |
| `legalForm` | text | oui |  |  |
| `activity` | text | oui |  |  |
| `email` | text | oui |  |  |
| `phone` | text | oui |  |  |
| `secondaryPhone` | text | oui |  |  |
| `paymentTerms` | text | oui |  |  |
| `currency` | text | non | `"MGA"` |  |
| `taxExempt` | boolean | non | `false` |  |
| `taxExemptionReason` | text | oui |  |  |
| `contractNumber` | text | oui |  |  |
| `habitualCargoType` | text | oui |  |  |
| `receptionContactName` | text | oui |  |  |
| `receptionContactPhone` | text | oui |  |  |
| `receptionContactEmail` | text | oui |  |  |
| `isActive` | boolean | non | `true` |  |
| `notes` | text | oui |  |  |
| `createdAt` | timestamp(3) | non | `now()` |  |
| `updatedAt` | timestamp(3) | non |  | géré par Prisma (`@updatedAt`) |
| `deletedAt` | timestamp(3) | oui |  |  |

Relations :

- `loads` → plusieurs `loads` (côté inverse)
- `addresses` → plusieurs `client_addresses` (côté inverse)
- `documents` → plusieurs `client_documents` (côté inverse)

Index et contraintes de table :

- `index([type])`
- `index([name])`
- `index([deletedAt])`

#### Table `client_addresses` (modèle Prisma `ClientAddress`)

| Colonne | Type SQL | Null | Défaut | Contraintes / remarques |
| --- | --- | --- | --- | --- |
| `id` | text | non | `uuid()` | **PK** |
| `clientId` | text | non |  |  |
| `type` | enum `ClientAddressType` | non |  |  |
| `label` | text | oui |  |  |
| `addressLine1` | text | non |  |  |
| `addressLine2` | text | oui |  |  |
| `city` | text | oui |  |  |
| `region` | text | oui |  |  |
| `postalCode` | text | oui |  |  |
| `country` | text | non | `"Madagascar"` |  |
| `isDefault` | boolean | non | `false` |  |
| `createdAt` | timestamp(3) | non | `now()` |  |
| `updatedAt` | timestamp(3) | non |  | géré par Prisma (`@updatedAt`) |
| `deletedAt` | timestamp(3) | oui |  |  |

Relations :

- `client` → un `clients` (clé étrangère `clientId` → `id`, `ON DELETE Cascade`)

Index et contraintes de table :

- `index([clientId, type])`
- `index([deletedAt])`

#### Table `client_documents` (modèle Prisma `ClientDocument`)

| Colonne | Type SQL | Null | Défaut | Contraintes / remarques |
| --- | --- | --- | --- | --- |
| `id` | text | non | `uuid()` | **PK** |
| `clientId` | text | non |  |  |
| `documentType` | text | non |  |  |
| `documentNumber` | text | oui |  |  |
| `fileName` | text | oui |  |  |
| `fileUrl` | text | oui |  |  |
| `issuedAt` | timestamp(3) | oui |  |  |
| `expiresAt` | timestamp(3) | oui |  |  |
| `verifiedAt` | timestamp(3) | oui |  |  |
| `notes` | text | oui |  |  |
| `createdAt` | timestamp(3) | non | `now()` |  |
| `updatedAt` | timestamp(3) | non |  | géré par Prisma (`@updatedAt`) |
| `deletedAt` | timestamp(3) | oui |  |  |

Relations :

- `client` → un `clients` (clé étrangère `clientId` → `id`, `ON DELETE Cascade`)

Index et contraintes de table :

- `index([clientId, documentType])`
- `index([expiresAt])`
- `index([deletedAt])`

#### Table `vessels` (modèle Prisma `Vessel`)

| Colonne | Type SQL | Null | Défaut | Contraintes / remarques |
| --- | --- | --- | --- | --- |
| `id` | text | non | `uuid()` | **PK** |
| `name` | text | non |  |  |
| `operatorName` | text | oui |  |  |
| `registrationNumber` | text | oui |  | unique |
| `capacityTons` | decimal(65,30) | oui |  |  |
| `status` | text | non | `"ACTIVE"` |  |
| `createdAt` | timestamp(3) | non | `now()` |  |
| `updatedAt` | timestamp(3) | non |  | géré par Prisma (`@updatedAt`) |
| `deletedAt` | timestamp(3) | oui |  |  |

Relations :

- `voyages` → plusieurs `voyages` (côté inverse)

Index et contraintes de table :

- `index([status])`
- `index([deletedAt])`

#### Table `ports` (modèle Prisma `Port`)

| Colonne | Type SQL | Null | Défaut | Contraintes / remarques |
| --- | --- | --- | --- | --- |
| `id` | text | non | `uuid()` | **PK** |
| `code` | text | non |  | unique |
| `name` | text | non |  |  |
| `country` | text | oui |  |  |
| `createdAt` | timestamp(3) | non | `now()` |  |
| `updatedAt` | timestamp(3) | non |  | géré par Prisma (`@updatedAt`) |
| `deletedAt` | timestamp(3) | oui |  |  |

Relations :

- `departureVoyages` → plusieurs `voyages` (côté inverse de la relation) — relation nommée `DeparturePort`
- `arrivalVoyages` → plusieurs `voyages` (côté inverse de la relation) — relation nommée `ArrivalPort`

Index et contraintes de table :

- `index([deletedAt])`

#### Table `voyages` (modèle Prisma `Voyage`)

| Colonne | Type SQL | Null | Défaut | Contraintes / remarques |
| --- | --- | --- | --- | --- |
| `id` | text | non | `uuid()` | **PK** |
| `vesselId` | text | non |  |  |
| `departurePortId` | text | non |  |  |
| `arrivalPortId` | text | non |  |  |
| `voyageNumber` | text | non |  |  |
| `departureDate` | timestamp(3) | oui |  |  |
| `arrivalDate` | timestamp(3) | oui |  |  |
| `status` | text | non | `"DRAFT"` |  |
| `createdAt` | timestamp(3) | non | `now()` |  |
| `updatedAt` | timestamp(3) | non |  | géré par Prisma (`@updatedAt`) |
| `deletedAt` | timestamp(3) | oui |  |  |

Relations :

- `vessel` → un `vessels` (clé étrangère `vesselId` → `id`)
- `departurePort` → un `ports` (clé étrangère `departurePortId` → `id`) — relation nommée `DeparturePort`
- `arrivalPort` → un `ports` (clé étrangère `arrivalPortId` → `id`) — relation nommée `ArrivalPort`
- `loadingPlans` → plusieurs `loading_plans` (côté inverse)

Index et contraintes de table :

- `unique([vesselId, voyageNumber])`
- `index([departurePortId])`
- `index([arrivalPortId])`
- `index([status])`
- `index([deletedAt])`

#### Table `loading_plans` (modèle Prisma `LoadingPlan`)

| Colonne | Type SQL | Null | Défaut | Contraintes / remarques |
| --- | --- | --- | --- | --- |
| `id` | text | non | `uuid()` | **PK** |
| `reference` | text | non |  | unique |
| `voyageId` | text | non |  |  |
| `status` | boolean | non | `false` |  |
| `operationType` | enum `LoadingPlanOperation` | non | `LOAD` |  |
| `totalWeightKg` | decimal(65,30) | non | `0` |  |
| `validatedAt` | timestamp(3) | oui |  |  |
| `validatedById` | text | oui |  |  |
| `sourceLoadingPlanId` | text | oui |  | unique |
| `createdAt` | timestamp(3) | non | `now()` |  |
| `updatedAt` | timestamp(3) | non |  | géré par Prisma (`@updatedAt`) |
| `deletedAt` | timestamp(3) | oui |  |  |

Relations :

- `voyage` → un `voyages` (clé étrangère `voyageId` → `id`)
- `validatedBy` → un `employees` (clé étrangère `validatedById` → `id`) — relation nommée `LoadingPlanValidator`
- `sourceLoadingPlan` → un `loading_plans` (clé étrangère `sourceLoadingPlanId` → `id`, `ON DELETE SetNull`) — relation nommée `LoadingPlanUnload`
- `unloadPlan` → un `loading_plans` (côté inverse de la relation) — relation nommée `LoadingPlanUnload`
- `loads` → plusieurs `loads` (côté inverse)

Index et contraintes de table :

- `index([voyageId])`
- `index([status])`
- `index([deletedAt])`

#### Table `loads` (modèle Prisma `Load`)

| Colonne | Type SQL | Null | Défaut | Contraintes / remarques |
| --- | --- | --- | --- | --- |
| `id` | text | non | `uuid()` | **PK** |
| `loadingPlanId` | text | non |  |  |
| `clientId` | text | non |  |  |
| `driverName` | text | oui |  |  |
| `vehiclePlate` | text | oui |  |  |
| `loadedById` | text | oui |  |  |
| `loadingDate` | timestamp(3) | oui |  |  |
| `packageCount` | integer | non |  |  |
| `description` | text | non |  |  |
| `weightKg` | decimal(65,30) | non |  |  |
| `anomaly` | text | oui |  |  |
| `loadingPosition` | text | oui |  |  |
| `isHazardous` | boolean | non | `false` |  |
| `status` | text | non | `"PENDING"` |  |
| `createdAt` | timestamp(3) | non | `now()` |  |
| `updatedAt` | timestamp(3) | non |  | géré par Prisma (`@updatedAt`) |
| `deletedAt` | timestamp(3) | oui |  |  |

Relations :

- `loadingPlan` → un `loading_plans` (clé étrangère `loadingPlanId` → `id`, `ON DELETE Cascade`)
- `client` → un `clients` (clé étrangère `clientId` → `id`)
- `loadedBy` → un `employees` (clé étrangère `loadedById` → `id`) — relation nommée `LoadLoader`

Index et contraintes de table :

- `index([loadingPlanId])`
- `index([clientId])`
- `index([loadingDate])`
- `index([status])`
- `index([deletedAt])`

#### Table `notifications` (modèle Prisma `Notification`)

| Colonne | Type SQL | Null | Défaut | Contraintes / remarques |
| --- | --- | --- | --- | --- |
| `id` | text | non | `uuid()` | **PK** |
| `type` | text | non |  | Ex: "ACCESS_REQUEST" |
| `message` | text | non |  |  |
| `payload` | jsonb | oui |  | Contexte structuré, ex: { "employeeId": "..." } |
| `targetModule` | text | oui |  |  |
| `targetAction` | text | oui |  |  |
| `createdAt` | timestamp(3) | non | `now()` |  |

Relations :

- `reads` → plusieurs `notification_reads` (côté inverse)

#### Table `notification_reads` (modèle Prisma `NotificationRead`)

| Colonne | Type SQL | Null | Défaut | Contraintes / remarques |
| --- | --- | --- | --- | --- |
| `id` | text | non | `uuid()` | **PK** |
| `notificationId` | text | non |  |  |
| `employeeId` | text | non |  |  |
| `readAt` | timestamp(3) | non | `now()` |  |

Relations :

- `notification` → un `notifications` (clé étrangère `notificationId` → `id`, `ON DELETE Cascade`)
- `employee` → un `employees` (clé étrangère `employeeId` → `id`, `ON DELETE Cascade`)

Index et contraintes de table :

- `unique([notificationId, employeeId])`

#### Table `refresh_tokens` (modèle Prisma `RefreshToken`)

| Colonne | Type SQL | Null | Défaut | Contraintes / remarques |
| --- | --- | --- | --- | --- |
| `id` | text | non | `uuid()` | **PK** |
| `employeeId` | text | non |  |  |
| `tokenHash` | text | non |  | unique |
| `familyId` | text | non |  |  |
| `jti` | text | non |  | unique |
| `expiresAt` | timestamp(3) | non |  |  |
| `revokedAt` | timestamp(3) | oui |  |  |
| `revokedReason` | text | oui |  |  |
| `replacedByTokenId` | text | oui |  |  |
| `lastUsedAt` | timestamp(3) | oui |  |  |
| `createdAt` | timestamp(3) | non | `now()` |  |
| `updatedAt` | timestamp(3) | non |  | géré par Prisma (`@updatedAt`) |

Relations :

- `employee` → un `employees` (clé étrangère `employeeId` → `id`, `ON DELETE Cascade`)

Index et contraintes de table :

- `index([employeeId, revokedAt])`
- `index([expiresAt])`

### 5.6 Intégrité gérée par le code (non exprimée en SQL)

Ces règles sont appliquées par les services et la validation Zod, pas par des contraintes de base :

- poids d'une ligne strictement positif, nombre de colis entier positif ;
- total d'un plan inférieur ou égal à la capacité du navire (`vessels.capacityTons × 1000` kg) ;
- plan validé non modifiable ;
- l'arrivée d'un voyage ne précède pas son départ (à la création ; **non garanti** pour une mise à jour partielle, voir section 14) ;
- unicité du numéro de voyage **par navire** en base (`@@unique([vesselId, voyageNumber])`), mais le service vérifie le numéro seul (section 14) ;
- codes de module de permission valides (`employee_permissions.module` n'est pas une clé étrangère).

### 5.7 Migrations

Dossier `server/prisma/migrations/` (verrou : `migration_lock.toml`, fournisseur PostgreSQL). Ordre chronologique :

| # | Migration | Effet |
| --- | --- | --- |
| 1 | `20260721085445_add_employees_clients_drivers` | Crée l'enum `EntityType` et notamment `employees`, `employee_permissions`, `audit_logs`, `clients`, `drivers` |
| 2 | `20260721203045_make_cin_optional` | Ajoute `employees.matricule` (obligatoire, unique) ; le nom de la migration évoque la rendre `cin` facultative |
| 3 | `20260722135433_add_departments_positions` | Supprime la colonne texte `employees.department` ; crée `departments` et `positions` (codes uniques, unicité `(id, departmentId)`) |
| 4 | `20260725091703_add_modules_table` | Crée `app_modules` |
| 5 | `20260727125351_add_softdelet_on_companie_structure` | Ajoute `deletedAt` (+ index) sur `departments` et `positions` |
| 6 | `20260819101011_add_notifications` | Crée `notifications` et `notification_reads` |
| 7 | `20260823105930_add_refresh_token` | Crée `refresh_tokens` (hash et `jti` uniques, index sur `(employeeId, revokedAt)` et `expiresAt`) |
| 8 | `20260913070313_add_maritime_models` | Crée `vessels`, `ports`, `voyages`, `vehicles` |
| 9 | `20260913072402_add_loading_plans_and_cargo_lines` | Crée `loading_plans` et `cargo_lines` |
| 10 | `20260914090000_enrich_client_identity_and_documents` | Crée l'enum `ClientAddressType`, enrichit `clients`, crée `client_addresses` et `client_documents` |
| 11 | `20260915100824_remove_vehicle_driver_tables` | Supprime `cargo_lines.driverId` et `vehicleId`, puis les tables `drivers` et `vehicles` |
| 12 | `20260915180025_change_status_on_loading_plan_to_boolean` | Supprime puis recrée `loading_plans.status` en booléen (défaut `false`) |
| 13 | `20261003132651_rename_cargo_lines_to_loads` | Supprime `cargo_lines` et crée `loads` **sans copier les données** |
| 14 | `20261003143000_add_loading_plan_operation_type` | Crée l'enum `LoadingPlanOperation` et la colonne `loading_plans.operationType` (défaut `LOAD`) |
| 15 | `20261003183000_link_unload_plans` | Ajoute `loading_plans.sourceLoadingPlanId` (unique, clé étrangère auto-référente) |
| 16 | `20261003190000_backfill_unload_plans` | Migration de données : crée les plans `UNLOAD` manquants (`DECH-…`) pour les plans `LOAD` déjà validés dont toutes les lignes actives sont chargées |
| 17 | `20261003200000_reset_inherited_unload_transport` | Migration de données : remet à `NULL` chauffeur et plaque des lignes de déchargement identiques à leur ligne source |

À retenir : ne jamais appliquer ces migrations à une base peuplée sans sauvegarde (les n° 12 et 13 détruisent des données) ; ne jamais lancer `prisma migrate reset` sur une base contenant de vraies données.

### 5.8 Données de démonstration (seeds)

| Fichier | Contenu | Précaution |
| --- | --- | --- |
| `prisma/seed.js` | Structure de l'entreprise : départements (`LOGISTICS`, `ADMIN`, `FINANCE`, …) et leurs postes (`QUAY_AGENT`, `HR_MGR`, `ACCOUNTANT`, …) | — |
| `prisma/seedAppModules.js` | Modules de permission (`*`, `EMPLOYEES`, `USERS`, `COMPANY_STRUCTURE`, `MODULE`, `CLIENT`, `VESSELS`, `PORTS`, `VOYAGES`, `LOADING_PLANS`, `CARGO`) | Complet : la liste reprend exactement les codes vérifiés par le serveur et par le client |
| `prisma/seedAdmin.js` (`npm run seed:admin`) | Administrateur universel : matricule `TECH-SA-01`, droit `(*, *)`, rattaché au département technique | Idempotent ; exécuté par le service `seed` au démarrage de l'environnement conteneurisé |
| `prisma/seedDemo.js` (`npm run seed:demo`) | Jeu complet : employés et permissions, clients, adresses, documents, notifications, journal d'audit, jetons de session | Idempotent ; enchaîne les scripts de référence puis complète les tables restantes |
| `prisma/seedLoadingPlan.js` (`npm run seed:loading`) | Navires, voyages, clients et plans de référence (total attendu 95,444 t) | **Destructif** : supprime puis recrée les marchandises des plans de référence ; deux lignes créées avec `weightKg: 0` contournent la validation de l'API, ce qui est voulu : elles représentent des marchandises dont le poids reste à confirmer |

## 6. Authentification et sécurité

**Connexion** : `POST /api/v1/auth/login` avec `{ identifier, password }` ; l'identifiant est l'**email ou le matricule**. Le compte doit être actif, non supprimé et avoir `hasAppAccess`.

**Jetons et cookies** :

- Access token JWT (type `access`, durée `JWT_EXPIRES_IN`, 15 min par défaut) dans le cookie **signé** `token` (httpOnly). Le header `Authorization: Bearer` est accepté en secours (Postman).
- Refresh token JWT (type `refresh`, 7 jours par défaut) dans le cookie `refreshToken` ; seul son hash SHA-256 est stocké en base. `POST /auth/refresh` effectue une **rotation** (l'ancien jeton est révoqué avec la raison `rotated`).
- Cookie `xsrf-token` (lisible par le JavaScript, 15 min) pour la protection CSRF.
- Cookies en `sameSite: "lax"`, `secure` uniquement en production.

**CSRF (double-submit)** : toute requête `POST/PUT/PATCH/DELETE` doit envoyer le header `X-CSRF-Token` égal au cookie `xsrf-token`. Exemptés : `/auth/login`, `/auth/csrf-token`, `/health`. Le frontend l'ajoute automatiquement (`axiosInstance`) et obtient un token via `GET /auth/csrf-token` si nécessaire.

**Autres protections** :

- `helmet`, CORS restreint à `CLIENT_URL` (credentials activés, headers `Content-Type`, `Authorization`, `X-CSRF-Token`).
- Rate limit global sur `/api` (100 requêtes / 15 min en production, 500 en développement) et limiteur de login (5 / minute).
- **Journal d'audit** (`audit.middleware.js`) : chaque `POST/PUT/PATCH/DELETE` écrit une ligne `AuditLog` (employé, action, route, IP, payload, anciennes/nouvelles valeurs). Les clés dont le nom contient `password`, `token`, `secret`, `authorization`, `cookie` ou `csrf` sont remplacées par `[REDACTED]` récursivement. Les valeurs éventuellement journalisées **avant** ce correctif n'ont pas été purgées automatiquement.
- **Upload d'avatar** (`POST /uploads/avatar`) : fichier gardé en mémoire (5 Mo max), type détecté par **signature binaire** (JPEG, PNG, WEBP) et extension imposée ; un utilisateur ne peut écrire que son propre avatar sauf permission `EMPLOYEES` adéquate. Fichiers servis sous `/uploads` (dossier `server/public/uploads/avatars`).
- **Socket.IO authentifié** : le handshake lit le cookie signé `token`, vérifie le JWT puis l'employé (actif, non supprimé, accès app) ; la room `employee_<id>` est déduite de l'identité authentifiée.
- **Anti auto-élévation** (`owner.middleware.js`, `isSelfOrAuthorized`) : un employé peut agir sur sa propre fiche mais ne peut pas modifier ses `permissions`, `hasAppAccess` ou `isActive` sans `EMPLOYEES:UPDATE` (ou le joker `*:*`).

## 7. Permissions

Chaque employé possède une liste de paires `{ module, action }`. Actions : `CREATE`, `READ`, `UPDATE`, `DELETE`, et le joker `*`. La paire `{ "*", "*" }` donne tous les droits (équivalent super-administrateur). Le frontend charge les permissions au login (`/auth/me`) et les met à jour par Socket.IO (`profile-updated`).

Les codes de module sont libres côté base (`AppModule`), mais ceux **réellement vérifiés par le code** sont :

| Module | Utilisé par | Fichier d'entrée |
| --- | --- | --- |
| `EMPLOYEES` | `/employees`, sous-routes de permissions, création de poste, upload d'avatar | `employee.routes.js` |
| `COMPANY_STRUCTURE` | `/company-structure` (départements, postes) | `company-structure.routes.js` |
| `CLIENT` (singulier) | `/clients` | `client.routes.js` |
| `VESSELS`, `PORTS` | `/maritime/vessels`, `/maritime/ports` | `maritime.routes.js` |
| `LOADING_PLANS` | `/loading-plans`, validation des lignes | `loading-plan.routes.js` |
| `VOYAGES` | `/voyages` | `voyage.route.js` |
| `CARGO` | lignes de marchandises `/loading-plans/:id/loads` | `loading-plan.routes.js` |
| `USERS`, `MODULE` | écrans front ; **côté API** les routes `/users` et `/modules` (mutations) sont réservées au **département `TECH`** via `restrictToDepartment("TECH")` | `user.routes.js`, `module.routes.js` |

Le seed `server/prisma/seedAppModules.js` liste exactement ces codes ; les modules devenus inutiles sont retirés du catalogue lors de son exécution.

## 8. API REST

Préfixe : `/api/v1`. Toutes les routes ci-dessous exigent l'authentification (`protect`) sauf mention contraire, et les mutations exigent le header CSRF.

| Ressource | Routes | Contrôle d'accès |
| --- | --- | --- |
| Santé | `GET /health` | public |
| Auth | `GET /auth/csrf-token`, `POST /auth/login` (limiteur + validation), `POST /auth/refresh`, `GET /auth/me`, `POST /auth/logout`, `GET /auth/test` | login/csrf/refresh publics |
| Utilisateurs (accès) | `GET /users`, `/users/pending`, `/users/permissions`, `/users/:id` ; attribution, mise à jour et révocation d'accès ; ajout/retrait de permissions | département `TECH` |
| Employés | `GET/POST /employees` ; `GET/PUT /employees/:id` ; `DELETE /employees/:id` ; sous-routes de permissions | `EMPLOYEES` (`READ/CREATE/DELETE`, `UPDATE` pour les permissions) ; `GET/PUT :id` via `isSelfOrAuthorized` |
| Structure | `GET /company-structure` ; départements et postes en CRUD | `COMPANY_STRUCTURE` (la **création de poste** exige `EMPLOYEES:CREATE`) |
| Modules | `GET /modules`, `GET /modules/:id` ; `POST/PUT/DELETE` | lecture authentifiée, mutations `TECH` |
| Uploads | `POST /uploads/avatar` (champ multipart `avatar`) | identité ou `EMPLOYEES` |
| Clients | CRUD `/clients` | `CLIENT` |
| Notifications | `GET /notifications`, `PATCH /notifications/:id/read` | authentifié |
| Maritime | CRUD `/maritime/vessels` et `/maritime/ports` | `VESSELS`, `PORTS` |
| Voyages | CRUD `/voyages` | `VOYAGES` |
| Plans | `GET/POST /loading-plans` ; `GET /loading-plans/reference/:reference` ; `GET/PUT/DELETE /loading-plans/:id` ; `POST /loading-plans/:id/validate` | `LOADING_PLANS` |
| Marchandises | `POST /loading-plans/:id/loads` ; `PUT/DELETE /loading-plans/:id/loads/:loadId` | `CARGO` |

**Non exposé** : `/drivers`, `/maritime/vehicles` et `/maritime/voyages` (retirés). Les lignes de marchandises sont accessibles par `/loading-plans/:id/loads`.

Cette liste a été relevée dans les fichiers de routes ; les chemins exacts des sous-routes de permissions/accès sont dans `user.routes.js` et `employee.routes.js`.

## 9. Règles métier des plans de chargement

Implémentées dans `server/src/modules/loading-plans/` :

- Un **plan** est rattaché à un **voyage** et identifié par une `reference` unique. À la création, seul le type `LOAD` est accepté : un plan `UNLOAD` ne se crée pas à la main.
- Chaque **ligne** (`Load`) exige un client, un nombre de colis entier positif, un poids strictement positif (kg) et une description. Chauffeur, plaque, position, anomalie, danger et chargeur (`loadedBy`) sont optionnels.
- Le **poids total** est **recalculé côté serveur** à chaque ajout, modification ou suppression ; les lignes `CANCELLED` sont exclues du total.
- La **capacité du navire** (`capacityTons`) est contrôlée : dépasser `capacité × 1000` kg est refusé.
- Un plan **validé** (`validatedAt` renseigné) n'est plus modifiable (erreur 409).
- **Validation** (`POST /:id/validate`) : toutes les lignes actives doivent être `LOADED` ; le plan passe à `status = true` avec la date et l'employé validateur.
- La validation d'un plan `LOAD` **génère automatiquement un plan de déchargement** de référence `DECH-<référence>` (`operationType = UNLOAD`, lié par `sourceLoadingPlanId`, lignes recopiées en `PENDING`). Les lignes d'un plan de déchargement ne s'ajoutent pas à la main.
- Pour le jeu de démonstration de référence, le total attendu est de **95,444 tonnes** (test d'intégration `logistics-data.test.js`).

## 10. Temps réel (Socket.IO)

Le client ne se connecte qu'après authentification (`autoConnect: false`, géré par `AuthContext`). Événements émis par le serveur (noms exacts relevés dans le code) :

| Événement | Émis par | Écouté par le frontend |
| --- | --- | --- |
| `profile-updated`, `account-disabled` (room `employee_<id>`) | auth, users, employees | `AuthContext` |
| `users:changed` | users | `UsersPage` |
| `employees:changed` | employees | `Employeepage` |
| `clients:changed` | clients | `ClientPage` |
| `modules:changed` | modules | `ModulePage` |
| `company-structure:changed` | company-structure | `CompanyStructurePage` |
| `notification:new`, `notification:removed` | notifications | `NotificationContext` |

| `voyage:changed` | `voyage.service.js` | **personne** |
| `load:changed` | `load.service.js` (ses routes `/loads` ne sont pas montées) | **personne** |
| `ships:changed`, `ports:changed` | `maritime.service.js` | `ShipPage`, `PortPage` |

Conséquence : la synchronisation temps réel des navires, ports et voyages **ne fonctionne pas de bout en bout** (noms d'événements non alignés, aucun émetteur pour navires/ports). À corriger en alignant les noms et en émettant depuis les contrôleurs/services concernés.

## 11. Frontend : pages et routes

Routes déclarées dans `client/src/core/routes/routeConfig.jsx`, toutes protégées par `RoleGuard` (redirige vers `/login` sans session, vers `/dashboard` sans permission).

| Route | Page | Permission requise (frontend) |
| --- | --- | --- |
| `/login` | `LoginPage` | publique |
| `/dashboard` | `DashboardPage` | aucune |
| `/employees` | `Employeepage` | `EMPLOYEES:READ` |
| `/client` | `ClientPage` | `CLIENT:READ` |
| `/ship` | `ShipPage` | `VESSELS:READ` |
| `/ports` | `PortPage` | `PORTS:READ` |
| `/voyages` | `VoyagePage` | `VOYAGES:READ` |
| `/plans` | `PlansPage` | `LOADING_PLANS:READ` |
| `/plans/load/:reference`, `/plans/unload/:reference` | `LoadPage` (chargement / déchargement) | `LOADING_PLANS:READ` |
| `/users` | `UsersPage` | `USERS:READ` |
| `/module` | `ModulePage` | `MODULE:READ` |
| `/company-structure` | `CompanyStructurePage` | `COMPANY_STRUCTURE:READ` |
| `/template` | `TemplatePage` (laboratoire visuel, masqué du menu) | aucune |


Le **manifeste PDF** d'un plan est généré côté client (`features/plans/components/LoadingManifestPdf.jsx`, `jspdf` + `jspdf-autotable`, A4 portrait, lignes groupées par date). Il n'existe pas de route d'export côté serveur.

Détails du frontend : [`client/README.md`](client/README.md).

## 12. Installation, configuration, commandes

**Prérequis** : Node.js 18+, npm, PostgreSQL.

```powershell
# Dépendances
cd client;  npm install
cd ..\server; npm install

# Base de données (depuis server/)
npx prisma generate
npx prisma migrate dev
```

**Variables d'environnement serveur** (`server/.env.development` en développement, `server/.env` sinon ; `server.js` choisit le fichier selon `NODE_ENV`). Variables **obligatoires** vérifiées au démarrage : `JWT_SECRET`, `JWT_REFRESH_SECRET`, `COOKIE_SECRET`, `DATABASE_URL`.

```env
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DBNAME
COOKIE_SECRET=remplacer-par-un-secret-fort
JWT_SECRET=remplacer-par-un-secret-fort
JWT_REFRESH_SECRET=remplacer-par-un-secret-fort
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
LOG_LEVEL=info
```

> `server/.gitignore` ignore `.env` et toutes ses variantes (`.env.development`, `.env.production`), à l'exception de `.env.example`, qui ne contient aucune valeur réelle et sert de modèle.

**Frontend** : variable optionnelle `VITE_API_URL` (par défaut `/api/v1`, avec proxy Vite `/api` → `http://localhost:5000`).

**Démarrage en développement** (deux terminaux) :

```powershell
cd server; npm run dev      # nodemon + .env.development, port 5000
cd client; npm run dev      # Vite, http://localhost:5173
```

**Commandes utiles**

| Où | Commande | Rôle |
| --- | --- | --- |
| `server/` | `npm test` | tests unitaires (`node --test test/unit/`) |
| `server/` | `npm run test:integration` | test d'intégration (nécessite une base seedée) |
| `server/` | `npm run seed:demo` | jeu de démonstration complet : structure, modules, administrateur, marchandises, entrepôt (**destructif** pour les plans de référence) |
| `server/` | `npm run seed:loading` | seed du plan de chargement de référence (**destructif** pour les plans de référence) |
| `server/` | `npm start` | production (`.env.production`) |
| `server/` | `npx prisma migrate status` / `studio` | état des migrations / interface de données |
| `client/` | `npm run build` / `preview` | build / prévisualisation |

Seeds : `prisma/seed.js` (structure : départements et postes), `prisma/seedAppModules.js` (catalogue des modules de permissions), `prisma/seedAdmin.js` (administrateur universel), `prisma/seedLoadingPlan.js` (navires, voyages, clients, plans de référence). Les trois premiers sont enchaînés par `npm run seed` et exécutés automatiquement par le service `seed` de l'orchestrateur ; le dernier reste une commande manuelle, car il écrase les plans de référence. Logs Winston dans `server/logs/` (`errors.log`, `combined.log`).

### 12.0. Deux modes de fonctionnement

L'application se lance de deux façons, qui ne s'utilisent pas en même temps car
elles occupent le même port.

**Mode développement — le plus courant, sans reconstruction**

La base de données seule est conteneurisée ; le serveur et l'interface sont
exécutés sur le poste, avec rechargement automatique à chaque modification.

```powershell
# 1. la base de donnees (seul conteneur necessaire)
docker compose up -d db

# 2. l'interface de programmation, dans une fenetre de terminal
cd app_gestion\server
npm run dev            # nodemon + .env.development, port 5000

# 3. l'interface web, dans une autre fenetre de terminal
cd app_gestion\client
npm run dev            # Vite, http://localhost:5173
```

Vite recharge l'interface à chaud : une modification du code est visible
immédiatement dans le navigateur, sans reconstruction. Le serveur est
redémarré par nodemon dès qu'un de ses fichiers change. Les requêtes
`/api` sont relayées par Vite vers le serveur local, comme en production
où nginx joue ce rôle.

**Mode démonstration — la pile entièrement conteneurisée**

```powershell
docker compose up --build
```

Les quatre services sont alors construits et démarrés, l'interface est servie
sur le port 8080. Ce mode suppose que le serveur local des deux fenêtres
précédentes est arrêté, sous peine de conflit sur le port 5000.

Le premier lancement peut afficher une page’ancienne : l'application étant une
application web progressive, un agent de service reste enregistré dans le
navigateur et sert le bundle précédent. Un rechargement forcé
(`Ctrl+Maj+R`) ou la désinscription de l'agent de service dans les
paramètres du navigateur suffit à retrouver la version courante.

### 12.1. Déploiement avec Docker
Le projet se déploie intégralement avec Docker : une commande suffit à démarrer la base,
appliquer les migrations, lancer l'interface de programmation et servir l'interface web.

```powershell
cd app_gestion
docker compose up --build
```

| Service | Rôle | Accès |
| --- | --- | --- |
| `db` | PostgreSQL 16, volume persistant `donnees-postgres` | port interne 5432 |
| `seed` | applique les migrations, installe les données de référence et amorce l'administrateur universel, puis s'arrête | — |
| `server` | API Node.js/Express, utilisateur non privilégié, sonde de santé | http://localhost:5000 |
| `client` | interface web compilée par Vite, servie par nginx, relais de `/api` vers le serveur | http://localhost:8080 |

Points notables :

- le serveur est construit en trois étapes (dépendances de développement, dépendances de
  production, image finale) et s'exécute avec l'utilisateur `nodejs` ;
- le service `seed` enchaîne l'application des migrations, la création de la structure de
  l'entreprise, le catalogue des modules de permissions et l'amorçage de l'administrateur
  universel ; le serveur ne démarre qu'une fois cette étape réussie ;
- la sonde de santé du conteneur serveur interroge `GET /api/v1/health` ;
- nginx sert le bundle de l'interface, met en cache les ressources versionnées et renvoie
  toute route inconnue vers `index.html`, le routeur de l'application prenant le relais ;
- les secrets sont lus dans l'environnement ; un fichier `.env` placé à la racine de
  `app_gestion` permet de les surcharger (`POSTGRES_USER`, `POSTGRES_PASSWORD`,
  `POSTGRES_DB`, `COOKIE_SECRET`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `SERVER_PORT`,
  `CLIENT_PORT`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`) ;
- les fichiers téléversés et les données de la base sont conservés dans des volumes nommés.

Commandes courantes :

```powershell
docker compose up --build -d      # démarrage en arrière-plan
docker compose ps                 # état des services
docker compose logs -f server     # journaux du serveur
docker compose down               # arrêt (les volumes sont conservés)
docker compose down -v            # arrêt et suppression des volumes
docker compose --profile demo run --rm seed-demo   # jeu de données de démonstration
```

### 12.2. Jeu de données de démonstration

Un jeu de données de démonstration alimente **l'ensemble des tables** du modèle physique :
structure de l'entreprise, employés et permissions, clients avec leurs adresses et leurs
documents, référentiel maritime, plans de chargement et lignes de marchandises,
notifications et leur lecture, journal d'audit et jetons de session.

```powershell
cd app_gestion
docker compose --profile demo run --rm seed-demo
```

Le script est idempotent : il peut être relancé sans dupliquer les enregistrements. Il
enchaîne les scripts de référence (structure, modules, administrateur, données logistiques)
puis complète les tables que ceux-ci ne couvrent pas.

Le tableau complet des comptes, des adresses et des ports figure dans
`IDENTIFIANTS.md`, à la racine du dépôt.

| Compte | Identifiant | Mot de passe | Périmètre |
| --- | --- | --- | --- |
| Administrateur universel | `admin@lct.mg` | `Admin@2026` | Toutes les permissions (département technique) |
| Technicien | `t.rabe@lct.mg` | `Demo@2026` | Employés, utilisateurs, modules, structure |
| Coordinatrice logistique | `n.rasoanaivo@lct.mg` | `Demo@2026` | Clients, navires, ports, voyages, plans, marchandises |
| Agent de quai | `j.rakoto@lct.mg` | `Demo@2026` | Lecture clients et plans, saisie des marchandises |
| Responsable RH | `t.rabemananarisoa@lct.mg` | `Demo@2026` | Employés et structure de l'entreprise |
| Chargé de clientèle | `m.andrianarisoa@lct.mg` | `Demo@2026` | Clients et lecture des plans |
| Comptable | `h.randrianasolo@lct.mg` | `Demo@2026` | Lecture clients et plans |
| Développeur | `f.rakotomalala@lct.mg` | `Demo@2026` | Lecture employés, clients et plans |
| Responsable de flotte | `f.rakotonirina@lct.mg` | — | Pas d'accès : illustre une demande d'accès en attente |
| Membre d'équipage | `s.raharimalala@lct.mg` | — | Pas d'accès : illustre une demande d'accès en attente |
| Directeur des opérations | `f.rabemananarisoa@lct.mg` | — | Pas d'accès : illustre une demande d'accès en attente |

Les trois derniers employés n'ont pas d'accès à l'application : ils illustrent le circuit de
demande d'accès, qui notifie les administrateurs du département technique.

En local, le même jeu s'obtient par `npm run seed:demo`, la base du conteneur étant alors
atteignable sur le port publié `DB_PORT` (5432 par défaut).

### 12.3. Compte administrateur universel

Le service `seed` installe un compte disposant de tous les droits, afin de pouvoir créer
ensuite les comptes des utilisateurs de l'entreprise depuis l'interface. Ce compte est
rattaché au département technique, seul département autorisé à gérer les accès.

| Identifiant | Valeur par défaut | Variable d'environnement |
| --- | --- | --- |
| Adresse de connexion | `admin@lct.mg` | `ADMIN_EMAIL` |
| Mot de passe initial | `Admin@2026` | `ADMIN_PASSWORD` |
| Nom affiché | `Administrateur Système` | `ADMIN_NAME` |

Le script `prisma/seedAdmin.js` est idempotent : le relancer met à jour le mot de passe et
les droits du compte existant au lieu d'en créer un second. Le mot de passe doit être changé
dès la première connexion ; il est par ailleurs lisible dans la configuration de
l'environnement, ce qui doit être traité comme une information provisoire.

## 12ter. Module d'entreposage

Les marchandises dechargees d'un navire sont conservees en entrepot, dans l'attente
soit du retrait par le client, soit du reembarquement sur un prochain voyage. Le
module est protege par le droit `ENTREPOTS`.

| Route | Effet | Droit |
| --- | --- | --- |
| `GET /api/v1/warehouse` | Liste des entrepots, avec le nombre d'articles et le tonnage stocke | `ENTREPOTS:READ` |
| `POST /api/v1/warehouse` | Creation d'un entrepot | `ENTREPOTS:CREATE` |
| `PUT /api/v1/warehouse/:id` | Modification d'un entrepot | `ENTREPOTS:UPDATE` |
| `DELETE /api/v1/warehouse/:id` | Suppression logique, refusee si l'entrepot contient encore du stock | `ENTREPOTS:DELETE` |
| `GET /api/v1/warehouse/items` | Marchandises en entrepot, filtrables par entrepot, client et statut | `ENTREPOTS:READ` |
| `POST /api/v1/warehouse/items` | Entree en entrepot, avec controle de la capacite | `ENTREPOTS:CREATE` |
| `POST /api/v1/warehouse/items/:id/pickup` | Retrait par le client : la marchandise quitte l'entrepot | `ENTREPOTS:UPDATE` |
| `POST /api/v1/warehouse/items/:id/embark` | Reembarquement : la marchandise rejoint un plan de chargement | `ENTREPOTS:UPDATE` |
| `GET /api/v1/warehouse/items/movements` | Journal des entrees et des sorties | `ENTREPOTS:READ` |

Le cycle de vie d'une marchandise est decrit par son statut : `IN_STOCK` (en
attente), `EMBARKED` (reembarquee) ou `PICKED_UP` (retiree). Chaque changement
de statut ecrit un mouvement, qui porte la date, l'agent et l'entrepot.

Une marchandise n'entre en entrepot qu'a partir d'une ligne de plan de
dechargement **valide** : le navire doit etre arrive. La reembarquement, elle,
s'appuie sur le service des plans : la capacite du navire est controlee et le
total du plan est recalcule.

## 12bis. Tableau de bord

Le tableau de bord est la premiere ecran de l'application. Une seule route,
`GET /api/v1/dashboard/summary`, renvoie l'ensemble des indicateurs dans une
reponse unique.

Le contenu est **filtre cote serveur**, bloc par bloc, d'apres les droits de
l'utilisateur connecte : un bloc absent de la reponse n'est pas calcule et ne
transite pas sur le reseau. C'est ce qui permet a un meme ecran de servir des
profils tres differents.

| Bloc | Condition d'affichage | Contenu |
| --- | --- | --- |
| `plans` | `LOADING_PLANS:READ` | Plans actifs, tonnage embarque, marchandises a peser, taux de remplissage des navires, tonnage par client, repartition des lignes |
| `clients` | `CLIENT:READ` | Clients actifs, nouveaux clients sur trente jours, documents arrivant a echeance |
| `voyages` | `VOYAGES:READ` | Nombre de voyages, repartition par statut, prochains departs |
| `acces` | `USERS:READ` | Demandes d'acces en attente de traitement |
| `employes` | `EMPLOYEES:READ` | Effectifs actifs et employes sans acces |
| `audit` | Departement technique | Dix dernieres entrees du journal d'audit |
| `notifications` | Tout employe connecte | Cinq dernieres notifications |

Concretement, un agent de quai ne recoit ni le journal d'audit ni les effectifs,
un developpeur du departement technique ne recoit ni les plans de chargement ni
les clients, et un charge de clientele ne recoit ni les employes ni les demandes
d'acces. Les tests unitaires `test/unit/dashboard-permissions.test.js`
verifient cette regle de filtrage.

## 13. Tests

Serveur, runner natif `node --test`. La commande `npm test` exécute l'ensemble des tests du dossier `test/unit` ;
les 20 tests passent.

| Fichier | Couvre |
| --- | --- |
| `test/unit/logistics-validation.test.js` | navire, port, voyage (dates), plan, ligne de marchandise |
| `test/unit/client-validation.test.js` | validation des fiches client |
| `test/unit/audit-redaction.test.js` | masquage des secrets dans l'audit |
| `test/unit/socket-auth.test.js` | authentification du handshake Socket.IO |
| `test/unit/voyage-read-auth.test.js` | `VOYAGES:READ` sur les lectures de voyages |
| `test/unit/upload-signature.test.js` | détection de signature d'image |
| `test/integration/logistics-data.test.js` | données de démonstration, total 95,444 t, seed rejouable (nécessite une base seedée) |

Aucun test frontend, aucun test HTTP de bout en bout, aucun test de permissions par route.

## 14. État du projet après correctifs

État établi par lecture du code et exécution des tests le 20 octobre 2026, sur la branche
`feature/corrections-p0-p1-docker`.

### 14.1. Points corrigés

| # | Sujet | Correction |
| --- | --- | --- |
| 1 | Casse du nom de fichier du middleware | `Restricttodepartment.middleware.js` renommé `restrictToDepartment.middleware.js` : le démarrage sous Linux ne dépend plus de la casse du système de fichiers |
| 2 | Double API Voyage | Route `/maritime/voyages` retirée ; l'API unique `/voyages` (permission `VOYAGES`) est conservée |
| 3 | Statut par défaut des voyages | La valeur par défaut du schéma passe de `DRAFT` à `SCHEDULED` (migration `20261020120000_aligner_statut_voyage`), alignée sur les statuts réellement utilisés |
| 4 | Unicité du numéro de voyage | Le service contrôle désormais le couple `(voyageNumber, vesselId)`, conformément à la contrainte du schéma |
| 5 | Mise à jour partielle des dates | La date reçue est comparée à la date déjà enregistrée lorsqu'une seule des deux est transmise : un voyage ne peut plus se terminer avant son départ |
| 6 | Vestiges chauffeur et véhicule | Modules serveur `driver` et `ship`, route `/maritime/vehicles`, fonctionnalités `driver` et `maritime` du client supprimés |
| 7 | Route `/loads` non montée | `load.route.js` supprimé ; les lignes de marchandises restent accessibles par `/loading-plans/:id/loads` |
| 8 | Diffusion temps réel des référentiels | `maritime.service.js` diffuse `ships:changed` et `ports:changed` ; l'événement des voyages est harmonisé en `voyages:changed`, le nom entendu par le client |
| 9 | Suppression des navires et des ports | Passage en suppression logique, cohérente avec le reste de l'application |
| 10 | Création d'un poste | La permission exigée est `COMPANY_STRUCTURE:CREATE` et non `EMPLOYEES:CREATE` |
| 11 | Bouton d'ajout d'un département | Le bouton n'est affiché que si l'utilisateur possède `COMPANY_STRUCTURE:CREATE` |
| 12 | Exclusions du suivi de version | `.gitignore` ignore `.env`, `.env.*` (hors `.env.example`), `logs` et `public/uploads` ; `.env.example` est fourni |
| 13 | Dépendances déclarées | `joi`, `bcrypt`, `express-mongo-sanitize` (serveur) et `antd`, `@ant-design/icons`, `zustand` (client) retirés ; `cookie` et `cookie-signature` déclarés |
| 14 | Test d'authentification des voyages | Le test inspecte la pile de routes d'Express 5 (`layer.handle`) et non celle d'Express 4 : les 20 tests unitaires passent |
| 15 | Test de signature des fichiers téléversés | Ajouté au script `test:unit` (`node --test test/unit/`) |
| 16 | Catalogue des modules de permissions | `seedAppModules.js` reprend exactement les codes vérifiés par le serveur et par le client, et retire les modules devenus inutiles |
| 17 | Conteneurisation | `Dockerfile` pour le serveur et pour le client, `nginx.conf`, `docker-compose.yml` (base, migration, serveur, interface) et `.dockerignore` |
| 18 | Cohérence des données de référence | Le seed de démonstration employait des statuts de voyage (`CLOSED`, `OPEN`) qui ne sont plus acceptés par l'interface de programmation : les valeurs ont été alignées sur `ARRIVED` et `IN_TRANSIT` |
| 19 | Amorçage de l'administrateur universel | `prisma/seedAdmin.js` installe un compte disposant du droit `(*, *)` dans le département technique, exécuté automatiquement par le service `seed` au démarrage de l'environnement conteneurisé |
| 20 | Casse des noms de fichiers importés | La construction des images Linux a révélé cinq incohérences invisibles sur Windows : `Departmentaddmodal.jsx`, `Positionaddmodal.jsx`, `Employeepage.jsx` et `Employeetable.jsx` côté interface, `User.validation.js` côté serveur. Les fichiers ont été renommés pour correspondre à leurs imports (`DepartmentAddModal`, `PositionAddModal`, `EmployeePage`, `EmployeeTable`, `user.validation`) |
| 21 | Droits `USERS` et `MODULE` non appliqués par le serveur | Les routes de gestion des accès et celles du catalogue des modules n'étaient protégées que par le département technique : les permissions `USERS` et `MODULE` du catalogue n'étaient donc jamais vérifiées, alors que l'interface les exige. Chaque route vérifie désormais le droit correspondant, en plus de la restriction de département pour la gestion des accès |

### 14.3. Finalisation de l'application

| # | Sujet | Correction |
| --- | --- | --- |
| 22 | Table `client_documents` | Elle n'etait utilisee par aucun module : la table et ses donnees de demonstration ont ete retirees par la migration `20261021120000_retirer_client_documents_et_indexer_audit` |
| 23 | Suppression d'un client | Elle etait definitive, alors que les listes filtrent sur `deletedAt` : elle est desormais logique, comme pour les employes, la structure, les voyages, les navires et l'entrepot |
| 24 | Journal d'audit | Un index sur `createdAt` a ete ajoute, et la reponse n'y est plus recopiee en entier : seules les identites de l'enregistrement concerne sont conservees |
| 25 | Limiteur de connexion | Il comptait les tentatives reussies : seules les tentatives infructueuses sont desormais comptees |
| 26 | Matricule des employes | Le numero est calcule sur le plus grand deja utilise pour le poste, et non sur un simple comptage, ce qui evite une collision apres une suppression |
| 27 | Identite de l'application | Le bandeau, le titre de l'onglet, le manifeste et l'ecran de connexion ne portaient plus que des residus de gabarit : ils indiquent desormais l'entreprise et l'application |
| 28 | Page de demonstration `/template` | Bac a sable de developpement accessible sans permission : route, composant et import supprimes |
| 29 | Ecran entrepot | Vue en cartes pour le mobile, filtres entrepot, client et statut, selection du plan par le composant du kit, et mise en stock en un clic des marchandises dechargees d'un plan valide |
| 30 | Plan de dechargement de demonstration | Le jeu de demonstration contient un plan de dechargement valide : le circuit « le navire est arrive, les marchandises attendent en entrepot » est demontrable |
| 22 | Boutons de modification des modules toujours visibles | `ModuleTable.jsx` calculait `canManage` avec `département === "TECH" || "ADMIN"`, expression toujours vraie : les boutons étaient affichés pour tout le monde. L'interface applique maintenant `checkPermission("MODULE", ...)`, comme le serveur |
| 23 | Événement `load:changed` sans écouteur | Le serveur diffuse la modification des lignes de marchandises, mais aucun écran ne l'écoutait : l'écran des plans ne se rafraîchissait pas. L'écoute a été ajouté |### 14.2. Points assumés

| # | Sujet | Explication |
| --- | --- | --- |
| 1 | Table `client_documents` | La table existe dans le schéma mais n'est exploitée par aucune fonctionnalité : elle est conservée comme extension prévue |
| 2 | Marchandises à peser dans le jeu de démonstration | Le script de démonstration crée deux lignes au poids nul, au statut `PENDING` et porteuses d'une anomalie : elles représentent des marchandises dont le poids reste à confirmer. L'interface de programmation refuse en revanche toute création d'un poids nul |
| 3 | Filtrage des notifications côté client | La diffusion part de tous les clients connectés et le filtrage par permission est réalisé dans le navigateur, choix assumé pour une application de cette taille |
| 4 | Absence de tests d'interface | Les tests couvrent les validations, la sécurité et les middlewares du serveur ; l'interface ne dispose pas encore de tests automatisés |

## 15. Feuille de route

Reste à faire (d'après l'ancienne feuille de route, corrigée de ce qui est déjà livré) :

- [ ] Corriger les écarts de la section 14, en priorité 1, 2, 3, 4, 10 et 12.
- [ ] Tests HTTP des permissions par route et des transitions de plans (validation, déchargement).
- [ ] Remplacer ou supprimer la maquette `TemplatePage`.
- [ ] Totaux par date, client et voyage dans l'interface des plans.
- [ ] Prévisualisation et impression du manifeste (le PDF client existe déjà), historique des exports.
- [ ] Versions/historique des changements d'un plan, audit détaillé des validations.
- [ ] Optimisation du chargement : dimensions et volumes, zones du navire, marchandises dangereuses (`Load.isHazardous` existe déjà), ordre des escales, équilibrage.
- [ ] Décider du contrat métier pour un poids inconnu (`null` ou état dédié).
- [ ] Dockeriser et documenter le déploiement (en vérifiant d'abord le point 1 de la section 14).

## 16. Documents liés

- [`server/README.md`](server/README.md) : détail du backend.
- [`client/README.md`](client/README.md) : détail du frontend.
- [`README_AUDIT_2026-10-03.md`](README_AUDIT_2026-10-03.md) : audit de sécurité et de cohérence (3 octobre 2026), à actualiser au regard de la section 14.
- [`../prisma-uml.png`](../prisma-uml.png) : diagramme UML du schéma (racine du dépôt).
- Collection Postman : `server/postman/` et `server/.postman/`.

*Règle de maintenance : mettre à jour la date de référence et les cases cochées à chaque étape importante ; ne cocher qu'après vérification dans le code.*

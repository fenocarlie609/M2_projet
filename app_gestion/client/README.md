# Frontend : back-office React + Vite (`client/`)

Application d'administration de l'ERP maritime (PWA « Maritime Admin »). Contexte global, modèle de données, permissions et API : voir le [README principal](../README.md). Ce document décrit uniquement le frontend, tel que présent dans le code au **13 octobre 2026**.

## Stack

React 18, Vite 6, **Tailwind CSS 4** (plugin `@tailwindcss/vite`), React Router 6, Axios, `socket.io-client`, `react-toastify`, `react-icons` (icônes, utilisées partout), `lucide-react` (1 fichier), `jspdf` + `jspdf-autotable` (manifeste PDF), `vite-plugin-pwa`.

Installées mais **non utilisées** (à retirer ou à exploiter) : `antd`, `@ant-design/icons`, `zustand`. L'état global passe par des contextes React (`AuthContext`, `NotificationContext`). Les composants UI sont **maison**, dans `src/shared/components/ui/`.

## Démarrage

```powershell
npm install
npm run dev        # http://localhost:5173
npm run build      # build de production
npm run preview    # prévisualiser le build
```

- Le proxy Vite redirige `/api` vers `http://localhost:5000` : lancer d'abord le backend ([`../server`](../server/README.md)).
- Variable optionnelle `VITE_API_URL` (défaut `/api/v1`) ; l'URL du socket est déduite en retirant `/api/v1`.
- Alias d'import : `@/` → `src/` (`vite.config.js`).
- Couleurs de marque dans `tailwind.config.js` : `navy-sider`, `navy-trigger`, `navy-sub`, `brand-primary` (`#10b981`).
- PWA : manifeste « Maritime Admin » (thème `#0f172a`), service worker en mise à jour automatique (`registerSW({ immediate: true })`), icônes `public/pwa-*.png`, `public/_redirects` (`/* /index.html 200`) pour le routage SPA sur l'hébergeur.
- **Aucun script de test ni de lint** n'est configuré dans `package.json`.

## Structure

```text
src/
├── main.jsx                  # BrowserRouter > AuthProvider > NotificationProvider > App ; registerSW
├── index.css
├── core/
│   ├── App.jsx               # Routes publiques/protégées, ToastContainer
│   └── routes/routeConfig.jsx# Source unique des routes, du menu et des permissions requises
├── features/                 # Un dossier par fonctionnalité
│   ├── auth/                 # AuthContext, LoginPage, login.service
│   ├── dashboard/            # DashboardLayout (Header, Sidebar), DashboardPage
│   ├── employee/  users/  module/  companyStructure/   # Administration
│   ├── client/               # Fiche client (référence de la convention CRUD)
│   ├── ship/  ports/  voyages/                         # Référentiel maritime
│   ├── plans/                # Plans de chargement/déchargement, lignes, manifeste PDF
│   ├── notifications/        # NotificationContext, NotificationBell
│   ├── template/             # TemplatePage : laboratoire visuel, sans données réelles
│   ├── driver/               # VESTIGE : route commentée, API /drivers non montée
│   └── maritime/             # ORPHELIN : MaritimePage non routée
└── shared/
    ├── components/ui/        # Button, Input, Select, Form, Table, Card, Modal, AlertDialog,
    │                         # ContextMenu, DropdownMenu, Tabs, Badge, Calendar, Stepper,
    │                         # StatsCard, PageHeader
    ├── components/layout/    # RoleGuard
    ├── services/             # axiosInstance, api, crudService, socket
    └── utils/                # permissions, toast, formatDate, apiErrors, getApiErrorMessage, Load
```

### Convention d'une feature

```text
features/<feature>/
├── components/    # Card, Table, Form, Modal (partagés entre création et modification)
├── pages/         # Page principale
├── service/       # Appels API (createCrudService + méthodes spécifiques)
└── index.js       # Barrel : n'exporter que ce qui sert ailleurs
```

La feature `client` est le modèle. `users` fait exception (opérations spécialisées : accès, permissions, mot de passe).
Les pages qui doivent rester synchronisées s'abonnent à un événement Socket.IO dans un `useEffect` et se rechargent (voir la liste des événements dans le [README principal, section 10](../README.md#10-temps-réel-socketio)).

## Routes et permissions

Tout est déclaré dans `src/core/routes/routeConfig.jsx` : chaque entrée porte `path`, `label`, `section` du menu, `element` (enveloppé dans `DashboardLayout`), `requiredPermission` (`{ module, action }` ou `null`), `icon` et `showInSidebar`. `App.jsx` enveloppe chaque route dans `RoleGuard`, et `Sidebar` s'appuie sur `sidebarRoutes`.

Pour **ajouter une page** : créer la feature, puis ajouter une entrée dans `appRoutes`. Le garde-fou frontend est une commodité d'affichage : **la vraie sécurité est côté serveur** (`authorize(...)`).

Table complète des routes et des permissions : [README principal, section 11](../README.md#11-frontend--pages-et-routes). Rappel des routes de plans : `/plans`, `/plans/load/:reference`, `/plans/unload/:reference`.

`hasPermission(user, { module, action })` (`shared/utils/permissions.js`) : accepte la paire exacte, l'action `*` sur le module, et `{ "*", "*" }` pour tous les droits. Les permissions sont normalisées (`normalizePermissions` accepte aussi une chaîne seule = module avec action `*`).

## Authentification côté client

- `AuthContext` conserve l'utilisateur dans `localStorage` (clé `mada_user`) comme cache de session, puis le revalide via `GET /auth/me` au chargement. **Les jetons ne sont pas stockés côté JavaScript** : ils vivent dans des cookies (`token` et `refreshToken` httpOnly).
- `axiosInstance` (`withCredentials: true`) :
  - ajoute `X-CSRF-Token` (valeur du cookie `xsrf-token`) sur `POST/PUT/PATCH/DELETE`, et appelle `GET /auth/csrf-token` si le cookie manque ;
  - sur une réponse **401**, tente **une fois** `POST /auth/refresh` puis rejoue la requête (sauf sur `/auth/login`, `/auth/refresh`, `/auth/me`).
- Le socket (`shared/services/socket.js`, `autoConnect: false`) est connecté par `AuthContext` après authentification, avec les cookies ; le serveur le refuse sans session valide.
- `AuthContext` écoute `profile-updated` (mise à jour des permissions en direct) et `account-disabled` (déconnexion).

## Services API

Utiliser `createCrudService(basePath, customMethods)` (`shared/services/crudService.js`) pour `getAll`, `getById`, `create`, `update`, `remove`, puis ajouter les méthodes spécifiques. Les réponses du serveur ont la forme `{ status: "success", data: ... }` ; chaque service extrait ce dont la page a besoin (par exemple `response.data.loadingPlans`). Messages d'erreur et erreurs de champs : `shared/utils/getApiErrorMessage.js` et `apiErrors.js`, notifications via `shared/utils/toast.jsx` (`react-toastify`).

## Plans de chargement et manifeste PDF

Feature `plans/` : `PlansPage` (liste, création), `LoadPage` (saisie des lignes d'un plan de chargement ou de déchargement selon `operationType`), `PlanLoadsSection`, `LoadEditorModal`, `PlanOverview`, `LoadPlanForm/Modal/Table`. Service : `loadingPlan.service.js` (CRUD des plans, `getPlanByReference`, `addLoad`, `updateLoad`, `deleteLoad`, `validatePlan`).

`LoadingManifestPdf.jsx` génère le **manifeste PDF dans le navigateur** (import dynamique de `jspdf` et `jspdf-autotable`, A4 portrait, dates en `fr-FR`, poids formatés avec jusqu'à 3 décimales). Il n'existe pas d'endpoint d'export côté serveur. Les règles métier (capacité du navire, validation, plan de déchargement automatique) sont appliquées par l'API : voir [README principal, section 9](../README.md#9-règles-métier-des-plans-de-chargement).

## Écarts connus du frontend

- Permission **`CLIENT`** (route et API) mais les boutons Modifier/Supprimer de `ClientTable.jsx` et `ClientCard.jsx` vérifient **`CLIENTS`** : les utilisateurs avec `CLIENT:UPDATE/DELETE` ne voient pas ces boutons.
- Les boutons « Ajouter » (Client, Employé, Port, Navire, Voyage) ne vérifient pas `CREATE`.
- Temps réel : `ShipPage`, `PortPage` et `VoyagePage` écoutent `ships:changed`, `ports:changed`, `voyages:changed`, que le backend n'émet pas (il émet `voyage:changed` ; rien pour navires et ports) ; aucune page n'écoute `load:changed`.
- `features/driver` et `features/maritime` sont inutilisées (route commentée / aucune route).
- `TemplatePage` est une maquette sans persistance.
- Dépendances inutilisées : `antd`, `@ant-design/icons`, `zustand`.
- Le commentaire d'en-tête de `RoleGuard.jsx` indique un ancien chemin (`src/core/routes/`) ; le fichier est dans `src/shared/components/layout/`.
- Aucun test, aucun linter configuré.

Liste complète et priorisée : [README principal, section 14](../README.md#14-écarts-connus-et-dette-technique).

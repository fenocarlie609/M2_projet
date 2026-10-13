# Backend : API Express + Prisma (`server/`)

API REST de l'ERP maritime. Contexte global, modèle de données, permissions et feuille de route : voir le [README principal](../README.md). Ce document décrit uniquement le backend, tel que présent dans le code au **13 octobre 2026**.

## Stack

Node.js 18+ (**CommonJS**), Express 5, Prisma 7 (`@prisma/adapter-pg` + `pg`), PostgreSQL, Zod 4, `jsonwebtoken`, `bcrypt`, Helmet, CORS, `express-rate-limit`, `cookie-parser`, Multer 2 (stockage en mémoire), Socket.IO 4, Winston.

## Structure

```text
server/
├── server.js                      # Point d'entrée : dotenv, validateEnv, connectDB, listen, initSocket
├── prisma.config.js               # Prisma 7 : schéma, dossier des migrations, DATABASE_URL
├── prisma/
│   ├── schema.prisma              # Modèles (client généré dans src/generated/prisma)
│   ├── migrations/                # 17 migrations (ne jamais reset une base peuplée)
│   ├── seed.js                    # Départements et postes
│   ├── seedAppModules.js          # Modules de permissions (gabarit incomplet)
│   └── seedLoadingPlan.js         # Plan de chargement de référence (destructif sur ces plans)
├── public/uploads/avatars/        # Avatars (créé au démarrage), servis sous /uploads
├── logs/                          # Winston : errors.log, combined.log
├── test/{unit,integration}/       # node --test
├── postman/ et .postman/          # Collection Postman
└── src/
    ├── app.js                     # Helmet, CORS, static, rate limit, parsers, audit, routes, erreurs
    ├── config/
    │   ├── database.js            # Pool pg + PrismaPg + extension de mesure de durée (dev)
    │   ├── env.js                 # validateEnv() : variables obligatoires
    │   ├── logger.js              # Winston (fichiers + console hors production)
    │   ├── security.js            # appLimiter (100 req / 15 min en prod, 500 en dev)
    │   └── socket.js              # Socket.IO authentifié, getIO()
    ├── common/
    │   ├── middlewares/           # auth, csrf, validate, audit, upload, owner, rateLimiter,
    │   │                          # error, Restricttodepartment (voir piège ci-dessous)
    │   └── utils/                 # AppError, catchAsync, response, constants, socketAuth,
    │                              # password.utils, validation.schemas
    └── modules/
        ├── _routes.js             # Agrégation des routes + CSRF sur les mutations
        ├── auth/  users/  employees/  company-structure/  modules/  uploads/
        ├── clients/  notifications/  maritime/  voyage/  loading-plans/
        └── driver/                # VESTIGE : non monté, tables supprimées
```

Chaque module suit : `*.routes.js` → `*.controller.js` → `*.service.js`, avec `*.validation.js` (Zod) et un `index.js` barrel. Référence à imiter : `modules/clients/`.

## Démarrage

```powershell
npm install
npx prisma generate          # obligatoire : src/generated/prisma est ignoré par git
npx prisma migrate dev
npm run dev                  # nodemon + .env.development, port 5000 par défaut
```

`server.js` charge `.env.development` si `NODE_ENV=development`, sinon `.env`, sauf en production où les variables sont attendues dans l'environnement (le script `npm start` utilise `.env.production` via `dotenv-cli`).

**Variables obligatoires** (le serveur refuse de démarrer sans elles) : `DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `COOKIE_SECRET`.
**Optionnelles** : `NODE_ENV`, `PORT` (5000), `CLIENT_URL` (`http://localhost:5173`), `JWT_EXPIRES_IN` (15m), `JWT_REFRESH_EXPIRES_IN` (7d), `LOG_LEVEL` (info).

Exemple (ne jamais versionner de vrais secrets) :

```env
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DBNAME
COOKIE_SECRET=changer-moi
JWT_SECRET=changer-moi
JWT_REFRESH_SECRET=changer-moi
```

## Scripts

| Script | Rôle |
| --- | --- |
| `npm run dev` | développement avec rechargement (nodemon) |
| `npm start` | production (`.env.production`) |
| `npm test` | tests unitaires |
| `npm run test:integration` | test d'intégration des données de démonstration (base seedée requise) |
| `npm run seed:loading` | seed du plan de référence (supprime puis recrée les marchandises de ces plans) |

`npm test` exécute `logistics-validation`, `client-validation`, `audit-redaction`, `socket-auth` et `voyage-read-auth`. **`test/unit/upload-signature.test.js` existe mais n'est pas dans le script** : à ajouter.

## Chaîne de traitement d'une requête

1. `helmet` → CORS (`CLIENT_URL`, credentials) → `/uploads` statique → rate limit `/api` → `express.json` (**10 ko max**) → `cookie-parser` (cookies signés avec `COOKIE_SECRET`) → log de requête → `auditTrail()`.
2. `/api/v1` (`modules/_routes.js`) : vérification **CSRF** sur `POST/PUT/PATCH/DELETE` (exempt : `/auth/login`, `/auth/csrf-token`), puis le routeur du module.
3. Dans un module : `protect` (cookie signé `token` ou `Bearer`, recharge l'employé avec permissions, département et poste ; refuse un compte supprimé, inactif ou sans `hasAppAccess`) → `authorize(MODULE, ACTION)` → `validate({ body|query|params })` (Zod) → contrôleur → service → Prisma.
4. Erreurs : `AppError` (opérationnelle) → `errorHandler` : détail et stack en développement, message générique en production (conversion des erreurs Prisma courantes comme `P2002`).

Format de réponse : `{ "status": "success", ...payload }` ; en cas d'erreur `{ "status": "fail" | "error", "message": "...", "errors": [{ field, message }] }` pour les erreurs de validation.

## Authentification et permissions (résumé)

- Login par **email ou matricule** ; access token 15 min dans le cookie signé `token`, refresh token (hash SHA-256 en base, rotation, révocation par famille) dans `refreshToken`, token CSRF dans `xsrf-token`.
- `authorize(module, action)` accepte la permission exacte ou les jokers `*` ; `{ "*", "*" }` = tous droits.
- `isSelfOrAuthorized` : un employé agit sur sa fiche, sans pouvoir modifier ses propres permissions, `hasAppAccess` ou `isActive`.
- `restrictToDepartment("TECH")` protège `/users` et les mutations de `/modules`.
- Détails et tableau module → routes : [README principal, sections 6 à 8](../README.md#6-authentification-et-sécurité).

## Temps réel

`config/socket.js` : handshake authentifié par le cookie signé `token` (`common/utils/socketAuth.js`), puis l'employé est joint à la room `employee_<id>`. Les contrôleurs/services émettent via `getIO()`. Liste des événements et incohérences avec le frontend : [README principal, section 10](../README.md#10-temps-réel-socketio).

## Points d'attention pour modifier le code

- **Casse du fichier** `common/middlewares/Restricttodepartment.middleware.js` : importé comme `restrictToDepartment.middleware` dans `users/user.routes.js` et `modules/module.routes.js` ; fonctionne sous Windows, plante sous Linux. Renommer le fichier (et passer par `git mv` pour que git enregistre la casse) ou corriger les imports.
- **Prisma** : accesseurs en minuscule (`prisma.employee`) ; importer `prisma` depuis `config/database.js` (une seule instance, avec l'extension de mesure) ; ne pas réécrire d'`AuditLog` dans les services (l'audit est global, sinon doublons).
- **Audit** : tout `POST/PUT/PATCH/DELETE` est journalisé ; les clés sensibles sont masquées par `redactSensitiveValues`. Pour une route de plus qui reçoit un secret, vérifier que le nom de la clé correspond au motif `password|token|secret|authorization|cookie|csrf`.
- **Validation** : schémas Zod dans `*.validation.js`, exportés sous la forme `{ create: { body }, update: { body } }`. Les mises à jour partielles utilisent `.partial()` : attention aux règles croisées (par exemple les dates de voyage, voir README principal section 14).
- **Upload** : `upload.middleware.js` garde le fichier en mémoire ; l'écriture sur disque et les contrôles d'identité sont dans `uploads/upload.controller.js`.
- **Voyages** : ne pas confondre `voyage/` (`/voyages`, permission `VOYAGES`) et `maritime/` (`/maritime/voyages`, permission `LOADING_PLANS`).
- **Vestiges** : `modules/driver/` référence `prisma.driver` qui n'existe plus ; `maritime/` déclare une ressource `vehicle` sans modèle Prisma correspondant. Ne pas monter ces routes sans recréer les modèles.
- **Dépendances implicites** : `socketAuth.js` importe `cookie` et `cookie-signature` qui ne sont pas déclarés dans `package.json` (présents via Express/cookie-parser) ; les déclarer explicitement.
- **Poids** : `Decimal` Prisma, en kg ; utiliser les opérations `Decimal` (`mul`, `add`, `gt`) plutôt que les nombres JavaScript.

## Tests

Voir [README principal, section 13](../README.md#13-tests). Exécuter depuis `server/` : `npm test`. Le test d'intégration (`npm run test:integration`) suppose une base accessible contenant les données de `seedLoadingPlan.js` ; il échoue sinon (cas constaté lors de l'audit du 3 octobre sur une base non seedée).

## Documentation d'API

Pas de Swagger/OpenAPI. Une collection Postman est versionnée dans `postman/` ; la liste des endpoints est dans le [README principal, section 8](../README.md#8-api-rest). Pour appeler l'API en dehors du navigateur : récupérer `GET /api/v1/auth/csrf-token`, se connecter avec `POST /api/v1/auth/login`, puis envoyer le cookie `xsrf-token` en header `X-CSRF-Token` sur les mutations (ou utiliser `Authorization: Bearer <accessToken>` pour les lectures).

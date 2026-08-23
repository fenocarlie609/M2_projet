# 🌊 App Gestion — Maritime Management System

Ce dépôt contient l'application `app_gestion`, un système de gestion maritime modulaire (frontend React + backend Node/Express + Prisma + PostgreSQL). Ce README remplace et centralise la documentation projet : démarrage, architecture, sécurité, auth, PWA, et résolution des problèmes courants.

Table des matières

- Aperçu
- Structure du dépôt
- Prérequis
- Installation & démarrage (dev)
- Variables d'environnement
- Authentification (Access & Refresh tokens, rotation, blacklist)
- Sécurité (cookies, CSRF, rate-limiting, helmet)
- PWA
- Base de données & Prisma
- Erreurs & Debug (exemples courants et solutions)
- Déploiement
- Tests
- Contribuer
- Licence

---

## Aperçu

`app_gestion` est une application SPA (React + Vite) pour l'administration maritime avec backend REST (Express) et persistance via PostgreSQL + Prisma.

## Structure du dépôt

```
app_gestion/
├── client/                    # Frontend React + Vite
│   ├── src/                   # Code source React (features/, shared/, core/)
│   ├── public/                # Assets & manifest PWA
│   └── package.json
├── server/                    # Backend Node.js + Express
│   ├── src/
│   │   ├── config/            # DB, env, logger, socket
│   │   ├── common/            # middlewares, utils, error handling
│   │   ├── modules/           # fonctionnalités (auth, users, company-structure, ...)
│   │   └── app.js
│   ├── prisma/                # schema.prisma, migrations
│   └── package.json
├── vitrine/                   # Site marketing (optionnel)
└── README.md                  # Ce fichier
```

## Prérequis

- Node.js >= 18
- npm
- PostgreSQL
- (Optionnel) yarn

## Installation & démarrage (dev)

1. Cloner le repo

```bash
git clone <repo-url>
cd app_gestion
```

2. Installer les dépendances

```bash
# Frontend
cd client
npm install

# Backend
cd ../server
npm install
```

3. Configurer les variables d'environnement (voir section suivante)

4. Initialiser la base et les migrations

```bash
cd server
npx prisma migrate dev --name init
# Optionnel : importer des seed / données de démo
```

5. Lancer les serveurs en développement

```bash
# Terminal 1: backend
cd server
npm run dev

# Terminal 2: frontend
cd client
npm run dev
```

Le frontend (Vite) écoute typiquement sur http://localhost:5173 et proxie /api vers le backend sur http://localhost:5000 (config Vite).

## Variables d'environnement importantes

Crée `.env.development` et `.env.production` selon l'environnement. Variables essentielles :

- NODE_ENV=development|production
- PORT=5000
- CLIENT_URL=http://localhost:5173
- DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DBNAME
- COOKIE_SECRET=une_chaine_secrete_pour_signer_les_cookies
- JWT_SECRET=secret-pour-access-tokens
- JWT_REFRESH_SECRET=secret-pour-refresh-tokens
- JWT_EXPIRES_IN=15m # ex: 15m
- JWT_REFRESH_EXPIRES_IN=7d # ex: 7d

Important : pour la production, utilisez des secrets forts et stockez-les via un gestionnaire de secrets (Vault, Azure Key Vault, AWS Secrets Manager, etc.).

## Authentification : design et fonctionnement

L'application utilise un schéma JWT + refresh-token robuste :

- Access token : court (ex: 15m), signé avec JWT_SECRET, contenu minimal (id, email, type:"access").
- Refresh token : plus long (ex: 7d), signé avec JWT_REFRESH_SECRET. Chaque refresh token stocké en base sous forme hashée (sha256) dans la table `RefreshToken` avec : familyId, jti, expiresAt, revokedAt, replacedByTokenId.
- Rotation : lors d'un refresh valide, l'ancien refresh token est révoqué et remplacé par un nouveau (rotated). La base conserve l'historique pour blacklisting / forensic.
- Stockage & transport :
  - Cookies HttpOnly, Secure (en prod) et Signed (cookie-parser) pour token & refreshToken.
  - Cookie `xsrf-token` non HttpOnly pour que le frontend puisse lire et envoyer le header X-CSRF-Token.
- Middleware protect : accepte le token depuis `signedCookies.token` ou depuis `Authorization: Bearer <token>` (utile pour Postman).
- Logout : révoque tous les refresh tokens de l'utilisateur (revokedAt) et clearCookie.

## Sécurité & hardening

- Cookies : httpOnly: true, signed: true, secure: true (en production), sameSite: 'lax' (ajuster si besoin de cross-site strict)
- CSRF : middleware qui compare `xsrf-token` cookie et header `X-CSRF-Token` pour les méthodes mutantes (POST/PUT/PATCH/DELETE).
- Rate limiting : express-rate-limit appliqué sur les routes sensibles (login) et un limiteur global sur toutes les routes API.
- Sanitation : express-mongo-sanitize (présent), input size limit (express.json({ limit: '10kb' })).
- Helmet : en-têtes de sécurité HTTP.
- Logging : Winston pour auditer requêtes et erreurs.

## Gestion des erreurs et UX

- Le backend normalise les erreurs Prisma (ex: P2002 / contrainte unique) en un format lisible et structuré :
  ```json
  {
    "status": "fail",
    "message": "Ce code est déjà utilisé.",
    "fields": { "code": "Ce code est déjà utilisé." }
  }
  ```
- Le frontend utilise `getApiErrorMessage()` et `applyApiErrors()` pour extraire `fields` et affecter les messages aux inputs concernés (affichage inline) ou afficher un toast.
- Les modales d'alerte ont été mises en priorité (z-index) pour être au-dessus de l'UI.

## PWA

- Plugin : vite-plugin-pwa
- Manifest : `client/public/manifest.webmanifest` inclus
- Le service worker est enregistré via `virtual:pwa-register` (main.jsx).
- Assets : icons 192/512 fournis dans `client/public`.

## Base de données & Prisma

- `prisma/schema.prisma` contient les modèles et relations.
- RefreshToken : structure pensée pour rotation + blacklist : `tokenHash`, `jti`, `familyId`, `expiresAt`, `revokedAt`, `replacedByTokenId`.
- Soft deletes : de nombreux modèles possèdent `deletedAt` pour soft-delete et index sur ce champ.

Commandes utiles Prisma

```bash
# Générer le client Prisma
npx prisma generate

# Créer migration et appliquer (dev)
npx prisma migrate dev --name <name>

# Vérifier statut
npx prisma migrate status

# Ouvrir Studio
npx prisma studio
```

## Erreurs courantes & résolutions

- Vite EPERM rename node*modules\.vite\deps_temp*\* → deps :
  - Cause : un fichier/dossier est verrouillé par un autre processus (antivirus, explorateur, autre instance de vite). Solution : arrêter les processus, supprimer `node_modules/.vite`, relancer `npm run dev`. Si verrouillage persiste, redémarrer la machine ou exclure le dossier du scanner antivirus.
- Erreur Prisma P2002 (contrainte unique) :
  - Le serveur renvoie maintenant un `fields` object. Le frontend doit afficher l'erreur inline. Si tu vois un message incomplet dans la modal, vérifier la transformation d'erreur côté serveur et l'utilisation de `applyApiErrors()` côté client.
- Erreur P2025 (record not found) :
  - Retourne 404 et message lisible.

## Déploiement (guide rapide)

- Construire le frontend : `cd client && npm run build`.
- Paramétrer l'environnement de production (variables sensibles dans un secret manager).
- Lancer le backend avec `NODE_ENV=production` : `npx dotenv -e .env.production -- node server.js` ou via PM2 / systemd / container.
- Configurer un reverse-proxy (NGINX) pour servir `client/dist` et proxy `/api` au backend ou héberger frontend statique séparément.

## Tests

- La base du projet contient des utilitaires pour tests manuels. Ajouter des tests unitaires et d'intégration est recommandé (Jest / Supertest) pour la logique d'auth et la rotation des refresh tokens.

## Contribuer

- Fork → branche feature → PR → revue.
- Respecter la structure `modules/` (controller/service/routes) et les conventions de codage.

## Contacts & support

- Auteur / mainteneur : (ajoute ton nom et contact ici)
- Pour des incidents en production : consulter les logs (Winston) et les enregistrements d'audit.

## Licence

- Indiquer la licence du projet (ex: MIT) — ajoute un fichier LICENSE si nécessaire.

---

## Notes finales

Ce README couvre l'essentiel pour mettre en route, sécuriser et maintenir l'application. Si tu veux que j'ajoute des sections supplémentaires (ex: diagrammes d'architecture, runbooks de déploiement, playbook d'incidents, exemples de payloads API), dis-moi lesquelles et j'ajoute ça.

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

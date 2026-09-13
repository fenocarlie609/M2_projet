# ERP maritime et gestion de fret

## Projet

**Conception et mise en place d'une architecture modulaire evolutive pour un ERP de suivi logistique et de gestion de fret maritime.**

Ce depot contient une application web composee de :

- `client/` : application d'administration React + Vite ;
- `server/` : API REST Node.js + Express + Prisma ;
- `vitrine/` : site vitrine separe du back-office.

L'objectif fonctionnel est de faire evoluer l'application vers la gestion complete d'un voyage maritime, de ses clients et chauffeurs, de ses marchandises et de la generation d'un plan de chargement.

> **Etat de reference : 13 septembre 2026**
>
> Les cases cochees correspondent a des elements identifies dans le code. Les cases non cochees sont des travaux a realiser et ne doivent pas etre consideres comme disponibles.

## Sommaire

- [Etat global](#etat-global)
- [Fonctionnalites realisees](#fonctionnalites-realisees)
- [Limites actuelles](#limites-actuelles)
- [Architecture](#architecture)
- [Installation](#installation)
- [Configuration](#configuration)
- [Commandes utiles](#commandes-utiles)
- [Plan de chargement cible](#plan-de-chargement-cible)
- [Feuille de route](#feuille-de-route)
- [Checkpoints](#checkpoints)
- [Tests et qualite](#tests-et-qualite)

## Etat global

| Domaine                  | Etat         | Commentaire                                               |
| ------------------------ | ------------ | --------------------------------------------------------- |
| Architecture modulaire   | Termine      | Organisation frontend par features et backend par modules |
| Authentification         | Termine      | JWT, cookies, refresh tokens et rotation                  |
| Securite API             | Partiel      | Protection principale en place, sanitation a finaliser    |
| Administration           | Partiel      | Employes, utilisateurs, permissions et structure interne  |
| Clients et chauffeurs    | Partiel      | CRUD presents, mais pas encore relies a une cargaison     |
| Suivi maritime           | Non commence | Navires, ports et voyages absents du modele metier        |
| Gestion des marchandises | Non commence | Aucun modele persiste de cargaison ou de ligne de fret    |
| Plan de chargement       | Non commence | La page Template est une maquette UI non connectee        |
| Export PDF / impression  | Non commence | A concevoir apres stabilisation du manifeste              |
| Tests automatises        | Non commence | Aucun script de test applicatif configure                 |

## Fonctionnalites realisees

### Architecture et socle technique

- [x] Frontend React avec Vite.
- [x] Backend Node.js avec Express.
- [x] Base PostgreSQL avec Prisma.
- [x] Organisation frontend par fonctionnalites dans `client/src/features/`.
- [x] Organisation backend par modules dans `server/src/modules/`.
- [x] Routes API centralisees sous `/api/v1`.
- [x] Gestion centralisee des erreurs.
- [x] Configuration par variables d'environnement.
- [x] Journalisation Winston.

### Authentification et autorisations

- [x] Connexion et deconnexion.
- [x] Access token JWT.
- [x] Refresh token stocke sous forme de hash.
- [x] Rotation et revocation des refresh tokens.
- [x] Support du cookie securise et du header Bearer pour les appels API.
- [x] Permissions par module et action : `CREATE`, `READ`, `UPDATE`, `DELETE`, `*`.
- [x] Protection frontend avec `RoleGuard`.
- [x] Gestion des demandes d'acces et des comptes utilisateurs.

### Administration et donnees existantes

- [x] Gestion des employes.
- [x] Gestion des departements.
- [x] Gestion des postes.
- [x] Gestion des clients.
- [x] Gestion des chauffeurs.
- [x] Gestion des modules applicatifs.
- [x] Gestion des notifications.
- [x] Upload des avatars.
- [x] Soft delete pour plusieurs entites internes.
- [x] Journal d'audit des requetes mutantes.

### Interface utilisateur

- [x] Layout de dashboard avec header et sidebar.
- [x] Routes frontend protegees par permissions.
- [x] Composants reutilisables : boutons, formulaires, inputs, selects, tableaux, cartes, modales, alertes, calendrier et stepper.
- [x] Gestion des erreurs API et affichage des erreurs de champs.
- [x] Notifications temps reel preparees avec Socket.IO.
- [x] Manifest PWA et integration du service worker cote client.

## Limites actuelles

La page `client/src/features/template/pages/TemplatePage.jsx` est actuellement un laboratoire visuel. Elle contient des exemples de formulaire, de calendrier et de manifeste, mais :

- [ ] le formulaire n'enregistre pas de donnees dans PostgreSQL ;
- [ ] aucun appel API de cargaison n'est effectue ;
- [ ] aucun modele `Vessel`, `Voyage`, `LoadingPlan` ou `CargoLine` n'existe ;
- [ ] aucun calcul de poids total n'est implemente ;
- [ ] aucun export PDF ou impression du plan n'est disponible ;
- [ ] aucune validation metier ne bloque la surcharge d'un navire ;
- [ ] aucun workflow brouillon, soumis, valide ou cloture n'est implemente.

Le terme `CHARGEMENT` apparait dans des commentaires de permissions et d'audit, mais cela ne constitue pas encore un module fonctionnel.

Le module `boats` presente dans certains exemples de documentation est egalement un exemple d'architecture : il n'est pas present dans `server/src/modules/`.

## Architecture

```text
app_gestion/
├── client/                 # Back-office React + Vite
│   └── src/
│       ├── core/           # Application et configuration des routes
│       ├── features/       # Modules fonctionnels frontend
│       └── shared/         # UI, services, hooks et utilitaires communs
├── server/                 # API Node.js + Express
│   ├── prisma/             # Schema et migrations PostgreSQL
│   └── src/
│       ├── common/         # Middlewares et utilitaires communs
│       ├── config/         # Base de donnees, securite, logs, socket
│       └── modules/        # Auth, utilisateurs, clients, chauffeurs, etc.
└── vitrine/                # Site vitrine independant
```

### Modules backend actuellement enregistres

- `auth`
- `users`
- `employees`
- `company-structure`
- `modules`
- `uploads`
- `clients`
- `drivers`
- `notifications`

### Modeles Prisma actuellement disponibles

- `Department`
- `Position`
- `Employee`
- `AppModule`
- `EmployeePermission`
- `AuditLog`
- `Client`
- `Driver`
- `Notification`
- `NotificationRead`
- `RefreshToken`

## Installation

### Prerequis

- Node.js 18 ou plus recent ;
- npm ;
- PostgreSQL ;
- une base de donnees accessible par `DATABASE_URL`.

### Installation des dependances

```bash
cd client
npm install

cd ../server
npm install
```

### Initialisation de la base

```bash
cd server
npx prisma generate
npx prisma migrate dev
```

Les migrations existantes doivent etre conservees. Ne pas utiliser `prisma migrate reset` sur une base contenant des donnees importantes.

### Demarrage en developpement

Terminal 1 :

```bash
cd server
npm run dev
```

Terminal 2 :

```bash
cd client
npm run dev
```

Le frontend est normalement disponible sur `http://localhost:5173` et l'API sur le port configure dans le serveur, generalement `5000`.

## Configuration

Le serveur utilise notamment les variables suivantes dans `.env.development` ou `.env.production` :

```env
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DBNAME
COOKIE_SECRET=remplacer-par-un-secret-fort
JWT_SECRET=remplacer-par-un-secret-fort
JWT_REFRESH_SECRET=remplacer-par-un-secret-fort
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

Ne jamais versionner de vrais secrets. Utiliser `.env.example` comme modele et un gestionnaire de secrets en production.

## Commandes utiles

### Client

```bash
cd client
npm run dev
npm run build
npm run preview
```

### Serveur

```bash
cd server
npm run dev
npm start
```

### Prisma

```bash
cd server
npx prisma generate
npx prisma migrate status
npx prisma migrate dev --name nom_de_la_migration
npx prisma studio
```

## Plan de chargement cible

Le document cible doit permettre de produire un plan similaire au fichier de reference :

- navire et transporteur maritime ;
- date d'arrivee ;
- rang ou numero de voyage ;
- port d'arrivee ;
- client ;
- camion et chauffeur ;
- nombre de colis ;
- description de la marchandise ;
- poids ;
- anomalie ;
- personne chargee ;
- position ou zone de chargement ;
- poids total.

### Modele metier cible

```text
Vessel
└── Voyage
    └── LoadingPlan
        └── CargoLine
            ├── Client
            ├── Driver
            └── Vehicle
```

### Donnees a ajouter

- [ ] `Vessel` : nom, armateur, numero d'immatriculation et capacite.
- [ ] `Port` : code, nom et pays.
- [ ] `Voyage` : navire, ports, dates, numero et statut.
- [ ] `Vehicle` : immatriculation, type et capacite.
- [ ] `LoadingPlan` : reference, voyage, statut, total et validation.
- [ ] `CargoLine` : client, chauffeur, vehicule, colis, description, poids, anomalie et position.
- [ ] Historique des changements et versions du plan.

Les poids doivent etre stockes en kilogrammes, puis affiches en tonnes :

```text
poidsEnTonnes = poidsEnKilogrammes / 1000
```

Pour le document de reference, le total attendu est de `95,444 tonnes`.

### Routes API a implementer

- [ ] `GET/POST /api/v1/vessels`
- [ ] `GET/POST/PUT /api/v1/voyages`
- [ ] `GET/POST /api/v1/loading-plans`
- [ ] `GET/PUT/DELETE /api/v1/loading-plans/:id`
- [ ] `POST /api/v1/loading-plans/:id/lines`
- [ ] `PUT/DELETE /api/v1/loading-plans/:id/lines/:lineId`
- [ ] `POST /api/v1/loading-plans/:id/validate`
- [ ] `GET /api/v1/loading-plans/:id/export`

### Regles metier a implementer

- [ ] poids strictement positif ;
- [ ] colis entier et positif ;
- [ ] total recalcule cote serveur ;
- [ ] total inferieur ou egal a la capacite du navire ;
- [ ] dates du voyage coherentes ;
- [ ] client obligatoire pour chaque ligne ;
- [ ] plan valide non modifiable sans nouvelle version ;
- [ ] permissions distinctes pour consulter, modifier et valider ;
- [ ] audit des creations, modifications, validations et exports.

## Feuille de route

### Phase 1 - Fondations logistiques

- [ ] Ajouter les modeles Prisma `Vessel`, `Port`, `Voyage`, `Vehicle`, `LoadingPlan` et `CargoLine`.
- [ ] Creer et verifier la migration.
- [ ] Ajouter les permissions `VESSELS`, `VOYAGES`, `LOADING_PLANS` et `CARGO`.
- [ ] Ajouter le module backend `loading-plans` selon le pattern controller/service/routes/validation.
- [ ] Ajouter des donnees de demonstration coherentes avec le document de reference.

### Phase 2 - Saisie et suivi

- [ ] Creer l'ecran de gestion des navires.
- [ ] Creer l'ecran de creation d'un voyage.
- [ ] Remplacer la maquette Template par un formulaire connecte a l'API.
- [ ] Ajouter une saisie dynamique de plusieurs lignes de marchandises.
- [ ] Afficher les totaux par date, client et voyage.
- [ ] Ajouter les statuts `DRAFT`, `SUBMITTED`, `VALIDATED`, `CLOSED`.

### Phase 3 - Generation du document

- [ ] Creer la previsualisation du plan de chargement.
- [ ] Reproduire l'en-tete du navire, du voyage et du port.
- [ ] Afficher les lignes groupees par date de chargement.
- [ ] Afficher le poids total en tonnes.
- [ ] Ajouter l'impression.
- [ ] Ajouter l'export PDF.
- [ ] Conserver la version generee et sa date d'export.

### Phase 4 - Optimisation du chargement

- [ ] Ajouter dimensions et volume des marchandises.
- [ ] Ajouter zones et capacites physiques du navire.
- [ ] Gerer les marchandises dangereuses et les incompatibilites.
- [ ] Gerer l'ordre des escales et dechargements.
- [ ] Implementer un calcul d'affectation par zone.
- [ ] Ajouter les controles d'equilibrage du navire.

## Checkpoints de suivi

Mettre a jour cette section a chaque etape importante. Une case ne doit etre cochee qu'apres verification dans le code et un test de fonctionnement.

### Checkpoint 0 - Socle existant

- [x] Architecture client/serveur identifiee.
- [x] Authentification et autorisations de base disponibles.
- [x] Entites administratives existantes.
- [x] Migrations Prisma existantes verifiees.
- [ ] Tests automatises du socle ajoutes.

### Checkpoint 1 - Modele maritime

- [ ] Navire persiste en base.
- [ ] Port persiste en base.
- [ ] Voyage persiste en base.
- [ ] Capacite du navire controlee.
- [ ] CRUD et validations testes.

### Checkpoint 2 - Marchandises

- [ ] Vehicule distingue du chauffeur.
- [ ] Ligne de marchandise persistee.
- [ ] Client relie a la marchandise.
- [ ] Poids et nombre de colis valides.
- [ ] Totaux recalcules cote serveur.

### Checkpoint 3 - Plan de chargement

- [ ] Plan cree depuis un voyage.
- [ ] Plusieurs lignes ajoutees et modifiees.
- [ ] Statut et validation geres.
- [ ] Audit de la validation disponible.
- [ ] Permissions metier appliquees.

### Checkpoint 4 - Document final

- [ ] Previsualisation conforme au modele fourni.
- [ ] Poids total affiche correctement.
- [ ] Impression disponible.
- [ ] PDF genere.
- [ ] Historique des exports conserve.

## Tests et qualite

Le serveur declare actuellement un script de test placeholder. La couverture applicative reste donc a construire.

- [ ] Ajouter des tests unitaires des services metier.
- [ ] Ajouter des tests de validation des poids, colis et dates.
- [ ] Ajouter des tests d'integration des routes API.
- [ ] Tester les permissions par role et par action.
- [ ] Tester la generation du document avec le cas des `95,444 tonnes`.
- [ ] Ajouter un controle de build frontend dans chaque checkpoint.
- [ ] Ajouter une verification Prisma apres chaque migration.

Commandes de verification minimales :

```bash
cd client
npm run build

cd ../server
npx prisma validate
npx prisma migrate status
```

## Documentation associee

- [Documentation client](./client/README.md)
- [Documentation serveur](./server/README.md)
- [Schema Prisma](./server/prisma/schema.prisma)
- [Routes API](./server/src/modules/_routes.js)
- [Configuration des routes frontend](./client/src/core/routes/routeConfig.jsx)

## Regles de mise a jour du README

Lorsqu'une fonctionnalite est terminee :

1. Cocher la fonctionnalite correspondante.
2. Ajouter la migration, la route ou l'ecran concerne dans la section appropriee.
3. Decrire la verification effectuee dans le checkpoint.
4. Deplacer les elements termines hors de la feuille de route.
5. Mettre a jour la date de reference en haut du document.

Ce README est le tableau de bord documentaire du projet : il doit decrire l'etat du code, pas seulement l'architecture souhaitee.

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

| Domaine                  | Etat         | Commentaire                                                    |
| ------------------------ | ------------ | -------------------------------------------------------------- |
| Architecture modulaire   | Termine      | Organisation frontend par features et backend par modules      |
| Authentification         | Termine      | JWT, cookies, refresh tokens et rotation                       |
| Securite API             | Partiel      | Protection principale en place, sanitation a finaliser         |
| Administration           | Partiel      | Employes, utilisateurs, permissions et structure interne       |
| Clients et chauffeurs    | Partiel      | Fiches clients enrichies et clients relies aux marchandises    |
| Suivi maritime           | Partiel      | Modeles, routes CRUD et premier ecran de reference disponibles |
| Gestion des marchandises | Partiel      | API et saisie de lignes disponibles, tests metier a completer  |
| Plan de chargement       | Partiel      | Creation, lignes et total disponibles, export encore a venir   |
| Export PDF / impression  | Non commence | A concevoir apres stabilisation du manifeste                   |
| Tests automatises        | Non commence | Aucun script de test applicatif configure                      |

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
- [x] Fiche Client enrichie avec identite, fiscalite, adresses et documents.
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
- [ ] cette maquette Template n'enregistre pas de donnees dans PostgreSQL ;
- [ ] la maquette Template n'est pas encore remplacee par l'ecran metier `/loading-plans` ;
- [x] les routes API `LoadingPlan` et `CargoLine` sont disponibles dans le module dedie ;
- [x] le poids total est recalcule cote serveur et affiche en tonnes ;
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

### Convention frontend des features

Les modules CRUD simples suivent la structure de reference du module Client :

```text
feature/
├── components/
├── pages/
├── service/
└── index.js
```

- [x] `client` sert de module de reference avec un formulaire et une modale partages.
- [x] `driver` utilise une modale unique pour la creation et la modification.
- [x] `module` utilise maintenant `ModuleModal` et un service dans `service/`.
- [x] `employee` utilise maintenant `EmployeeModal`, un service dans `service/` et une page `EmployeePage.jsx`.
- [x] `companyStructure` utilise maintenant un service dans `service/`.
- [x] `maritime` et `loadingPlans` suivent deja cette convention.
- [ ] `users` reste organise par operations specialisees : acces, permissions et mot de passe.
- [ ] `companyStructure` peut encore fusionner ses formulaires par sous-entite si le besoin apparait, mais departements et postes restent volontairement distincts.

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
- `maritime`

### Modeles Prisma actuellement disponibles

- `Department`
- `Position`
- `Employee`
- `AppModule`
- `EmployeePermission`
- `AuditLog`
- `Client`
- `ClientAddress`
- `ClientDocument`
- `Driver`
- `Notification`
- `NotificationRead`
- `RefreshToken`
- `Vessel`
- `Port`
- `Voyage`
- `Vehicle`

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

- [x] `Vessel` : nom, armateur, numero d'immatriculation et capacite.
- [x] `Port` : code, nom et pays.
- [x] `Voyage` : navire, ports, dates, numero et statut.
- [x] `Vehicle` : immatriculation, type et capacite.
- [x] `LoadingPlan` : reference, voyage, statut, total et validation.
- [x] `CargoLine` : client, chauffeur, vehicule, colis, description, poids, anomalie et position.
- [ ] Historique des changements et versions du plan.

Les poids doivent etre stockes en kilogrammes, puis affiches en tonnes :

```text
poidsEnTonnes = poidsEnKilogrammes / 1000
```

Pour le document de reference, le total attendu est de `95,444 tonnes`.

### Routes API a implementer

- [x] `GET/POST /api/v1/maritime/vessels`
- [x] `GET/POST/PUT/DELETE /api/v1/maritime/vessels/:id`
- [x] `GET/POST /api/v1/maritime/ports`
- [x] `GET/POST/PUT/DELETE /api/v1/maritime/ports/:id`
- [x] `GET/POST /api/v1/maritime/voyages`
- [x] `GET/POST/PUT/DELETE /api/v1/maritime/voyages/:id`
- [x] `GET/POST /api/v1/maritime/vehicles`
- [x] `GET/POST/PUT/DELETE /api/v1/maritime/vehicles/:id`
- [x] `GET/POST /api/v1/loading-plans`
- [x] `GET/PUT/DELETE /api/v1/loading-plans/:id`
- [x] `POST /api/v1/loading-plans/:id/lines`
- [x] `PUT/DELETE /api/v1/loading-plans/:id/lines/:lineId`
- [x] `POST /api/v1/loading-plans/:id/validate`
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

- [x] Ajouter les modeles Prisma `Vessel`, `Port`, `Voyage` et `Vehicle`.
- [x] Ajouter les modeles Prisma `LoadingPlan` et `CargoLine`.
- [x] Creer et verifier la migration `add_maritime_models`.
- [x] Creer et verifier la migration `add_loading_plans_and_cargo_lines`.
- [ ] Ajouter les permissions `VESSELS`, `VOYAGES`, `LOADING_PLANS` et `CARGO`.
- [x] Ajouter le module backend `maritime` selon le pattern controller/service/routes/validation.
- [x] Ajouter le module backend `loading-plans` selon le pattern controller/service/routes/validation.
- [ ] Ajouter des donnees de demonstration coherentes avec le document de reference.
- [x] Ajouter un seed rejouable avec plusieurs navires, voyages, clients et plans de chargement.

### Phase 2 - Saisie et suivi

- [x] Creer l'ecran de gestion des navires, ports et vehicules.
- [x] Creer l'ecran de creation et de modification d'un voyage.
- [x] Connecter le referentiel maritime aux routes CRUD de l'API.
- [x] Mettre a jour le formulaire Client avec les donnees d'identite, facturation et livraison.
- [ ] Remplacer la maquette Template par un formulaire connecte a l'API.
- [x] Ajouter une saisie dynamique de plusieurs lignes de marchandises.
- [x] Afficher le poids total du plan et la capacite du navire.
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

- [x] Navire persiste en base.
- [x] Port persiste en base.
- [x] Voyage persiste en base.
- [x] Vehicule persiste en base.
- [ ] Capacite du navire controlee.
- [ ] CRUD et validations testes.

### Checkpoint 2 - Marchandises

- [x] Vehicule distingue du chauffeur.
- [x] Ligne de marchandise persistee.
- [x] Client relie a la marchandise.
- [ ] Poids et nombre de colis valides.
- [ ] Totaux recalcules cote serveur.

### Checkpoint 3 - Plan de chargement

- [x] API de creation du plan reliee a un voyage.
- [x] API d'ajout, modification et suppression des lignes disponible.
- [x] API de validation et controle de capacite disponible.
- [ ] Audit de la validation disponible.
- [ ] Tests HTTP des parcours complets realises.
- [ ] Permissions metier attribuees et testees.

### Checkpoint 4 - Document final

- [ ] Previsualisation conforme au modele fourni.
- [ ] Poids total affiche correctement.
- [ ] Impression disponible.
- [ ] PDF genere.
- [ ] Historique des exports conserve.

## Tests et qualite

Le serveur declare actuellement un script de test placeholder. La couverture applicative reste donc a construire.

- [x] Ajouter des tests unitaires des validations metier.
- [x] Tester les identites Client, adresses, documents et exonération fiscale.
- [x] Tester les validations des poids, colis et dates.
- [x] Ajouter un test d'integration des donnees logistiques seedees.
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

Tests du module logistique :

```bash
cd server
npm test
npm run test:integration
```

Le test d'integration suppose que les donnees de demonstration ont ete chargees avec `npm run seed:loading`.

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

# Rapport d'audit global

**Date :** 3 octobre 2026  
**Périmètre :** client React/Vite, API Express, authentification, permissions, modules métier, schéma/migrations Prisma, seeds, tests et documentation.  
**Mode :** audit en lecture seule; aucun correctif applicatif n'a été appliqué. Ce fichier est le seul ajout issu de l'audit.

## Synthèse

Le projet compile et le schéma Prisma est valide, mais l'audit a identifié des risques de sécurité élevés et plusieurs divergences fonctionnelles. La validation finale de l'application est donc **à différer jusqu'au traitement des constats P1**.

## Constats P1

### P1-1 — Les mots de passe sont enregistrés en clair dans l'audit

Le middleware global enregistre `req.body` dans `AuditLog.payload` pour les mutations. La route de connexion est un `POST` dont le corps contient l'identifiant et le mot de passe; les tentatives de réinitialisation envoient aussi un mot de passe. Ces valeurs peuvent donc persister en clair dans PostgreSQL.

**Fichiers :** [audit.middleware.js](server/src/common/middlewares/audit.middleware.js), [auth.routes.js](server/src/modules/auth/auth.routes.js), [auth.controller.js](server/src/modules/auth/auth.controller.js), [app.js](server/src/app.js), [schema.prisma](server/prisma/schema.prisma).

**À décider/corriger :** exclure les routes d'authentification sensibles et/ou supprimer/masquer récursivement les clés `password`, `token`, `refreshToken`, etc. avant toute écriture d'audit; définir une procédure de purge des valeurs déjà journalisées.

### P1-2 — Les rooms Socket.IO de profil ne sont pas authentifiées

Tout client pouvant ouvrir une connexion Socket.IO peut envoyer `join-profile` avec un identifiant arbitraire. Le serveur joint alors la room `employee_<id>` sans vérifier l'identité ou les droits; les changements de profil envoyés à cette room contiennent les données d'employé. Le CORS limite les origines navigateur mais ne constitue pas une authentification de socket.

**Fichiers :** [socket.js](server/src/config/socket.js), [auth.service.js](server/src/modules/auth/auth.service.js), [user.controller.js](server/src/modules/users/user.controller.js), [employee.controller.js](server/src/modules/employees/employee.controller.js).

**À décider/corriger :** authentifier le handshake avec la session/JWT, dériver l'identifiant de room de l'identité authentifiée plutôt que d'un paramètre client et limiter les émissions globales contenant des données utilisateur.

### P1-3 — L'upload d'avatar permet l'usurpation de fichier et un contenu actif

Le nom de destination est construit à partir du `matricule` fourni par le client; aucune vérification ne le relie à `req.user`. Un utilisateur authentifié peut donc viser le nom d'un autre employé. En parallèle, le filtre fait confiance au MIME multipart fourni par le client, tandis que l'extension du nom d'origine est conservée et les fichiers sont servis publiquement sous `/uploads`. Un contenu non-image peut ainsi être stocké sous une extension active en prétendant être une image.

**Fichiers :** [upload.middleware.js](server/src/common/middlewares/upload.middleware.js), [upload.routes.js](server/src/modules/uploads/upload.routes.js), [upload.controller.js](server/src/modules/uploads/upload.controller.js), [app.js](server/src/app.js).

**À décider/corriger :** autoriser uniquement l'avatar de l'utilisateur lui-même ou exiger une permission dédiée; vérifier signatures/binaires réels, forcer une extension image canonique, et ne jamais supprimer/écraser un chemin choisi à partir de données non autorisées.

### P1-4 — L'API de lecture des voyages omet la permission `VOYAGES:READ`

`GET /api/v1/voyages` et `GET /api/v1/voyages/:id` sont protégés par authentification seulement. Un employé authentifié sans permission `VOYAGES:READ` peut les appeler directement, même si l'interface masque la route.

**Fichiers :** [voyage.route.js](server/src/modules/voyage/voyage.route.js), [routeConfig.jsx](client/src/core/routes/routeConfig.jsx), [RoleGuard.jsx](client/src/shared/components/layout/RoleGuard.jsx).

**À décider/corriger :** ajouter `authorize("VOYAGES", READ)` aux deux endpoints et couvrir ce contrôle par un test HTTP.

## Constats P2

### P2-1 — Permission Client incohérente entre interface et API

L'API et la route frontend utilisent le module `CLIENT`, alors que les boutons Modifier/Supprimer vérifient `CLIENTS`. Les utilisateurs ayant les permissions valides `CLIENT:UPDATE` / `CLIENT:DELETE` ne voient donc pas ces boutons; attribuer `CLIENTS` ne résout pas le problème côté API.

**Fichiers :** [ClientTable.jsx](client/src/features/client/components/ClientTable.jsx), [ClientCard.jsx](client/src/features/client/components/ClientCard.jsx), [client.routes.js](server/src/modules/clients/client.routes.js), [routeConfig.jsx](client/src/core/routes/routeConfig.jsx).

### P2-2 — Deux APIs Voyage ont des permissions et statuts différents

Les voyages sont accessibles à la fois via `/api/v1/voyages` et `/api/v1/maritime/voyages`. La première utilise les actions `VOYAGES` et les statuts `SCHEDULED/IN_TRANSIT/ARRIVED/CANCELLED`; la seconde utilise `LOADING_PLANS` et `DRAFT/OPEN/CLOSED` pour la même table `voyages`. Cela crée un second chemin de mutation avec des droits différents et des données dont le statut n'est pas interprété de la même manière par l'interface active.

**Fichiers :** [voyage.route.js](server/src/modules/voyage/voyage.route.js), [voyage.validation.js](server/src/modules/voyage/voyage.validation.js), [maritime.routes.js](server/src/modules/maritime/maritime.routes.js), [maritime.validation.js](server/src/modules/maritime/maritime.validation.js), [_routes.js](server/src/modules/_routes.js).

**À décider/corriger :** conserver un seul contrat d'API Voyage ou faire partager les mêmes permissions et le même enum aux deux routes.

### P2-3 — Une mise à jour partielle peut rendre les dates du voyage incohérentes

La validation `voyageUpdate` applique la règle d'ordre aux champs reçus seulement. Une requête qui modifie uniquement `departureDate` ou `arrivalDate` ne compare pas sa valeur à l'autre date déjà stockée; le service met ensuite directement à jour la base sans validation de l'objet fusionné.

**Fichiers :** [voyage.validation.js](server/src/modules/voyage/voyage.validation.js), [voyage.service.js](server/src/modules/voyage/voyage.service.js).

**À décider/corriger :** dans le service, fusionner les dates existantes et reçues puis vérifier leur cohérence avant l'update; ajouter un test pour chaque mise à jour partielle.

### P2-4 — Les boutons « Ajouter » ne sont pas conditionnés aux permissions CREATE

Les pages Client, Employé, Port, Navire et Voyage affichent leur bouton de création sans vérifier `CREATE`. La route frontend ne requiert que `READ`, tandis que les POST serveur requièrent `CREATE`; un utilisateur lecture seule voit donc une action qui échouera en `403`.

**Fichiers :** [ClientPage.jsx](client/src/features/client/pages/ClientPage.jsx), [EmployeePage.jsx](client/src/features/employee/pages/EmployeePage.jsx), [PortPage.jsx](client/src/features/ports/pages/PortPage.jsx), [ShipPage.jsx](client/src/features/ship/pages/ShipPage.jsx), [VoyagePage.jsx](client/src/features/voyages/pages/VoyagePage.jsx) et leurs routes API.

### P2-5 — L'unicité du numéro de voyage est plus stricte dans le service que dans le schéma

Le schéma autorise le même `voyageNumber` sur deux navires (`@@unique([vesselId, voyageNumber])`), mais `createVoyage` et `updateVoyage` recherchent un doublon uniquement par numéro. Le service refuse donc des enregistrements que la base considère valides.

**Fichiers :** [schema.prisma](server/prisma/schema.prisma), [voyage.service.js](server/src/modules/voyage/voyage.service.js).

### P2-6 — Les données de démonstration contournent la validation du poids

Le seed crée deux marchandises avec `weightKg: 0`, alors que l'API exige un poids strictement positif. Ces lignes « poids à confirmer » sont valides en base uniquement parce que le seed contourne la validation HTTP; elles ne peuvent pas être saisies ou enregistrées de cette manière depuis l'interface.

**Fichiers :** [seedLoadingPlan.js](server/prisma/seedLoadingPlan.js), [loading-plan.validation.js](server/src/modules/loading-plans/loading-plan.validation.js), [logistics-validation.test.js](server/test/unit/logistics-validation.test.js).

**Décision métier requise :** garder le poids inconnu comme `null`/état dédié, ou autoriser zéro uniquement pour les lignes en attente avec anomalie.

### P2-7 — Une migration historique supprime les CargoLine sans transfert

La migration de renommage supprime `cargo_lines` puis crée `loads`; elle ne copie aucune ligne et son commentaire Prisma avertit de la perte. Toute base encore porteuse de données dans `cargo_lines` les perdrait lors de l'application de cette migration. La base de développement auditée a déjà dépassé cette migration; l'exposition concerne les autres environnements qui l'appliqueraient.

**Fichier :** [migration.sql](server/prisma/migrations/20261003132651_rename_cargo_lines_to_loads/migration.sql).

## État des fonctions

- La route `/driver` côté client est commentée et `/drivers` n'est pas montée dans `_routes.js`; le module Chauffeur n'est donc pas accessible par l'application malgré les éléments de documentation qui le présentent comme disponible.
- Le README principal est obsolète : il date l'état du 13 septembre, indique qu'aucun test et aucun PDF n'existent, décrit encore l'ancien modèle `CargoLine`, et annonce le module Drivers comme enregistré.
- Le README serveur décrit une architecture exemple (ES modules, module boats, ancien middleware) qui ne correspond pas à l'application CommonJS active.
- Le README client décrit encore des rôles `admin/superadmin/user`, alors que les autorisations actives sont les permissions module/action.

## Vérifications exécutées

| Vérification | Résultat |
|---|---|
| `client: npm run build` | Réussi |
| `server: npm test` | Réussi, 14/14 tests unitaires |
| `server: node --check` | Réussi, 92 fichiers JavaScript vérifiés |
| `prisma validate` | Réussi |
| `prisma migrate status` | Réussi, base `lct_premium` à jour, 17 migrations |
| `server: npm run test:integration` | Échec des 4 assertions de données de démonstration : la base est accessible mais ne contient pas les navires et le plan `PL-13E-2026` attendus |
| Tests HTTP/permissions/navigation navigateur | Aucun script configuré; non exécutés |

Le seed n'a pas été lancé, car `seedLoadingPlan.js` supprime puis recrée les marchandises des plans de référence.

## Ordre de correction suggéré

1. Corriger la journalisation des secrets et l'authentification/autorisation Socket.IO.
2. Restreindre l'upload d'avatar par identité et valider réellement son contenu.
3. Aligner la permission `VOYAGES:READ` du serveur avec l'interface.
4. Unifier les deux APIs et statuts de voyage; corriger la validation des dates partielles.
5. Aligner les permissions Client et conditionner les boutons CREATE.
6. Décider du contrat métier pour le poids inconnu des marchandises.
7. Réconcilier la migration CargoLine/Load avant application à une base contenant des CargoLine.
8. Actualiser les README et ajouter des tests API d'autorisations et de transitions de plans.

**Aucun de ces correctifs n'a été appliqué dans le cadre de l'audit.**
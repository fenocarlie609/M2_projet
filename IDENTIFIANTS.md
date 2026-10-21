# Identifiants et accès de démonstration

Ce document recense les adresses, les ports et les comptes de l'application.
Il est destiné à la démonstration de soutenance et au développement local.

> **Avertissement** — ces comptes appartiennent à un jeu de données de
> démonstration. Le mot de passe de l'administrateur universel
> (`Admin@2026`) est lisible dans la configuration de l'environnement et doit
> être changé avant toute mise en service réelle. Dans le code, les mots de
> passe ne sont jamais conservés en clair : seule l'empreinte bcrypt est
> enregistrée.

## Adresses

| Service | Adresse | Remarque |
| --- | --- | --- |
| **Interface web** | **http://localhost:8080** | pile conteneurisée (nginx) |
| Interface web (développement) | http://localhost:5173 | Vite, rechargement à chaud |
| Interface de programmation | http://localhost:5000/api/v1 | Express |
| Contrôle de santé | http://localhost:5000/api/v1/health | `{"status":"success"}` |
| Base de données | `postgresql://gestion:gestion@localhost:5432/gestion` | conteneur `gestion-db` |

La pile conteneurisée se lance par `docker compose up --build` ; la base seule
par `docker compose up -d db`, le serveur et l'interface étant alors lancés en
local (`npm run dev`).

## Comptes

Mot de passe commun aux comptes de démonstration : `Demo@2026`.
Mot de passe de l'administrateur universel : `Admin@2026`.

| Identifiant | Nom | Département | Poste | Droits |
| --- | --- | --- | --- | --- |
| `admin@lct.mg` | Administrateur Système | Technologie & Systèmes | Administrateur Système / Réseau | **tous** (`*:*`) |
| `n.rasoanaivo@lct.mg` | Coordinatrice logistique | Logistique & Opérations Maritimes | Coordinateur logistique | clients, navires, ports, voyages, plans, marchandises, entrepôt |
| `j.rakoto@lct.mg` | Agent de quai | Logistique & Opérations Maritimes | Agent de quai | lecture clients et plans, saisie des marchandises, lecture de l'entrepôt |
| `t.rabe@lct.mg` | Technicien | Technologie & Systèmes | Administrateur Système / Réseau | employés, utilisateurs et accès, modules, structure |
| `t.rabemananarisoa@lct.mg` | Responsable RH | Administration & RH | Responsable Ressources Humaines | employés, structure |
| `m.andrianarisoa@lct.mg` | Chargé de clientèle | Commercial & Relation Client | Chargé de clientèle | clients, lecture des plans |
| `h.randrianasolo@lct.mg` | Comptable | Finance & Comptabilité | Comptable | lecture clients et plans |
| `f.rakotomalala@lct.mg` | Développeur | Technologie & Systèmes | Ingénieur Logiciel | lecture employés, clients, plans, marchandises |
| `f.rakotonirina@lct.mg` | Responsable de flotte | Logistique & Opérations Maritimes | Gestionnaire de flotte | **aucun accès** (demande en attente) |
| `s.raharimalala@lct.mg` | Membre d'équipage | Logistique & Opérations Maritimes | Membre d'équipage | **aucun accès** (demande en attente) |
| `f.rabemananarisoa@lct.mg` | Directeur des opérations | Administration & RH | Directeur des opérations | **aucun accès** (demande en attente) |

Les trois derniers comptes n'ont pas d'accès à l'application : ils illustrent le
circuit de demande d'accès, qui notifie les administrateurs du département
technique.

Le tableau de bord s'adapte au profil connecté : l'administrateur reçoit les
huit blocs, l'agent de quai trois (sans audit ni effectifs), le technicien
quatre (sans exploitation au quai).

## Changer un mot de passe

```powershell
cd app_gestion\server
node -e "const b=require('bcryptjs');console.log(b.hashSync('NouveauMotDePasse',10))"
```

La valeur obtenue se place dans `server\.env` (variable `ADMIN_PASSWORD`, pour
le compte d'amorçage) ou se remplace directement en base dans la table
`employees`, colonne `password`. Un changement s'applique à la prochaine
connexion.

## Variables d'environnement utiles

| Variable | Rôle |
| --- | --- |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME` | compte d'amorçage, recréé à chaque `seed` |
| `DATABASE_URL` | connexion à PostgreSQL |
| `JWT_SECRET`, `JWT_REFRESH_SECRET`, `COOKIE_SECRET` | signature des jetons et des cookies |
| `JWT_EXPIRES_IN`, `JWT_REFRESH_EXPIRES_IN` | durées de validité (15 min et 7 jours) |
| `CLIENT_URL` | origine autorisée pour le navigateur |
| `PORT` | port de l'interface de programmation (5000) |
| `DB_PORT`, `SERVER_PORT`, `CLIENT_PORT` | ports publiés par l'orchestrateur |

Un exemple complet figure dans `app_gestion\server\.env.example`.

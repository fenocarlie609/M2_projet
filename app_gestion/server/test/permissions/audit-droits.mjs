// test/permissions/audit-droits.mjs
// Audit des acces : chaque compte de demonstration est mis en situation
// d'executer les operations de chaque module, et le verdict de
// l'interface de programmation est compare aux droits declares.
//
// Une operation refusee doit repondre 403 ; une operation accordee doit
// passer la porte des droits, meme si la donnee demandee est ensuite
// introuvable (404) ou refusee par la validation (400). Tout autre
// verdict est signale.
//
// Le parcours envois environ six cents requetes : il faut un limiteur
// global plus large que la valeur habituelle (RATE_LIMIT_MAX=5000 sur
// l'environnement conteneurise), sinon le parcours est coupe en cours de
// route et les verdicts deviennent faux.
//
// Les operations de creation reellement abouties sont annulees a la fin :
// le jeu de demonstration est laisse dans son etat initial.
const RACINE = process.env.APP_URL || "http://localhost:5000/api/v1";
const MOT_DE_PASSE = process.env.APP_MOT_DE_PASSE || "Demo@2026";
const IDENTIFIANT_ADMIN = process.env.APP_IDENTIFIANT || "admin@lct.mg";
const MOT_DE_PASSE_ADMIN =
  process.env.APP_MOT_DE_PASSE_ADMIN || "Admin@2026";

const alea = () =>
  "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });

const AU_HAS = (droits, module, action) =>
  droits.some(
    (d) =>
      (d.module === module || d.module === "*") &&
      (d.action === action || d.action === "*"),
  );

const extraire = (reponse, nom) => {
  const brut = reponse.headers.getSetCookie
    ? reponse.headers.getSetCookie()
    : [];
  const trouve = brut.find((c) => c.startsWith(`${nom}=`));
  return trouve ? decodeURIComponent(trouve.split("=")[1].split(";")[0]) : null;
};

const connecter = async (identifiant, motDePasse = MOT_DE_PASSE) => {
  const reponse = await fetch(`${RACINE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier: identifiant, password: motDePasse }),
  });
  if (!reponse.ok) {
    const corps = await reponse.text();
    throw new Error(
      `connexion impossible pour ${identifiant} (${reponse.status}) : ${corps}`,
    );
  }
  // Le cookie signe contient le jeton : s:<jeton>.<signature>
  const signe = extraire(reponse, "token");
  const jeton = signe.slice(2, signe.lastIndexOf("."));

  const reponseCsrf = await fetch(`${RACINE}/auth/csrf-token`);
  const csrf = await reponseCsrf.json();
  // La protection CSRF compare le cookie au header : les deux doivent
  // etre presents et identiques.
  const cookieCsrf = extraire(reponseCsrf, "xsrf-token");

  return { jeton, csrf: csrf?.data?.csrfToken, cookieCsrf };
};

const appeler = async (session, methode, chemin, corps) => {
  const reponse = await fetch(`${RACINE}${chemin}`, {
    method: methode,
    headers: {
      Authorization: `Bearer ${session.jeton}`,
      "X-CSRF-Token": session.csrf || "",
      Cookie: `xsrf-token=${session.cookieCsrf || ""}`,
      "Content-Type": "application/json",
    },
    body: corps === undefined ? undefined : JSON.stringify(corps),
  });
  let donnees = null;
  try {
    donnees = await reponse.json();
  } catch {
    donnees = null;
  }
  return {
    statut: reponse.status,
    message: donnees?.message || "",
    donnees,
  };
};

// Les sondes : pour chaque module, une lecture, une creation, une
// modification et une suppression. Les identifiants utilises pour les
// modifications et les suppressions sont aleatoires : une operation
// accordeebut sur un enregistrement inexistant, sans toucher au jeu.
const construireSondes = (contexte) => {
  const inconnu = alea();
  const planId = contexte.planId;
  const ligneId = contexte.ligneId;

  return [
    {
      code: "CLIENT",
      nom: "Clients",
      lire: () => ["GET", "/clients"],
      creer: (compte) => [
        "POST",
        "/clients",
        { name: `TMP-AUDIT-${compte}`, type: "INDIVIDUAL" },
      ],
      modifier: () => ["PUT", `/clients/${inconnu}`, { name: "TMP-AUDIT" }],
      supprimer: () => ["DELETE", `/clients/${inconnu}`],
    },
    {
      code: "EMPLOYEES",
      nom: "Employés",
      lire: () => ["GET", "/employees"],
      creer: () => ["POST", "/employees", {}],
      modifier: () => ["PUT", `/employees/${inconnu}`, {}],
      supprimer: () => ["DELETE", `/employees/${inconnu}`],
    },
    {
      code: "VOYAGES",
      nom: "Voyages",
      lire: () => ["GET", "/voyages"],
      creer: () => ["POST", "/voyages", {}],
      modifier: () => ["PUT", `/voyages/${inconnu}`, {}],
      supprimer: () => ["DELETE", `/voyages/${inconnu}`],
    },
    {
      code: "PORTS",
      nom: "Ports",
      lire: () => ["GET", "/maritime/ports"],
      creer: (compte) => [
        "POST",
        "/maritime/ports",
        { code: `TMPAUD${compte.slice(0, 4).toUpperCase()}`, name: "TMP-AUDIT" },
      ],
      modifier: () => ["PUT", `/maritime/ports/${inconnu}`, { name: "TMP" }],
      supprimer: () => ["DELETE", `/maritime/ports/${inconnu}`],
    },
    {
      code: "VESSELS",
      nom: "Navires",
      lire: () => ["GET", "/maritime/vessels"],
      creer: (compte) => [
        "POST",
        "/maritime/vessels",
        { name: `TMP-AUDIT-${compte}` },
      ],
      modifier: () => ["PUT", `/maritime/vessels/${inconnu}`, { name: "TMP" }],
      supprimer: () => ["DELETE", `/maritime/vessels/${inconnu}`],
    },
    {
      code: "LOADING_PLANS",
      nom: "Plans de manutention",
      lire: () => ["GET", "/loading-plans"],
      creer: () => ["POST", "/loading-plans", {}],
      modifier: () => ["PUT", `/loading-plans/${inconnu}`, {}],
      supprimer: () => ["DELETE", `/loading-plans/${inconnu}`],
    },
    {
      code: "CARGO",
      nom: "Marchandises (lignes)",
      // La lecture des lignes de marchandises n'a pas de route propre :
      // elle accompagne la lecture du plan, qui exige LOADING_PLANS:READ.
      // Les ecritures, elles, exigent bien CARGO.
      droitLecture: "LOADING_PLANS",
      lire: () => ["GET", `/loading-plans/${planId}`],
      creer: () => ["POST", `/loading-plans/${planId}/loads`, {}],
      modifier: () => [
        "PUT",
        `/loading-plans/${planId}/loads/${ligneId}`,
        {},
      ],
      supprimer: () => [
        "DELETE",
        `/loading-plans/${planId}/loads/${ligneId}`,
      ],
    },
    {
      code: "ENTREPOTS",
      nom: "Entrepôts",
      lire: () => ["GET", "/warehouse"],
      creer: () => ["POST", "/warehouse", {}],
      modifier: () => ["PUT", `/warehouse/${inconnu}`, {}],
      supprimer: () => ["DELETE", `/warehouse/${inconnu}`],
    },
    {
      code: "USERS",
      nom: "Comptes et accès",
      lire: () => ["GET", "/users"],
      creer: () => ["POST", `/users/${inconnu}/access`, {}],
      modifier: () => ["PATCH", `/users/${inconnu}/access`, {}],
      supprimer: () => ["DELETE", `/users/${inconnu}/access`],
    },
    {
      code: "MODULE",
      nom: "Modules de permissions",
      lire: () => ["GET", "/modules"],
      creer: (compte) => [
        "POST",
        "/modules",
        {
          code: `TMPAUD${compte.slice(0, 4).toUpperCase()}`,
          label: "TMP-AUDIT",
          description: "TMP-AUDIT",
        },
      ],
      modifier: () => ["PUT", `/modules/${inconnu}`, { label: "TMP" }],
      supprimer: () => ["DELETE", `/modules/${inconnu}`],
    },
    {
      code: "COMPANY_STRUCTURE",
      nom: "Structure de l'entreprise",
      lire: () => ["GET", "/company-structure"],
      creer: (compte) => [
        "POST",
        "/company-structure/departments",
        {
          code: `TMPAUD${compte.slice(0, 4).toUpperCase()}`,
          label: `TMP-AUDIT-${compte}`,
        },
      ],
      modifier: () => [
        "PUT",
        `/company-structure/departments/${inconnu}`,
        { label: "TMP-AUDIT" },
      ],
      supprimer: () => [
        "DELETE",
        `/company-structure/departments/${inconnu}`,
      ],
    },
  ];
};

const ACTIONS = [
  { cle: "READ", libelle: "lire", sonde: (s, c) => s.lire(c) },
  { cle: "CREATE", libelle: "creer", sonde: (s, c) => s.creer(c) },
  { cle: "UPDATE", libelle: "modifier", sonde: (s, c) => s.modifier(c) },
  { cle: "DELETE", libelle: "supprimer", sonde: (s, c) => s.supprimer(c) },
];

// Pour chaque module, la cle de la creation dans la reponse et le chemin
// de suppression : le parcours annule ce qu'il a cree.
const cleDuModele = {
  CLIENT: "client",
  PORTS: "port",
  VESSELS: "vessel",
  MODULE: "module",
  COMPANY_STRUCTURE: "department",
};

const cheminDeModele = {
  CLIENT: "/clients",
  PORTS: "/maritime/ports",
  VESSELS: "/maritime/vessels",
  MODULE: "/modules",
  COMPANY_STRUCTURE: "/company-structure/departments",
};

const executer = async () => {
  const sessionAdmin = await connecter(IDENTIFIANT_ADMIN, MOT_DE_PASSE_ADMIN);

  // Les comptes et leurs droits declares, lus par l'administrateur.
  const reponseComptes = await appeler(sessionAdmin, "GET", "/users");
  const comptes = (reponseComptes.donnees?.data?.users || []).map((c) => ({
    id: c.id,
    email: c.email,
    nom: c.name,
    droits: c.permissions || [],
  }));

  // Un plan et une ligne servent de support aux sondes sur les
  // marchandises.
  const reponsePlans = await appeler(sessionAdmin, "GET", "/loading-plans");
  const plan = (reponsePlans.donnees?.data?.loadingPlans || [])[0];
  let ligneId = alea();
  if (plan) {
    const reponsePlan = await appeler(
      sessionAdmin,
      "GET",
      `/loading-plans/${plan.id}`,
    );
    const lignes = reponsePlan.donnees?.data?.loads || [];
    if (lignes[0]) ligneId = lignes[0].id;
  }

  const anomalies = [];
  const creations = [];
  const matrice = [];

  for (const compte of comptes) {
    // Le compte administrateur universel a son propre mot de passe.
    const motDePasse =
      compte.email === IDENTIFIANT_ADMIN ? MOT_DE_PASSE_ADMIN : MOT_DE_PASSE;
    const session = await connecter(compte.email, motDePasse);
    const lignes = [];

    for (const sonde of construireSondes({ planId: plan?.id, ligneId })) {
      for (const action of ACTIONS) {
        // La lecture peut etre regie par un autre module que celui
        // des ecritures (les lignes de marchandises suivent le plan).
        const moduleConcerne =
          action.cle === "READ" ? sonde.droitLecture || sonde.code : sonde.code;
        const attendu = AU_HAS(compte.droits, moduleConcerne, action.cle);
        const [methode, chemin, corps] = action.sonde(sonde, compte.email);

        const reponse = await appeler(session, methode, chemin, corps);

        const refuse = reponse.statut === 403;
        const erreurCsrf = /CSRF/i.test(reponse.message || "");
        const limite = reponse.statut === 429;
        const accorde = !refuse && reponse.statut !== 401;

        if (limite) {
          // Le limiteur global a coupe le parcours : le verdict de cette
          // operation ne veut rien dire.
          anomalies.push({
            type: "LIMITE",
            compte: compte.email,
            module: moduleConcerne,
            action: action.cle,
            detail:
              "limiteur de requetes atteint : le parcours doit etre relance avec un volume plus eleve (RATE_LIMIT_MAX)",
          });
        } else if (erreurCsrf) {
          anomalies.push({
            type: "SCRIPT",
            compte: compte.email,
            module: moduleConcerne,
            action: action.cle,
            detail: "jeton CSRF manquant : la sonde ne prouve rien",
          });
        } else if (attendu && refuse) {
          anomalies.push({
            type: "TROP STRICT",
            compte: compte.email,
            module: moduleConcerne,
            action: action.cle,
            detail: `droit ${moduleConcerne}:${action.cle} declare, operation refusee (${reponse.statut})`,
          });
        } else if (!attendu && accorde) {
          anomalies.push({
            type: "TROP LARGE",
            compte: compte.email,
            module: moduleConcerne,
            action: action.cle,
            detail: `droit ${moduleConcerne}:${action.cle} absent, operation acceptee (${reponse.statut} ${reponse.message || ""})`,
          });
        }

        // Les creations reellement abouties sont memorisees pour etre
        // annulees a la fin du parcours.
        if (
          action.cle === "CREATE" &&
          accorde &&
          (reponse.statut === 200 || reponse.statut === 201)
        ) {
          const cree = reponse.donnees?.data?.[cleDuModele[sonde.code]];
          if (cree?.id) {
            creations.push({ module: sonde.code, id: cree.id, chemin: cheminDeModele[sonde.code] });
          }
        }

        lignes.push({
          module: sonde.code,
          action: action.cle,
          attendu,
          statut: reponse.statut,
          verdict: refuse ? "refuse" : "accorde",
        });
      }
    }

    matrice.push({ compte: compte.email, nom: compte.nom, lignes });
  }

  // Nettoyage : tout ce que le parcours a cree est supprime.
  let annules = 0;
  for (const creation of creations) {
    const reponse = await appeler(
      sessionAdmin,
      "DELETE",
      `${creation.chemin}/${creation.id}`,
    );
    if (reponse.statut === 200 || reponse.statut === 204 || reponse.statut === 404) {
      annules += 1;
    }
  }

  // Compte rendu.
  console.log("== Droits declares et operations reellement acceptees ==\n");
  for (const entree of matrice) {
    const grants = entree.lignes
      .filter((l) => l.verdict === "accorde")
      .map((l) => `${l.module}:${l.action}`);
    console.log(`${entree.compte}  (${entree.nom})`);
    console.log(`   accepte : ${grants.length ? grants.join(", ") : "aucune operation"}`);
  }

  console.log("\n== Anomalies ==\n");
  if (anomalies.length === 0) {
    console.log("Aucune : chaque operation est accordee exactement aux droits declares.");
  } else {
    for (const anomalie of anomalies) {
      console.log(
        `[${anomalie.type}] ${anomalie.compte} - ${anomalie.module}:${anomalie.action} : ${anomalie.detail}`,
      );
    }
    console.log(`\n${anomalies.length} anomalie(s).`);
  }

  console.log(
    `\nNettoyage : ${annules} enregistrement(s) de test supprime(s) a la fin du parcours.`,
  );

  process.exit(anomalies.length === 0 ? 0 : 1);
};

executer().catch((erreur) => {
  console.error(erreur);
  process.exit(1);
});

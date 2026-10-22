// e2e/parcours.mjs
// Verification de l'interface : les memes ecrans sont parcourus en format
// telephone et en format bureau.
//
// Pour chaque ecran de liste, le nombre d'elements annonces par le
// tableau (pagination : « Afficher 5 lignes sur 16 ») doit correspondre au
// nombre de cartes affichees sur telephone. Les tableaux laissent la place
// a des cartes sur petit ecran, mais aucune donnee ne doit disparaitre au
// passage.
//
// Le controle porte aussi sur la console du navigateur et sur les appels
// de l'interface de programmation : une erreurconsole ou une reponse
// 4xx/5xx fait echouer le parcours.
//
// Les identifiants viennent des variables d'environnement, avec les
// valeurs de demonstration par defaut.
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ici = path.dirname(fileURLToPath(import.meta.url));
const RACINE = process.env.APP_URL || "http://localhost:8080";
const IDENTIFIANT = process.env.APP_IDENTIFIANT || "admin@lct.mg";
const MOT_DE_PASSE = process.env.APP_MOT_DE_PASSE || "Admin@2026";

const PROFILS = {
  mobile: {
    nom: "mobile",
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 2,
  },
  bureau: {
    nom: "bureau",
    viewport: { width: 1440, height: 900 },
  },
};

// Ecrans de liste : le total du tableau doit egaler le nombre de cartes.
const ECRANS_LISTE = [
  { chemin: "/employees", nom: "employes", minimum: 10 },
  { chemin: "/client", nom: "clients", minimum: 10 },
  { chemin: "/ship", nom: "navires", minimum: 3 },
  { chemin: "/ports", nom: "ports", minimum: 6 },
  { chemin: "/voyages", nom: "voyages", minimum: 10 },
  { chemin: "/plans", nom: "plans", minimum: 5 },
  { chemin: "/warehouse", nom: "entrepot", minimum: 3 },
  { chemin: "/users", nom: "comptes", minimum: 10 },
  { chemin: "/module", nom: "modules", minimum: 10 },
];

// Ecrans qui ne sont pas des listes : on verifie qu'ils s'affichent dans
// les deux formats et qu'ils ne signalent aucune erreur.
const ECRANS_SIMPLE = [
  { chemin: "/dashboard", nom: "tableau-de-bord" },
  { chemin: "/company-structure", nom: "structure-entreprise" },
];

const seConnecter = async (page) => {
  await page.goto(`${RACINE}/login`, { waitUntil: "domcontentloaded" });
  await page.locator('input[type="text"]').first().fill(IDENTIFIANT);
  await page.locator('input[type="password"]').first().fill(MOT_DE_PASSE);
  await page.getByRole("button", { name: "Se connecter" }).click();
  try {
    await page.waitForURL(/dashboard/, { timeout: 20000 });
  } catch {
    const message = await page.locator("body").innerText();
    throw new Error(
      `connexion impossible (${IDENTIFIANT}) : ${message.replace(/\s+/g, " ").slice(0, 160)}`,
    );
  }
};

// Nombre total d'elements d'une liste, lu dans la barre de pagination du
// tableau (« Afficher 5 lignes sur 16 »).
const totalDuTableau = async (page) => {
  const texte = await page.locator("main").innerText();
  const trouve = texte.match(/lignes sur\s+(\d+)/);
  return trouve ? Number(trouve[1]) : null;
};

const compter = async (page) => ({
  lignes: await page.locator("main table tbody tr:visible").count(),
  cartes: await page.locator("main .md\\:hidden > *:visible").count(),
  titres: await page.locator("main h3:visible").count(),
});

const parcourir = async (navigateur, profil) => {
  const contexte = await navigateur.newContext({
    viewport: profil.viewport,
    isMobile: profil.isMobile || false,
    hasTouch: profil.hasTouch || false,
    deviceScaleFactor: profil.deviceScaleFactor || 1,
    // Le service worker est neutralise : le test doit toujours juger le
    // paquet qui vient d'etre servi.
    serviceWorkers: "block",
    locale: "fr-FR",
  });

  const page = await contexte.newPage();
  const erreursConsole = [];
  const appelsEnEchec = [];

  page.on("console", (message) => {
    if (message.type() === "error") erreursConsole.push(message.text());
  });
  page.on("response", (reponse) => {
    const url = reponse.url();
    if (url.includes("/api/") && reponse.status() >= 400) {
      appelsEnEchec.push(`${reponse.status()} ${url.replace(RACINE, "")}`);
    }
  });

  await seConnecter(page);

  const dossier = path.join(ici, "captures", profil.nom);
  await mkdir(dossier, { recursive: true });

  const resultats = [];

  for (const ecran of [...ECRANS_LISTE, ...ECRANS_SIMPLE]) {
    const erreursAvant = erreursConsole.length;
    const echecsAvant = appelsEnEchec.length;

    await page.goto(`${RACINE}${ecran.chemin}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(700);

    const titre = await page.locator("h1").first().textContent();
    const compte = await compter(page);
    const total = await totalDuTableau(page);

    await page.screenshot({
      path: path.join(dossier, `${ecran.nom}.png`),
      fullPage: true,
    });

    resultats.push({
      ecran: ecran.nom,
      chemin: ecran.chemin,
      liste: Boolean(ecran.minimum),
      minimum: ecran.minimum ?? null,
      titre: (titre || "").trim(),
      ...compte,
      totalTableau: total,
      erreursConsole: erreursConsole.slice(erreursAvant),
      appelsEnEchec: appelsEnEchec.slice(echecsAvant),
    });
  }

  await contexte.close();
  return resultats;
};

// Les profils restreints : un compte qui n'a pas tous les droits doit
// pouvoir consulter les ecrans qui le concernent. Une liste annexe
// belonging to another module (les voyages sur l'ecran des plans, par
// exemple) ne doit pas condamner l'ecran : c'est le piege que le
// parcours a deja rencontre.
const COMPTES_RESTREINTS = [
  {
    email: "j.rakoto@lct.mg",
    motDePasse: "Demo@2026",
    nom: "agent de quai",
    ecrans: ["/plans", "/client", "/warehouse", "/dashboard"],
  },
  {
    email: "t.rajaonarison@lct.mg",
    motDePasse: "Demo@2026",
    nom: "responsable commercial",
    ecrans: ["/plans", "/client", "/voyages", "/dashboard"],
  },
  {
    email: "m.rajaonarison@lct.mg",
    motDePasse: "Demo@2026",
    nom: "administrateur de base de donnees",
    ecrans: ["/employees", "/client", "/dashboard"],
  },
];

const verifierProfils = async (navigateur) => {
  const anomalies = [];

  for (const profil of COMPTES_RESTREINTS) {
    // Une session propre par compte : les droits de l'un ne doivent pas
    // deborder sur l'autre.
    const contexte = await navigateur.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
      deviceScaleFactor: 2,
      serviceWorkers: "block",
      locale: "fr-FR",
    });
    const page = await contexte.newPage();

    await page.goto(`${RACINE}/login`, { waitUntil: "domcontentloaded" });
    await page.locator('input[type="text"]').first().fill(profil.email);
    await page.locator('input[type="password"]').first().fill(profil.motDePasse);
    await page.getByRole("button", { name: "Se connecter" }).click();
    await page.waitForURL(/dashboard/, { timeout: 20000 });

    for (const chemin of profil.ecrans) {
      await page.goto(`${RACINE}${chemin}`, { waitUntil: "networkidle" });
      await page.waitForTimeout(700);

      const texte = await page.locator("main").innerText();
      const refus = /Vous n'avez pas la permission/i.test(texte);
      const erreur = /^Erreur$/m.test(texte);
      const vide = texte.trim().length < 60;

      if (refus || erreur || vide) {
        anomalies.push({
          profil: profil.email,
          chemin,
          detail: refus
            ? "la page affiche un refus de droit"
            : erreur
              ? "la page affiche un bandeau d'erreur"
              : "la page est vide",
        });
      }
    }

    await contexte.close();
  }

  return anomalies;
};

// Les ecrans de l'application et le droit de lecture qu'ils exigent.
// « contenu » designe ce que l'ecran doit montrer : les cartes de la
// liste sur telephone, les blocs de la structure.
const ECRANS = [
  { chemin: "/dashboard", module: null, contenu: null },
  { chemin: "/employees", module: "EMPLOYEES", contenu: "cartes" },
  { chemin: "/client", module: "CLIENT", contenu: "cartes" },
  { chemin: "/ship", module: "VESSELS", contenu: "cartes" },
  { chemin: "/ports", module: "PORTS", contenu: "cartes" },
  { chemin: "/voyages", module: "VOYAGES", contenu: "cartes" },
  { chemin: "/plans", module: "LOADING_PLANS", contenu: "cartes" },
  { chemin: "/warehouse", module: "ENTREPOTS", contenu: "cartes" },
  { chemin: "/users", module: "USERS", contenu: "cartes" },
  { chemin: "/module", module: "MODULE", contenu: "cartes" },
  { chemin: "/company-structure", module: "COMPANY_STRUCTURE", contenu: "titres" },
];

// Les ecrans de manifeste : ils portent une reference de plan, ils sont
// donc construits apres lecture des plans. Un plan de dechargement
// s'ouvre sur sa propre route.
const ecransDeManifeste = (references) =>
  references.map(({ reference, operationType }) => ({
    chemin: `/plans/${operationType === "UNLOAD" ? "unload" : "load"}/${reference}`,
    module: "LOADING_PLANS",
    contenu: "cartes",
    reference,
  }));

// Le jeton de l'administrateur et le jeton CSRF, pour les appels
// d'interface de programmation faits depuis le script.
const jetonAdministrateur = async () => {
  const reponse = await fetch(`${RACINE}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      identifier: process.env.APP_IDENTIFIANT || "admin@lct.mg",
      password: process.env.APP_MOT_DE_PASSE_ADMIN || "Admin@2026",
    }),
  });
  const brut = reponse.headers.getSetCookie
    ? reponse.headers.getSetCookie()
    : [];
  const cookie = brut
    .find((c) => c.startsWith("token="))
    ?.split("=")[1]
    .split(";")[0];
  return decodeURIComponent(cookie).slice(2).replace(/\.[^.]+$/, "");
};

// Le jeton CSRF et son cookie doivent provenir de la meme reponse : le
// serveur compare les deux.
const csrf = async () => {
  const reponse = await fetch(`${RACINE}/api/v1/auth/csrf-token`);
  const corps = await reponse.json();
  const brut = reponse.headers.getSetCookie
    ? reponse.headers.getSetCookie()
    : [];
  const cookie = brut.find((c) => c.startsWith("xsrf-token="));
  return {
    token: corps?.data?.csrfToken || "",
    cookie: cookie ? cookie.split("=")[1].split(";")[0] : "",
  };
};

// La liste des comptes et leurs droits, lue par l'administrateur, ainsi
// que deux references de plan pour les ecrans de manifeste.
const comptesDepuisLApi = async () => {
  const jeton = await jetonAdministrateur();
  const entetes = { Authorization: `Bearer ${jeton}` };

  const reponseComptes = await fetch(`${RACINE}/api/v1/users`, {
    headers: entetes,
  });
  const corps = await reponseComptes.json();

  const reponsePlans = await fetch(`${RACINE}/api/v1/loading-plans`, {
    headers: entetes,
  });
  const plans = (await reponsePlans.json())?.data?.loadingPlans || [];
  const chargement = plans.find(
    (plan) => (plan.operationType || "LOAD") === "LOAD",
  );
  const dechargement = plans.find(
    (plan) => plan.operationType === "UNLOAD",
  );

  const references = [];
  if (chargement) {
    references.push({ reference: chargement.reference, operationType: "LOAD" });
  }
  if (dechargement) {
    references.push({
      reference: dechargement.reference,
      operationType: "UNLOAD",
    });
  }

  return { comptes: corps?.data?.users || [], references };
};

const aLeDroitDeLecture = (compte, module) =>
  !module ||
  (compte.permissions || []).some(
    (p) =>
      (p.module === module || p.module === "*") &&
      (p.action === "READ" || p.action === "*"),
  );

// La matrice complete : chaque compte, chaque ecran. Un ecran auquel le
// compte a droit doit s'afficher, sans refus. Un ecran auquel il n'a pas
// droit doit le renvoyer vers le tableau de bord, jamais lui opposer une
// erreur.
const verifierComptes = async (navigateur, comptes, references) => {
  const anomalies = [];
  let verifications = 0;

  const ecrans = [...ECRANS, ...ecransDeManifeste(references)];

  for (const compte of comptes) {
    const motDePasse =
      compte.email === (process.env.APP_IDENTIFIANT || "admin@lct.mg")
        ? process.env.APP_MOT_DE_PASSE_ADMIN || "Admin@2026"
        : process.env.APP_MOT_DE_PASSE || "Demo@2026";

    const contexte = await navigateur.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
      deviceScaleFactor: 2,
      serviceWorkers: "block",
      locale: "fr-FR",
    });
    const page = await contexte.newPage();
    const limiteAtteinte = [];
    page.on("response", (reponse) => {
      if (reponse.status() === 429) limiteAtteinte.push(reponse.url());
    });

    await page.goto(`${RACINE}/login`, { waitUntil: "domcontentloaded" });
    await page.locator('input[type="text"]').first().fill(compte.email);
    await page.locator('input[type="password"]').first().fill(motDePasse);
    await page.getByRole("button", { name: "Se connecter" }).click();
    await page.waitForURL(/dashboard/, { timeout: 20000 });

    for (const ecran of ecrans) {
      const autorise = aLeDroitDeLecture(compte, ecran.module);
      const limiteAvant = limiteAtteinte.length;

      await page.goto(`${RACINE}${ecran.chemin}`, { waitUntil: "networkidle" });
      await page.waitForTimeout(800);

      // Pendant la redirection, la page peut etre un instant sans zone
      // principale : on attend, puis on se rabat sur le corps entier.
      let texte = "";
      try {
        texte = await page.locator("main").innerText({ timeout: 8000 });
      } catch {
        texte = await page.locator("body").innerText();
      }
      const url = page.url();

      if (limiteAtteinte.length > limiteAvant) {
        // Le limiteur global a coupe la reponse : le verdict ne veut rien
        // dire, il faut relancer avec un volume plus eleve.
        anomalies.push({
          profil: compte.email,
          chemin: ecran.chemin,
          detail:
            "limiteur de requetes atteint : le parcours doit etre relance avec RATE_LIMIT_MAX plus eleve",
        });
        continue;
      }

      // L'ecran affiche-t-il ses donnees ? Sur telephone, la liste est
      // portee par les cartes ; la structure, par ses blocs.
      let elements = 0;
      if (ecran.contenu === "cartes") {
        elements = await page
          .locator("main .md\\:hidden > *:visible")
          .count();
        if (elements === 0) {
          elements = await page.locator("main table tbody tr:visible").count();
        }
      } else if (ecran.contenu === "titres") {
        elements = await page.locator("main h3:visible").count();
      }
      const refus = /Vous n'avez pas la permission/i.test(texte);
      const erreur = /^Erreur$/m.test(texte);
      const vide = texte.trim().length < 60;

      if (autorise) {
        if (refus || erreur) {
          anomalies.push({
            profil: compte.email,
            chemin: ecran.chemin,
            detail: refus
              ? "la page affiche un refus de droit alors que le compte a le droit de lecture"
              : "la page affiche un bandeau d'erreur",
          });
        } else if (vide) {
          anomalies.push({
            profil: compte.email,
            chemin: ecran.chemin,
            detail: "la page est vide",
          });
        } else if (ecran.contenu && elements === 0) {
          anomalies.push({
            profil: compte.email,
            chemin: ecran.chemin,
            detail: "la page n'affiche aucune donnee de sa liste",
          });
        }
      } else {
        if (refus || erreur) {
          anomalies.push({
            profil: compte.email,
            chemin: ecran.chemin,
            detail: "la page affiche une erreur au lieu de renvoyer vers le tableau de bord",
          });
        } else if (!/\/dashboard/.test(url)) {
          anomalies.push({
            profil: compte.email,
            chemin: ecran.chemin,
            detail: `ecran non autorise mais accessible (${url})`,
          });
        }
      }

      verifications += 1;
    }

    await contexte.close();
  }

  return { anomalies, verifications };
};

// Pour chaque module, l'ecran corresponding. Le test attribue a un
// employe le seul droit de lecture de ce module : l'ecran doit alors
// afficher ses donnees. C'est le cas qui avait ete decouvert sur les
// plans : un droit manquant sur une liste annexe ne doit pas condamner
// l'ecran principal.
const DROITS_ECRANS = [
  { module: "EMPLOYEES", ecrans: [{ chemin: "/employees", contenu: "cartes" }] },
  { module: "CLIENT", ecrans: [{ chemin: "/client", contenu: "cartes" }] },
  { module: "VESSELS", ecrans: [{ chemin: "/ship", contenu: "cartes" }] },
  { module: "PORTS", ecrans: [{ chemin: "/ports", contenu: "cartes" }] },
  { module: "VOYAGES", ecrans: [{ chemin: "/voyages", contenu: "cartes" }] },
  {
    module: "LOADING_PLANS",
    ecrans: [
      { chemin: "/plans", contenu: "cartes" },
      { chemin: "/plans/load/PLAN", contenu: "cartes" },
      { chemin: "/plans/unload/PLAN", contenu: "cartes" },
    ],
  },
  { module: "ENTREPOTS", ecrans: [{ chemin: "/warehouse", contenu: "cartes" }] },
  { module: "USERS", ecrans: [{ chemin: "/users", contenu: "cartes" }] },
  { module: "MODULE", ecrans: [{ chemin: "/module", contenu: "cartes" }] },
  {
    module: "COMPANY_STRUCTURE",
    ecrans: [{ chemin: "/company-structure", contenu: "titres" }],
  },
];

// Un employe de test, cree pour le passage puis supprime : les demandes
// d'acces du jeu de demonstration ne sont pas consommees.
const creerEmployeDeTest = async (entetes) => {
  const structure = await (
    await fetch(`${RACINE}/api/v1/company-structure`, { headers: entetes })
  ).json();
  const departement = structure?.data?.structure?.[0];
  const poste = departement?.positions?.[0];
  if (!departement || !poste) return null;

  const protection = await csrf();
  const reponse = await fetch(`${RACINE}/api/v1/employees`, {
    method: "POST",
    headers: {
      ...entetes,
      "Content-Type": "application/json",
      "X-CSRF-Token": protection.token,
      Cookie: `xsrf-token=${protection.cookie}`,
    },
    body: JSON.stringify({
      name: "TEST PARCOURS",
      email: `test.parcours@exemple.mg`,
      departmentId: departement.id,
      positionId: poste.id,
    }),
  });
  if (!reponse.ok) return null;
  return (await reponse.json())?.data?.employee || null;
};

const supprimerEmployeDeTest = async (entetes, id) => {
  const protection = await csrf();
  await fetch(`${RACINE}/api/v1/employees/${id}`, {
    method: "DELETE",
    headers: {
      ...entetes,
      "X-CSRF-Token": protection.token,
      Cookie: `xsrf-token=${protection.cookie}`,
    },
  });
};

// Un compte de deduction : il ne peut lire que le module indique, ni les
// clients ni les voyages ni les autres modules. Le compte est cree sur un
// employe de test, puis supprime : le jeu retrouve son etat.
const verifierCompteRestreint = async (navigateur, references, droit, employe) => {
  const anomalies = [];

  const jetonAdmin = await jetonAdministrateur();
  const entetes = { Authorization: `Bearer ${jetonAdmin}` };

  if (!employe) {
    anomalies.push({
      profil: "(employe de test)",
      chemin: `(ouverture du compte ${droit.module})`,
      detail: "l'employe de test n'a pas pu etre cree",
    });
    return anomalies;
  }

  const protection = await csrf();
  const corps = JSON.stringify({
    password: "Deduit@2026",
    permissions: [{ module: droit.module, action: "READ" }],
  });
  const reponseAcces = await fetch(
    `${RACINE}/api/v1/users/${employe.id}/access`,
    {
      method: "POST",
      headers: {
        ...entetes,
        "Content-Type": "application/json",
        "X-CSRF-Token": protection.token,
        Cookie: `xsrf-token=${protection.cookie}`,
      },
      body: corps,
    },
  );

  if (!reponseAcces.ok) {
    anomalies.push({
      profil: employe.matricule,
      chemin: `(ouverture du compte ${droit.module})`,
      detail: `impossible d'accorder l'acces : ${reponseAcces.status}`,
    });
    await supprimerEmployeDeTest(entetes, employe.id);
    return anomalies;
  }

  try {
    const contexte = await navigateur.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
      deviceScaleFactor: 2,
      serviceWorkers: "block",
      locale: "fr-FR",
    });
    const page = await contexte.newPage();

    await page.goto(`${RACINE}/login`, { waitUntil: "domcontentloaded" });
    await page.locator('input[type="text"]').first().fill(employe.matricule);
    await page.locator('input[type="password"]').first().fill("Deduit@2026");
    await page.getByRole("button", { name: "Se connecter" }).click();
    await page.waitForURL(/dashboard/, { timeout: 20000 });

    for (const ecran of droit.ecrans) {
      const chemin = ecran.chemin.replace(
        "/plans/load/PLAN",
        references.find((r) => r.operationType === "LOAD")
          ? `/plans/load/${references.find((r) => r.operationType === "LOAD").reference}`
          : "/plans",
      ).replace(
        "/plans/unload/PLAN",
        references.find((r) => r.operationType === "UNLOAD")
          ? `/plans/unload/${references.find((r) => r.operationType === "UNLOAD").reference}`
          : "/plans",
      );

      await page.goto(`${RACINE}${chemin}`, { waitUntil: "networkidle" });
      await page.waitForTimeout(800);

      let texte = "";
      try {
        texte = await page.locator("main").innerText({ timeout: 8000 });
      } catch {
        texte = await page.locator("body").innerText();
      }

      const refus = /Vous n'avez pas la permission/i.test(texte);
      const erreur = /^Erreur$/m.test(texte);
      let elements = 0;
      if (ecran.contenu === "cartes") {
        elements = await page
          .locator("main .md\\:hidden > *:visible")
          .count();
        if (elements === 0) {
          elements = await page.locator("main table tbody tr:visible").count();
        }
      } else if (ecran.contenu === "titres") {
        elements = await page.locator("main h3:visible").count();
      }

      if (refus || erreur || elements === 0) {
        anomalies.push({
          profil: `${employe.matricule} (${droit.module} seulement)`,
          chemin,
          detail: refus
            ? "la page affiche un refus de droit alors que le compte a le droit de lecture"
            : erreur
              ? "la page affiche un bandeau d'erreur"
              : "la page n'affiche aucune donnee de sa liste",
        });
      }
    }

    await contexte.close();
  } finally {
    // L'acces est retire : l'employe de test retrouve son etat d'attente.
    const protection = await csrf();
    await fetch(`${RACINE}/api/v1/users/${employe.id}/access`, {
      method: "DELETE",
      headers: {
        ...entetes,
        "X-CSRF-Token": protection.token,
        Cookie: `xsrf-token=${protection.cookie}`,
      },
    });
  }

  return anomalies;
};

const executer = async () => {
  // Le parcours complet envoie plusieurs centaines de requetes : un
  // limiteur global trop bas le couperait en cours de route.
  try {
    const sante = await fetch(`${RACINE}/api/v1/health`);
    const volume = Number(sante.headers.get("ratelimit-limit") || 0);
    if (volume && volume < 800) {
      console.log(
        `ATTENTION : le limiteur global est a ${volume} requetes par quart d'heure. ` +
          "Le parcours complet demande RATE_LIMIT_MAX=5000 sur l'environnement conteneurise.",
      );
    }
  } catch {
    // Le controle est un avertissement, pas une condition d'execution.
  }

  const navigateur = await chromium.launch({ channel: "chrome", headless: true });

  let bureau;
  let mobile;
  let anomaliesProfils;
  let comptes = [];
  let references = [];
  let resultatMatrice = { anomalies: [], verifications: 0 };
  let resultatDeduction = [];
  try {
    bureau = await parcourir(navigateur, PROFILS.bureau);
    mobile = await parcourir(navigateur, PROFILS.mobile);
    anomaliesProfils = await verifierProfils(navigateur);
    const lus = await comptesDepuisLApi();
    comptes = lus.comptes;
    references = lus.references;
    resultatMatrice = await verifierComptes(navigateur, comptes, references);

    // Un employe de test sert a tous les comptes de deduction : il est
    // supprime a la fin, le jeu de demonstration n'est pas altere.
    const jetonAdmin = await jetonAdministrateur();
    const entetesAdmin = { Authorization: `Bearer ${jetonAdmin}` };
    const employeDeTest = await creerEmployeDeTest(entetesAdmin);

    for (const droit of DROITS_ECRANS) {
      const anomaliesDroit = await verifierCompteRestreint(
        navigateur,
        references,
        droit,
        employeDeTest,
      );
      resultatDeduction = resultatDeduction.concat(anomaliesDroit);
      if (anomaliesDroit.length === 0) {
        console.log(`  ${droit.module} : ecran conforme avec ce seul droit`);
      }
    }

    if (employeDeTest) {
      await supprimerEmployeDeTest(entetesAdmin, employeDeTest.id);
    }
  } finally {
    await navigateur.close();
  }

  const parEcran = new Map(bureau.map((r) => [r.ecran, r]));
  let anomalies = 0;

  console.log("ecran              total  cartes  titre");
  console.log("---------------------------------------------------");

  for (const resultat of mobile) {
    const reference = parEcran.get(resultat.ecran);
    const problems = [];

    if (resultat.liste) {
      // Sur telephone, les cartes remplacent le tableau : leur nombre doit
      // etre le total annonce par la pagination du tableau, releve sur la
      // version bureau (la pagination est masquee sur petit ecran).
      if (reference.totalTableau === null) {
        problems.push("pagination du tableau introuvable");
      } else if (resultat.cartes !== reference.totalTableau) {
        problems.push(
          `${resultat.cartes} cartes pour ${reference.totalTableau} elements dans le tableau`,
        );
      }
      if (
        reference.totalTableau !== null &&
        reference.totalTableau < resultat.minimum
      ) {
        problems.push(
          `donnees insuffisantes : ${reference.totalTableau} pour un minimum de ${resultat.minimum}`,
        );
      }
    } else {
      // Ecrans sans liste : le contenu doit etre present dans les deux
      // formats.
      if (resultat.titres !== reference.titres) {
        problems.push(
          `contenu different : ${reference.titres} blocs sur bureau, ${resultat.titres} sur telephone`,
        );
      }
      if (resultat.titres === 0 && resultat.cartes === 0) {
        problems.push("aucun contenu affiche");
      }
    }

    if (resultat.titre.length === 0) problems.push("titre de page absent");
    problems.push(
      ...resultat.erreursConsole.map((e) => `erreur console : ${e}`),
      ...resultat.appelsEnEchec.map((e) => `appel en echec : ${e}`),
    );

    console.log(
      `${resultat.ecran.padEnd(18)} ${String(reference.totalTableau ?? "-").padStart(5)}  ${String(resultat.cartes).padStart(7)}  ${resultat.titre}`,
    );
    if (problems.length > 0) {
      anomalies += 1;
      console.log(`   ANOMALIE : ${problems.join(" | ")}`);
    }
  }

  console.log("---------------------------------------------------");
  if (anomalies === 0) {
    console.log("Tous les ecrans sont conformes, dans les deux formats.");
  } else {
    console.log(`${anomalies} ecran(s) presentent une anomalie.`);
  }

  console.log("\n== Profils restreints ==");
  if (anomaliesProfils.length === 0) {
    console.log(
      "Chaque compte consulte les ecrans qui le concernent, sans refus de droit.",
    );
  } else {
    for (const anomalie of anomaliesProfils) {
      console.log(
        `ANOMALIE ${anomalie.profil} sur ${anomalie.chemin} : ${anomalie.detail}`,
      );
    }
    console.log(`\n${anomaliesProfils.length} anomalie(s) sur les profils restreints.`);
  }

  console.log("\n== Matrice des comptes et des ecrans ==");
  console.log(
    `${resultatMatrice.verifications} verifications (${comptes.length} comptes x ${ECRANS.length + references.length} ecrans)`,
  );
  if (resultatMatrice.anomalies.length === 0) {
    console.log(
      "Chaque compte voit ses ecrans, et seulement eux : aucun refus de droit, aucune erreur.",
    );
  } else {
    for (const anomalie of resultatMatrice.anomalies) {
      console.log(
        `ANOMALIE ${anomalie.profil} sur ${anomalie.chemin} : ${anomalie.detail}`,
      );
    }
    console.log(`\n${resultatMatrice.anomalies.length} anomalie(s).`);
  }

  console.log("\n== Un droit de lecture par module ==");
  if (resultatDeduction.length === 0) {
    console.log(
      "Chaque module, avec son seul droit de lecture, affiche ses donnees.",
    );
  } else {
    for (const anomalie of resultatDeduction) {
      console.log(
        `ANOMALIE ${anomalie.profil} sur ${anomalie.chemin} : ${anomalie.detail}`,
      );
    }
    console.log(`\n${resultatDeduction.length} anomalie(s).`);
  }

  console.log("\nCaptures : e2e/captures/mobile et e2e/captures/bureau");

  process.exit(
    anomalies === 0 &&
      anomaliesProfils.length === 0 &&
      resultatMatrice.anomalies.length === 0 &&
      resultatDeduction.length === 0
      ? 0
      : 1,
  );
};

executer().catch((erreur) => {
  console.error(erreur);
  process.exit(1);
});

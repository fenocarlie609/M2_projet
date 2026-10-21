// test/permissions/audit-avatar.mjs
// Verification ciblee : le televersement d'avatar ne doit pas permettre
// d'ecraser l'avatar d'un autre employe.
//
// Le parcours tente d'ecrire l'avatar d'un matricule qui n'appartient pas
// au compte connecte. Un compte sans droit sur le module EMPLOYEES doit
// etre refuse ; un compte administre peut le faire. Les tentatives
// refusees n'ecrivent aucun fichier.
const RACINE = process.env.APP_URL || "http://localhost:5000/api/v1";
const MOT_DE_PASSE = process.env.APP_MOT_DE_PASSE || "Demo@2026";
const MOT_DE_PASSE_ADMIN =
  process.env.APP_MOT_DE_PASSE_ADMIN || "Admin@2026";

// Un PNG valide de 1x1 pixel.
const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);

const extraire = (reponse, nom) => {
  const brut = reponse.headers.getSetCookie ? reponse.headers.getSetCookie() : [];
  const trouve = brut.find((c) => c.startsWith(`${nom}=`));
  return trouve ? decodeURIComponent(trouve.split("=")[1].split(";")[0]) : null;
};

const connecter = async (identifiant, motDePasse) => {
  const reponse = await fetch(`${RACINE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier: identifiant, password: motDePasse }),
  });
  const signe = extraire(reponse, "token");
  const jeton = signe.slice(2, signe.lastIndexOf("."));
  const reponseCsrf = await fetch(`${RACINE}/auth/csrf-token`);
  const csrf = await reponseCsrf.json();
  return {
    jeton,
    csrf: csrf?.data?.csrfToken,
    cookie: extraire(reponseCsrf, "xsrf-token"),
  };
};

const televerser = async (session, matricule) => {
  const formulaire = new FormData();
  formulaire.append("avatar", new Blob([PNG], { type: "image/png" }), "a.png");
  formulaire.append("matricule", matricule);
  const reponse = await fetch(`${RACINE}/uploads/avatar`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${session.jeton}`,
      "X-CSRF-Token": session.csrf,
      Cookie: `xsrf-token=${session.cookie}`,
    },
    body: formulaire,
  });
  return { statut: reponse.status, texte: (await reponse.text()).slice(0, 160) };
};

const cas = [
  {
    nom: "agent de quai, sans droit sur les employes",
    identifiant: "f.rajaonarison@lct.mg",
    motDePasse: MOT_DE_PASSE,
    attendu: 403,
  },
  {
    nom: "assistante administrative, droit de creation seul",
    identifiant: "l.andriamanarivo@lct.mg",
    motDePasse: MOT_DE_PASSE,
    attendu: 403,
  },
  {
    nom: "responsable des ressources humaines",
    identifiant: "t.rabemananarisoa@lct.mg",
    motDePasse: MOT_DE_PASSE,
    attendu: 201,
  },
  {
    nom: "administrateur",
    identifiant: "admin@lct.mg",
    motDePasse: MOT_DE_PASSE_ADMIN,
    attendu: 201,
  },
];

// Le matricule vise appartient a un employe existant : l'ecriture de son
// avatar exige le droit de modification des employes, la creation d'un
// avatar pour un matricule inconnu exige le droit de creation.
const MATRICULE_CIBLE = "FINA-FINA-01";

let anomalies = 0;

for (const test of cas) {
  const session = await connecter(test.identifiant, test.motDePasse);
  const reponse = await televerser(session, MATRICULE_CIBLE);
  const conforme = reponse.statut === test.attendu;
  if (!conforme) anomalies += 1;
  console.log(
    `${conforme ? "ok      " : "ANOMALIE"} ${test.nom} : ${reponse.statut} ${reponse.texte}`,
  );
}

console.log(
  anomalies === 0
    ? "\nLe televersement d'avatar respecte la regle : soi-meme, ou droit sur les employes."
    : `\n${anomalies} anomalie(s).`,
);

process.exit(anomalies === 0 ? 0 : 1);

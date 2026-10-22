// prisma/seeds/02_employes.js
// Employes, acces a l'application et permissions.
//
// Les employes sont embauches sur dix-huit mois : le jeu donne l'impression
// d'une companye en exploitation. Les employes qui n'ont pas d'acces
// illustrent le circuit de demande d'acces.
const { employes } = require("./donnees");
const { hashPassword } = require("../../src/common/utils/password.utils");

const MOT_DE_PASSE = "Demo@2026";
const MOT_DE_PASSE_ADMIN = "Admin@2026";

/**
 * Matricule au format DEPT-POSTE-INDEX, identique a celui produit par le
 * module employes.
 */
function genererMatricule(departement, poste, occupes) {
  const code = (brut) =>
    String(brut)
      .replace(/[^a-zA-Z0-9]/g, "")
      .substring(0, 4)
      .toUpperCase();

  const prefixe = `${code(departement)}-${code(poste)}-`;
  let index = 1;
  let candidat = `${prefixe}${String(index).padStart(2, "0")}`;
  while (occupes.has(candidat)) {
    index += 1;
    candidat = `${prefixe}${String(index).padStart(2, "0")}`;
  }
  occupes.add(candidat);
  return candidat;
}

async function run(prisma) {
  const occupes = new Set(
    (await prisma.employee.findMany({ select: { matricule: true } })).map(
      (e) => e.matricule,
    ),
  );

  const employesCrees = new Map();

  for (const donnees of employes) {
    const departement = await prisma.department.findUnique({
      where: { code: donnees.department },
    });
    const poste = await prisma.position.findFirst({
      where: { code: donnees.position, departmentId: departement.id },
    });

    const existant = await prisma.employee.findFirst({
      where: {
        OR: [
          { email: donnees.email },
          // Un employe dont l'adresse a ete effacee (revocation d'acces)
          // reste reconnaissable a son nom : le jeu doit pouvoir etre
          // rejoue sur n'importe quel etat.
          { email: null, name: donnees.name },
        ],
      },
    });
    const matricule = existant
      ? existant.matricule
      : genererMatricule(donnees.department, donnees.position, occupes);

    const motDePasse = donnees.wildcard
      ? await hashPassword(MOT_DE_PASSE_ADMIN)
      : await hashPassword(MOT_DE_PASSE);

    const donneesCommunes = {
      name: donnees.name,
      email: donnees.email,
      cin: donnees.cin,
      phone: donnees.phone,
      matricule,
      hasAppAccess: donnees.acces,
      isActive: donnees.acces,
      password: motDePasse,
      departmentId: departement.id,
      positionId: poste.id,
      deletedAt: null,
    };

    // L'employe est mis a jour s'il existe deja, cree sinon : le jeu
    // peut ainsi etre rejoue apres une revocation d'acces, qui laisse
    // l'adresse vide.
    const employe = existant
      ? await prisma.employee.update({
          where: { id: existant.id },
          data: donneesCommunes,
        })
      : await prisma.employee.create({
          data: {
            ...donneesCommunes,
            createdAt: donnees.embauche,
            updatedAt: donnees.embauche,
          },
        });

    // Les permissions sont reecrites : le catalogue doit toujours decrire
    // l'etat voulu, sans accumulation.
    await prisma.employeePermission.deleteMany({
      where: { employeeId: employe.id },
    });

    const permissions = donnees.wildcard
      ? [["*", "*"]]
      : donnees.permissions || [];

    for (const [module, action] of permissions) {
      await prisma.employeePermission.create({
        data: { employeeId: employe.id, module, action },
      });
    }

    employesCrees.set(donnees.key, employe);
  }

  const avecAcces = employes.filter((e) => e.acces).length;
  console.log(
    `   employes : ${employes.length} fiches, ${avecAcces} avec acces, ` +
      `${employes.length - avecAcces} en attente d'acces`,
  );

  return employesCrees;
}

module.exports = { run, MOT_DE_PASSE, MOT_DE_PASSE_ADMIN };

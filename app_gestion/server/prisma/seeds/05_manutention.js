// prisma/seeds/05_manutention.js
// Plans de manutention : plans de chargement, lignes de marchandises et
// plans de dechargement.
//
// Le cycle decrit par le jeu correspond a celui de l'application :
//   - un plan de chargement porte les marchandises embarquees sur un quai ;
//   - sa validation genere un plan de dechargement, dont les lignes passent
//     de PENDING a LOADED au fur et a mesure du dechargement ;
//   - la validation du plan de dechargement clot le cycle.
//
// La position d'une marchandise designe le quai de chargement a Toamasina.
const { jours, marchandises } = require("./donnees");
const { Prisma } = require("../../src/generated/prisma");

const CONVOYEURS = [
  { nom: "RAKOTO Bevis", plaque: "4821 TBA 12" },
  { nom: "JIMMY Toky", plaque: "7734 TBA 08" },
  { nom: "RAJAONARISON Fetra", plaque: "1190 TBA 45" },
];

// Marchandises transportees par voyage : le plan est etabli trois jours
// avant le depart.
const cargaisons = {
  cafe: ["ETS RAKOTOVOINTSAKA"],
  vanille: ["COOPERATIVE DES PRODUCTEURS DE VANILLE"],
  girofle: ["ETS TANAMASOA EXPORT"],
  poivre: ["ETS TANAMASOA EXPORT", "RAKOTONIRINA Fanja"],
  litchis: ["COOP LITCHIS DE TAMATAVE"],
  sisal: ["ETS SAVA BIO"],
  sesame: ["ETS SAVA BIO", "RAHARIMALALA Hanta"],
  huile: ["ETS ANDRIANARISOA FILIERE"],
  mangue: ["RANDRIANARISOA Toky", "ETS TANA AGRUMES"],
  conteneur: ["SOCIETE GENERALE DE TRANSPORT MARITIME"],
};

/**
 * Composition du plan d'un voyage : une ou deux marchandises par plan,
 * choisies pour que chaque client apparaisse regulierement.
 */
function cargaisonsDuVoyage(index) {
  const liste = Object.keys(cargaisons);
  const premiere = liste[index % liste.length];
  const seconde = liste[(index * 3 + 2) % liste.length];

  const retenues = [premiere];
  if (index % 3 === 0) retenues.push(seconde);

  return retenues.map((type) => ({
    type,
    clients: cargaisons[type],
  }));
}

async function run(prisma, { voyages, clientsCrees, employesCrees }) {
  const agentQuai = employesCrees.get("quay");
  const agentQuai2 = employesCrees.get("quay2");
  const coordinateur = employesCrees.get("coordinator");

  const plansCrees = [];

  for (let index = 0; index < voyages.length; index += 1) {
    const voyage = voyages[index];
    const reference = `PL-${voyage.reference.replace("VYG-", "")}`;

    const termine = voyage.statut === "ARRIVED";
    const enCours = voyage.statut === "IN_TRANSIT";
    const aVenir = voyage.statut === "SCHEDULED";

    // Les deux derniers voyages n'ont pas encore de plan : le travail
    // d'ordonnancement n'est pas fait.
    if (aVenir && index >= voyages.length - 2) continue;

    const cargaisonsPlan = cargaisonsDuVoyage(index);
    const lignes = [];

    for (const cargaison of cargaisonsPlan) {
      const modele = marchandises[cargaison.type];
      const clientNom = cargaison.clients[index % cargaison.clients.length];
      const client = clientsCrees.get(clientNom);
      if (!client) continue;

      const facteur = 0.7 + ((index % 5) * 0.15);
      const colis = Math.max(1, Math.round(modele.colis * facteur));
      const poids = colis * modele.poidsParColis;
      const convoyeur = CONVOYEURS[index % CONVOYEURS.length];

      // Sur un voyage termine, la marchandise est chargee et le poids est
      // connu. Sur un voyage en cours, une partie du chargement est encore en
      // attente : c'est ce que l'agent de quai doit confirmer.
      const statut = termine || enCours ? "LOADED" : "PENDING";
      const anomalie =
        !termine && !enCours && index % 2 === 0
          ? "Poids à confirmer au pesage"
          : null;

      lignes.push({
        clientId: client.id,
        description: modele.description,
        packageCount: colis,
        weightKg: poids,
        loadingPosition: modele.quai,
        isHazardous: Boolean(modele.dangereux),
        status: statut,
        anomaly: anomalie,
        driverName: convoyeur.nom,
        vehiclePlate: convoyeur.plaque,
        // Une marchandise non encore chargee n'a pas de date de chargement.
        loadingDate: statut === "LOADED" ? jours(voyage.departJours - 1) : null,
        loadedById: index % 2 === 0 ? agentQuai.id : agentQuai2.id,
      });
    }

    const poidsTotal = lignes
      .filter((ligne) => ligne.status !== "CANCELLED")
      .reduce((total, ligne) => total + ligne.weightKg, 0);

    // Un plan de chargement d'un voyage termine ou en cours est valide : les
    // marchandises sont a bord. Un plan programme ne l'est pas encore.
    const planValide = termine || enCours;

    const plan = await prisma.loadingPlan.upsert({
      where: { reference },
      update: {
        voyageId: voyage.voyage.id,
        status: planValide,
        operationType: "LOAD",
        totalWeightKg: poidsTotal,
        validatedAt: planValide ? jours(voyage.departJours - 1) : null,
        validatedById: planValide ? coordinateur.id : null,
      },
      create: {
        reference,
        voyageId: voyage.voyage.id,
        status: planValide,
        operationType: "LOAD",
        totalWeightKg: poidsTotal,
        validatedAt: planValide ? jours(voyage.departJours - 1) : null,
        validatedById: planValide ? coordinateur.id : null,
        // Un plan ne peut pas etre enregistre dans le futur : pour un
        // voyage programme, la saisie est datee d'hier.
        createdAt: jours(Math.min(voyage.departJours - 5, -1)),
        updatedAt: jours(Math.min(voyage.departJours - 1, -1)),
      },
    });

    await prisma.load.deleteMany({ where: { loadingPlanId: plan.id } });
    if (lignes.length > 0) {
      await prisma.load.createMany({
        data: lignes.map((ligne) => ({
          ...ligne,
          loadingPlanId: plan.id,
          weightKg: new Prisma.Decimal(String(ligne.weightKg)),
        })),
      });
    }

    const entree = {
      plan,
      lignes,
      planDechargement: null,
      lignesDechargement: [],
      voyage,
      reference,
      poidsTotal,
      planValide,
      dechargeValide: false,
    };

    // Le plan de dechargement n'existe que pour un plan de chargement
    // valide : il est genere par l'application a la validation.
    if (!planValide) {
      plansCrees.push(entree);
      continue;
    }

    const referenceDechargement = `DECH-${reference}`;
    const dechargeValide = termine;

    const planDechargement = await prisma.loadingPlan.upsert({
      where: { reference: referenceDechargement },
      update: {
        voyageId: voyage.voyage.id,
        status: dechargeValide,
        operationType: "UNLOAD",
        totalWeightKg: poidsTotal,
        validatedAt: dechargeValide ? voyage.arrivee : null,
        validatedById: dechargeValide ? coordinateur.id : null,
        sourceLoadingPlanId: plan.id,
      },
      create: {
        reference: referenceDechargement,
        voyageId: voyage.voyage.id,
        status: dechargeValide,
        operationType: "UNLOAD",
        totalWeightKg: poidsTotal,
        validatedAt: dechargeValide ? voyage.arrivee : null,
        validatedById: dechargeValide ? coordinateur.id : null,
        sourceLoadingPlanId: plan.id,
        createdAt: jours(Math.min(voyage.departJours - 1, -1)),
        updatedAt: dechargeValide ? voyage.arrivee : jours(-1),
      },
    });

    await prisma.load.deleteMany({ where: { loadingPlanId: planDechargement.id } });
    await prisma.load.createMany({
      data: lignes.map((ligne) => ({
        clientId: ligne.clientId,
        description: ligne.description,
        packageCount: ligne.packageCount,
        weightKg: new Prisma.Decimal(String(ligne.weightKg)),
        loadingPosition: ligne.loadingPosition,
        isHazardous: ligne.isHazardous,
        status: dechargeValide ? "LOADED" : "PENDING",
        anomaly: null,
        driverName: null,
        vehiclePlate: null,
        loadingDate: null,
        loadedById: null,
        loadingPlanId: planDechargement.id,
      })),
    });

    // Les lignes de dechargement sont relues : l'entrepot s'y refere pour
    // savoir d'ou vient chaque marchandise.
    const lignesDechargement = await prisma.load.findMany({
      where: { loadingPlanId: planDechargement.id, deletedAt: null },
      orderBy: { description: "asc" },
    });

    entree.lignesDechargement = lignesDechargement;
    entree.planDechargement = planDechargement;
    entree.dechargeValide = dechargeValide;
    plansCrees.push(entree);
  }
  const totalLignes = await prisma.load.count({ where: { deletedAt: null } });

  console.log(
    `   manutention : ${plansCrees.length} plans de chargement, ` +
      `${totalLignes} lignes de marchandises`,
  );

  return plansCrees;
}

module.exports = { run };

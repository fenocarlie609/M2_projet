// prisma/seeds/06_entrepot.js
// Entrepots, marchandises en stock et trace des mouvements.
//
// Les marchandises en entrepot proviennent de plans de dechargement valides :
// elles attendent soit le retrait par leur client, soit leur reembarquement
// sur un voyage a venir.
const { jours } = require("./donnees");
const { Prisma } = require("../../src/generated/prisma");

const entrepots = [
  {
    code: "ANT-01",
    name: "Dépôt d'Antananarivo",
    address: "Zone industrielle Vondrozo, Lot 118",
    city: "Antananarivo",
    capacityTons: 500,
  },
  {
    code: "TMM-01",
    name: "Dépôt portuaire de Toamasina",
    address: "Quai 3, Entrepôt C",
    city: "Toamasina",
    capacityTons: 1200,
  },
];

async function run(prisma, { plansCrees, clientsCrees, employesCrees }) {
  const entrepotsCrees = [];
  for (const entrepot of entrepots) {
    const cree = await prisma.warehouse.upsert({
      where: { code: entrepot.code },
      update: entrepot,
      create: entrepot,
    });
    entrepotsCrees.push(cree);
  }

  const agent = employesCrees.get("tech");
  const coordinateur = employesCrees.get("coordinator");

  // Seuls les plans de dechargement valides alimentent l'entrepot. On
  // retient les derniers : le stock est recent, ce qui est coherent avec une
  // exploitation quotidienne.
  const plansDebouches = plansCrees
    .filter((p) => p.voyage.statut === "ARRIVED" && p.planValide)
    .slice(-4);

  const articlesCrees = [];
  let compteur = 0;

  for (const plan of plansDebouches) {
    const entrepot = entrepotsCrees[plan.voyage.reference.length % entrepotsCrees.length];

    for (const ligne of plan.lignesDechargement) {
      compteur += 1;
      const reference = `STK-${plan.reference.replace("PL-", "")}-${String(compteur).padStart(3, "0")}`;

      const existant = await prisma.warehouseItem.findUnique({
        where: { reference },
      });
      if (existant) {
        articlesCrees.push(existant);
        continue;
      }

      const arrivee = plan.voyage.arrivee;

      const article = await prisma.warehouseItem.create({
        data: {
          reference,
          warehouseId: entrepot.id,
          clientId: ligne.clientId,
          // La marchandise garde la trace de la ligne de dechargement dont
          // elle provient : l'application refuse une entree sans cette
          // provenance.
          loadId: ligne.id,
          description: ligne.description,
          packageCount: ligne.packageCount,
          weightKg: new Prisma.Decimal(String(ligne.weightKg)),
          status: "IN_STOCK",
          arrivalDate: arrivee,
        },
      });

      await prisma.warehouseMovement.create({
        data: {
          itemId: article.id,
          warehouseId: entrepot.id,
          employeeId: agent.id,
          type: "ENTRY",
          note: `Déchargement du navire ${plan.voyage.reference}`,
          createdAt: arrivee,
        },
      });

      articlesCrees.push(article);
    }
  }

  // Une marchandise retiree par son client, et une marchandise
  // reembarquee sur le voyage en cours : les deux sorties du cycle.
  const sortants = [];
  for (const article of articlesCrees) {
    sortants.push(article);
  }

  if (sortants.length > 0) {
    const retiree = sortants[0];
    await prisma.warehouseItem.update({
      where: { id: retiree.id },
      data: {
        status: "PICKED_UP",
        departureDate: jours(-2),
        departureReason: "PICKUP",
      },
    });
    await prisma.warehouseMovement.create({
      data: {
        itemId: retiree.id,
        warehouseId: retiree.warehouseId,
        employeeId: coordinateur.id,
        type: "PICKUP",
        note: "Retrait par le client",
        createdAt: jours(-2),
      },
    });
  }

  if (sortants.length > 1) {
    const reembarquee = sortants[1];
    await prisma.warehouseItem.update({
      where: { id: reembarquee.id },
      data: {
        status: "EMBARKED",
        departureDate: jours(-1),
        departureReason: "RE_EMBARKMENT",
      },
    });
    await prisma.warehouseMovement.create({
      data: {
        itemId: reembarquee.id,
        warehouseId: reembarquee.warehouseId,
        employeeId: coordinateur.id,
        type: "RE_EMBARKMENT",
        note: "Réembarquement sur le prochain voyage",
        createdAt: jours(-1),
      },
    });
  }

  const mouvements = await prisma.warehouseMovement.count();

  console.log(
    `   entrepot : ${entrepotsCrees.length} depots, ` +
      `${articlesCrees.length} marchandises, ${mouvements} mouvements`,
  );

  return articlesCrees;
}

module.exports = { run };

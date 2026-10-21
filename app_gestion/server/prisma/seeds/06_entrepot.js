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
  // Quai de chargement de chaque marchandise : elle le conserve lorsqu'elle
  // est reembarquee.
  const quaisParArticle = new Map();
  let compteur = 0;

  for (const plan of plansDebouches) {
    const entrepot = entrepotsCrees[plan.voyage.reference.length % entrepotsCrees.length];

    for (const ligne of plan.lignesDechargement) {
      compteur += 1;
      const reference = `STK-${plan.reference.replace("PL-", "")}-${String(compteur).padStart(3, "0")}`;
      const arrivee = plan.voyage.arrivee;

      const existant = await prisma.warehouseItem.findUnique({
        where: { reference },
      });
      if (existant) {
        // La marchandise existe deja : son etat d'exploitation est conserve
        // (entree, retrait, reembarquement), mais sa provenance est reparee.
        // Sans cela, une marchandise creee par une version anterieure du
        // jeu resterait sans lien vers la ligne de dechargement dont elle
        // est issue.
        const repare = await prisma.warehouseItem.update({
          where: { id: existant.id },
          data: {
            warehouseId: entrepot.id,
            clientId: ligne.clientId,
            loadId: ligne.id,
            description: ligne.description,
            packageCount: ligne.packageCount,
            weightKg: new Prisma.Decimal(String(ligne.weightKg)),
            arrivalDate: arrivee,
          },
        });
        articlesCrees.push(repare);
        quaisParArticle.set(repare.id, ligne.loadingPosition);
        continue;
      }

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
      quaisParArticle.set(article.id, ligne.loadingPosition);
    }
  }

  // Une marchandise retiree par son client, et une marchandise
  // reembarquee sur le voyage en cours : les deux sorties du cycle.
  // Les marchandises sont classees par reference et non dans l'ordre de
  // lecture : deux marchandises peuvent porter la meme description, et
  // l'ordre de la base n'est alors pas garanti. Le choix des sorties doit
  // rester le meme a chaque execution.
  const sortants = [...articlesCrees].sort((a, b) =>
    a.reference.localeCompare(b.reference),
  );

  // Un mouvement n'est enregistre qu'une fois : rejouer le jeu ne doit pas
  // multiplier la trace des entrees et des sorties.
  const mouvementDejaTrace = async (itemId, type) =>
    (await prisma.warehouseMovement.count({ where: { itemId, type } })) > 0;

  // Une sortie de chaque nature, au total : le jeu ne retire qu'une
  // marchandise et n'en reembarque qu'une.
  const sortieDejaTracee = async (type) =>
    (await prisma.warehouseMovement.count({ where: { type } })) > 0;

  if (sortants.length > 0 && !(await sortieDejaTracee("PICKUP"))) {
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

  if (sortants.length > 1 && !(await sortieDejaTracee("RE_EMBARKMENT"))) {
    const reembarquee = sortants[1];

    // Le reembarquement porte sur un plan de chargement d'un voyage a venir :
    // une ligne en attente est creee, comme le fait l'application, et la
    // marchandise y est rattachee.
    const planAVenir = plansCrees.find(
      (p) => !p.planValide && p.plan.operationType === "LOAD",
    );

    if (planAVenir) {
      // La ligne de reembarquement est unique : une marchandise ne peut
      // etre reembarquee qu'une fois.
      const dejaReembarquee = await prisma.load.findFirst({
        where: { stockItemId: reembarquee.id, deletedAt: null },
      });

      if (!dejaReembarquee) {
        await prisma.load.create({
          data: {
            loadingPlanId: planAVenir.plan.id,
            clientId: reembarquee.clientId,
            description: reembarquee.description,
            packageCount: reembarquee.packageCount,
            weightKg: new Prisma.Decimal(String(reembarquee.weightKg)),
            status: "PENDING",
            loadingDate: null,
            driverName: null,
            vehiclePlate: null,
            loadedById: null,
            // La marchandise conserve le quai de chargement d'origine.
            loadingPosition: quaisParArticle.get(reembarquee.id) || null,
            stockItemId: reembarquee.id,
          },
        });

        // Le total du plan tient compte de la ligne ajoutee.
        const poidsPlan = planAVenir.lignes
          .filter((ligne) => ligne.status !== "CANCELLED")
          .reduce(
            (total, ligne) => total + Number(ligne.weightKg || 0),
            0,
          );
        await prisma.loadingPlan.update({
          where: { id: planAVenir.plan.id },
          data: {
            totalWeightKg: new Prisma.Decimal(
              String(poidsPlan + Number(reembarquee.weightKg || 0)),
            ),
          },
        });
      }

      await prisma.warehouseItem.update({
        where: { id: reembarquee.id },
        data: {
          status: "EMBARKED",
          departureDate: jours(-1),
          departureReason: "RE_EMBARKMENT",
        },
      });

      if (!(await mouvementDejaTrace(reembarquee.id, "RE_EMBARKMENT"))) {
        await prisma.warehouseMovement.create({
          data: {
            itemId: reembarquee.id,
            warehouseId: reembarquee.warehouseId,
            employeeId: coordinateur.id,
            type: "RE_EMBARKMENT",
            note: `Réembarquement sur ${planAVenir.plan.reference}`,
            createdAt: jours(-1),
          },
        });
      }
    }
  }

  const mouvements = await prisma.warehouseMovement.count();

  console.log(
    `   entrepot : ${entrepotsCrees.length} depots, ` +
      `${articlesCrees.length} marchandises, ${mouvements} mouvements`,
  );

  return articlesCrees;
}

module.exports = { run };

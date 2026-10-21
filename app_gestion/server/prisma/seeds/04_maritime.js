// prisma/seeds/04_maritime.js
// Referentiel maritime : ports, navires et voyages.
//
// Les voyages couvrent dix-huit mois d'exploitation : les plus anciens sont
// termines, un navire est en route, les suivants sont programmes.
const { ports, navires, jours } = require("./donnees");

// depart et arrivee : nombre de jours par rapport a l'instant de l'execution.
const voyages = [
  { navire: "AZAD", de: "MGTOA", vers: "MGANT", depart: -520, arrivee: -517, statut: "ARRIVED" },
  { navire: "PEX", de: "MGTOA", vers: "MGMAJ", depart: -455, arrivee: -452, statut: "ARRIVED" },
  { navire: "MAR", de: "MGTOA", vers: "MGDIE", depart: -390, arrivee: -386, statut: "ARRIVED" },
  { navire: "AZAD", de: "MGTOA", vers: "MGLU", depart: -325, arrivee: -321, statut: "ARRIVED" },
  { navire: "PEX", de: "MGTOA", vers: "ZADUR", depart: -262, arrivee: -259, statut: "ARRIVED" },
  { navire: "AZAD", de: "MGTOA", vers: "MGMAJ", depart: -200, arrivee: -197, statut: "ARRIVED" },
  { navire: "MAR", de: "MGTOA", vers: "MGANT", depart: -140, arrivee: -137, statut: "ARRIVED" },
  { navire: "PEX", de: "MGTOA", vers: "MGLU", depart: -95, arrivee: -92, statut: "ARRIVED" },
  { navire: "AZAD", de: "MGTOA", vers: "ZADUR", depart: -58, arrivee: -55, statut: "ARRIVED" },
  { navire: "MAR", de: "MGTOA", vers: "MGANT", depart: -30, arrivee: -27, statut: "ARRIVED" },
  { navire: "AZAD", de: "MGTOA", vers: "MGMAJ", depart: -12, arrivee: -9, statut: "ARRIVED" },
  { navire: "PEX", de: "MGTOA", vers: "MGDIE", depart: -3, arrivee: 2, statut: "IN_TRANSIT" },
  { navire: "AZAD", de: "MGTOA", vers: "MGLU", depart: 6, arrivee: 9, statut: "SCHEDULED" },
  { navire: "MAR", de: "MGTOA", vers: "MGMAJ", depart: 13, arrivee: 16, statut: "SCHEDULED" },
  { navire: "PEX", de: "MGTOA", vers: "ZADUR", depart: 21, arrivee: 24, statut: "SCHEDULED" },
  { navire: "AZAD", de: "MGTOA", vers: "MGANT", depart: 34, arrivee: 37, statut: "SCHEDULED" },
];

// Correspondance entre le code du navire du script et la cle de la liste.
const cleNavire = { AZAD: 0, PEX: 1, MAR: 2 };

async function run(prisma) {
  const portsCrees = new Map();
  for (const port of ports) {
    const cree = await prisma.port.upsert({
      where: { code: port.code },
      update: { name: port.name, country: port.country },
      create: port,
    });
    portsCrees.set(port.code, cree);
  }

  const naviresCrees = [];
  for (const navire of navires) {
    const cree = await prisma.vessel.upsert({
      where: { registrationNumber: navire.registrationNumber },
      update: navire,
      create: navire,
    });
    naviresCrees.push(cree);
  }

  // Les voyages sont numerotes par annee de depart, comme dans la pratique.
  const compteurs = new Map();
  const voyagesCrees = [];

  for (const definition of voyages) {
    const depart = jours(definition.depart);
    const annee = depart.getFullYear();
    const numero = String((compteurs.get(annee) || 0) + 1).padStart(3, "0");
    compteurs.set(annee, numero);

    const reference = `VYG-${annee}-${numero}`;
    const navire = naviresCrees[cleNavire[definition.navire]];

    const voyage = await prisma.voyage.upsert({
      where: {
        vesselId_voyageNumber: {
          vesselId: navire.id,
          voyageNumber: reference,
        },
      },
      update: {
        departurePortId: portsCrees.get(definition.de).id,
        arrivalPortId: portsCrees.get(definition.vers).id,
        departureDate: depart,
        arrivalDate: jours(definition.arrivee),
        status: definition.statut,
      },
      create: {
        vesselId: navire.id,
        departurePortId: portsCrees.get(definition.de).id,
        arrivalPortId: portsCrees.get(definition.vers).id,
        voyageNumber: reference,
        departureDate: depart,
        arrivalDate: jours(definition.arrivee),
        status: definition.statut,
        createdAt: jours(definition.depart - 12),
        updatedAt: jours(definition.depart - 12),
      },
    });

    voyagesCrees.push({
      ...definition,
      reference,
      depart,
      departJours: definition.depart,
      arrivee: jours(definition.arrivee),
      arriveeJours: definition.arrivee,
      voyage,
    });
  }

  const termines = voyagesCrees.filter((v) => v.statut === "ARRIVED").length;
  const enCours = voyagesCrees.filter((v) => v.statut === "IN_TRANSIT").length;
  const aVenir = voyagesCrees.filter((v) => v.statut === "SCHEDULED").length;

  console.log(
    `   maritime : ${ports.length} ports, ${navires.length} navires, ` +
      `${voyagesCrees.length} voyages (${termines} termines, ` +
      `${enCours} en cours, ${aVenir} a venir)`,
  );

  return voyagesCrees;
}

module.exports = { run, voyages };

// prisma/seeds/03_clients.js
// Referentiel commercial : clients et adresses.
const { clients, adresses } = require("./donnees");

async function run(prisma) {
  const clientsCrees = new Map();

  for (const donnees of clients) {
    const { contratDepuis, ...champs } = donnees;

    const client = await prisma.client.upsert({
      where: { reference: donnees.reference },
      update: { ...champs, deletedAt: null },
      create: {
        ...champs,
        createdAt: contratDepuis,
        updatedAt: contratDepuis,
      },
    });

    clientsCrees.set(client.name, client);

    const adressesClient = adresses[client.name] || [];
    for (const adresse of adressesClient) {
      const existante = await prisma.clientAddress.findFirst({
        where: { clientId: client.id, label: adresse.label },
      });
      if (existante) {
        await prisma.clientAddress.update({
          where: { id: existante.id },
          data: adresse,
        });
      } else {
        await prisma.clientAddress.create({
          data: { ...adresse, clientId: client.id },
        });
      }
    }
  }

  const totalAdresses = await prisma.clientAddress.count({
    where: { deletedAt: null },
  });

  console.log(
    `   clients : ${clients.length} fiches, ${totalAdresses} adresses`,
  );

  return clientsCrees;
}

module.exports = { run };

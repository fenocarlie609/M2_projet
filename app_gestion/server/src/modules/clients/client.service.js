const { prisma } = require("../../config/database");
const AppError = require("../../common/utils/AppError");

const activeAddressInclude = {
  addresses: {
    where: { deletedAt: null },
    orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
  },
};

const toBasicClient = (client) => {
  if (!client) return null;

  return {
    id: client.id,
    name: client.name,
    type: client.type,
    email: client.email,
    phone: client.phone,
    address: client.addresses?.[0]?.addressLine1 || "",
    createdAt: client.createdAt,
    updatedAt: client.updatedAt,
  };
};

const createClient = async (data) => {
  const { address, ...clientData } = data;
  const client = await prisma.client.create({
    data: {
      ...clientData,
      ...(address
        ? {
            addresses: {
              create: [
                {
                  type: "BOTH",
                  addressLine1: address,
                  country: "Madagascar",
                  isDefault: true,
                },
              ],
            },
          }
        : {}),
    },
    include: activeAddressInclude,
  });

  return toBasicClient(client);
};

const updateClient = async (id, data) => {
  const { address, ...clientData } = data;

  return prisma.$transaction(async (transaction) => {
    await transaction.client.update({ where: { id }, data: clientData });

    if (address !== undefined) {
      const currentAddress = await transaction.clientAddress.findFirst({
        where: { clientId: id, deletedAt: null },
        orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
      });

      if (address) {
        if (currentAddress) {
          await transaction.clientAddress.update({
            where: { id: currentAddress.id },
            data: { addressLine1: address, isDefault: true },
          });
        } else {
          await transaction.clientAddress.create({
            data: {
              clientId: id,
              type: "BOTH",
              addressLine1: address,
              country: "Madagascar",
              isDefault: true,
            },
          });
        }
      } else if (currentAddress) {
        await transaction.clientAddress.update({
          where: { id: currentAddress.id },
          data: { deletedAt: new Date(), isDefault: false },
        });
      }
    }

    const client = await transaction.client.findUnique({
      where: { id },
      include: activeAddressInclude,
    });
    return toBasicClient(client);
  });
};

const deleteClient = async (id) => {
  const client = await prisma.client.findFirst({
    where: { id, deletedAt: null },
  });
  if (!client) throw new AppError("Client non trouvé.", 404);

  // Suppression logique : la fiche et ses adresses restent consultables dans
  // l'historique, comme pour les employes, les voyages et les navires.
  return prisma.$transaction(async (transaction) => {
    await transaction.clientAddress.updateMany({
      where: { clientId: id, deletedAt: null },
      data: { deletedAt: new Date(), isDefault: false },
    });

    return transaction.client.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
  });
};

const getAllClients = async () => {
  const clients = await prisma.client.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
    include: activeAddressInclude,
  });

  return clients.map(toBasicClient);
};

const getClientById = async (id) => {
  const client = await prisma.client.findFirst({
    where: { id, deletedAt: null },
    include: activeAddressInclude,
  });

  if (!client) throw new AppError("Client non trouvé.", 404);

  return toBasicClient(client);
};

module.exports = {
  createClient,
  updateClient,
  deleteClient,
  getAllClients,
  getClientById,
};

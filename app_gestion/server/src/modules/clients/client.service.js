// src/features/client/client.service.js
const { prisma } = require("../../config/database");

const splitClientRelations = (data) => {
  const { addresses, documents, ...clientData } = data;

  return {
    clientData,
    addresses,
    documents,
  };
};

/**
 * Crée un nouveau client.
 */
const createClient = async (data) => {
  const { clientData, addresses, documents } = splitClientRelations(data);

  return await prisma.client.create({
    data: {
      ...clientData,
      ...(addresses ? { addresses: { create: addresses } } : {}),
      ...(documents ? { documents: { create: documents } } : {}),
    },
    include: { addresses: true, documents: true },
  });
};

/**
 * Met à jour un client existant.
 */
const updateClient = async (id, data) => {
  const { clientData, addresses, documents } = splitClientRelations(data);

  return await prisma.$transaction(async (transaction) => {
    return transaction.client.update({
      where: { id },
      data: {
        ...clientData,
        ...(addresses !== undefined
          ? { addresses: { deleteMany: {}, create: addresses } }
          : {}),
        ...(documents !== undefined
          ? { documents: { deleteMany: {}, create: documents } }
          : {}),
      },
      include: { addresses: true, documents: true },
    });
  });
};

/**
 * Supprime définitivement un client (Hard Delete).
 * Note : Le modèle Client n'a pas de champ deletedAt dans le schéma actuel.
 */
const deleteClient = async (id) => {
  return await prisma.client.delete({
    where: { id },
  });
};

/**
 * Récupère tous les clients.
 */
const getAllClients = async () => {
  return await prisma.client.findMany({
    orderBy: { createdAt: "desc" },
    include: { addresses: true, documents: true },
  });
};

/**
 * Récupère un client par son ID.
 */
const getClientById = async (id) => {
  return await prisma.client.findUnique({
    where: { id },
    include: { addresses: true, documents: true },
  });
};

module.exports = {
  createClient,
  updateClient,
  deleteClient,
  getAllClients,
  getClientById,
};

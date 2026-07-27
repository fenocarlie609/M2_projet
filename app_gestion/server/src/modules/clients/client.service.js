// src/features/client/client.service.js
const { prisma } = require("../../config/database");

/**
 * Crée un nouveau client.
 */
const createClient = async (data) => {
  return await prisma.client.create({
    data,
  });
};

/**
 * Met à jour un client existant.
 */
const updateClient = async (id, data) => {
  return await prisma.client.update({
    where: { id },
    data,
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
  });
};

/**
 * Récupère un client par son ID.
 */
const getClientById = async (id) => {
  return await prisma.client.findUnique({
    where: { id },
  });
};

module.exports = {
  createClient,
  updateClient,
  deleteClient,
  getAllClients,
  getClientById,
};

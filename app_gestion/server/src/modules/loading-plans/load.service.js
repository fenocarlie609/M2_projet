const { prisma } = require("../../config/database");
const AppError = require("../../common/utils/AppError");
const { getIO } = require("../../config/socket");
const logger = require("../../config/logger");

/**
 * Difuse les changements de cargaisons/marchandises en temps réel via Socket.IO
 */
const broadcastLoadChange = (action, payload = null) => {
  try {
    getIO().emit("load:changed", { action, payload });
  } catch (err) {
    logger.warn(
      "Socket.IO indisponible, changement de chargement non diffusé en direct.",
    );
  }
};

/**
 * Récupère tous les chargements actifs
 */
const getLoads = async () => {
  return await prisma.load.findMany({
    where: { deletedAt: null },
    include: {
      loadingPlan: true,
      client: true,
      loadedBy: true,
    },
    orderBy: { createdAt: "desc" },
  });
};

/**
 * Récupère un chargement par son ID
 */
const getLoadById = async (id) => {
  const load = await prisma.load.findFirst({
    where: { id, deletedAt: null },
    include: {
      loadingPlan: true,
      client: true,
      loadedBy: true,
    },
  });

  if (!load) {
    throw new AppError("Chargement non trouvé.", 404);
  }

  return load;
};

/**
 * Crée un nouveau chargement
 */
const createLoad = async (data) => {
  const load = await prisma.load.create({
    data,
    include: {
      loadingPlan: true,
      client: true,
      loadedBy: true,
    },
  });

  broadcastLoadChange("created", load);

  return load;
};

/**
 * Modifie un chargement existant
 */
const updateLoad = async (id, data) => {
  const load = await prisma.load.findFirst({
    where: { id, deletedAt: null },
  });
  if (!load) {
    throw new AppError("Chargement non trouvé.", 404);
  }

  const updatedLoad = await prisma.load.update({
    where: { id },
    data,
    include: {
      loadingPlan: true,
      client: true,
      loadedBy: true,
    },
  });

  broadcastLoadChange("updated", updatedLoad);

  return updatedLoad;
};

/**
 * Supprime (soft delete) un chargement
 */
const deleteLoad = async (id) => {
  const load = await prisma.load.findFirst({
    where: { id, deletedAt: null },
  });
  if (!load) {
    throw new AppError("Chargement non trouvé.", 404);
  }

  const deletedLoad = await prisma.load.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  broadcastLoadChange("deleted", { id });

  return deletedLoad;
};

module.exports = {
  getLoads,
  getLoadById,
  createLoad,
  updateLoad,
  deleteLoad,
};

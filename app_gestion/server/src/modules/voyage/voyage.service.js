const { prisma } = require("../../config/database");
const AppError = require("../../common/utils/AppError");
const { getIO } = require("../../config/socket");
const logger = require("../../config/logger");

/**
 * Difuse les changements de voyages en temps réel via Socket.IO
 */
const broadcastVoyageChange = (action, payload = null) => {
  try {
    getIO().emit("voyage:changed", { action, payload });
  } catch (err) {
    logger.warn(
      "Socket.IO indisponible, changement de voyage non diffusé en direct.",
    );
  }
};

/**
 * Récupère tous les voyages actifs
 */
const getVoyages = async () => {
  return await prisma.voyage.findMany({
    where: { deletedAt: null },
    include: {
      vessel: true,
      departurePort: true,
      arrivalPort: true,
    },
    orderBy: { createdAt: "desc" },
  });
};

/**
 * Récupère un voyage par son ID
 */
const getVoyageById = async (id) => {
  const voyage = await prisma.voyage.findFirst({
    where: { id, deletedAt: null },
    include: {
      vessel: true,
      departurePort: true,
      arrivalPort: true,
    },
  });

  if (!voyage) {
    throw new AppError("Voyage non trouvé.", 404);
  }

  return voyage;
};

/**
 * Crée un nouveau voyage
 */
const createVoyage = async (data) => {
  const existing = await prisma.voyage.findFirst({
    where: { voyageNumber: data.voyageNumber, deletedAt: null },
  });
  if (existing) {
    throw new AppError("Un voyage avec ce numéro existe déjà.", 400);
  }

  const voyage = await prisma.voyage.create({
    data,
    include: {
      vessel: true,
      departurePort: true,
      arrivalPort: true,
    },
  });

  broadcastVoyageChange("created", voyage);

  return voyage;
};

/**
 * Modifie un voyage existant
 */
const updateVoyage = async (id, data) => {
  const voyage = await prisma.voyage.findFirst({
    where: { id, deletedAt: null },
  });
  if (!voyage) {
    throw new AppError("Voyage non trouvé.", 404);
  }

  if (data.voyageNumber && data.voyageNumber !== voyage.voyageNumber) {
    const numberTaken = await prisma.voyage.findFirst({
      where: { voyageNumber: data.voyageNumber, deletedAt: null, NOT: { id } },
    });
    if (numberTaken) {
      throw new AppError("Un voyage avec ce numéro existe déjà.", 400);
    }
  }

  const updatedVoyage = await prisma.voyage.update({
    where: { id },
    data,
    include: {
      vessel: true,
      departurePort: true,
      arrivalPort: true,
    },
  });

  broadcastVoyageChange("updated", updatedVoyage);

  return updatedVoyage;
};

/**
 * Supprime (soft delete) un voyage
 */
const deleteVoyage = async (id) => {
  const voyage = await prisma.voyage.findFirst({
    where: { id, deletedAt: null },
  });
  if (!voyage) {
    throw new AppError("Voyage non trouvé.", 404);
  }

  const deletedVoyage = await prisma.voyage.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  broadcastVoyageChange("deleted", { id });

  return deletedVoyage;
};

module.exports = {
  getVoyages,
  getVoyageById,
  createVoyage,
  updateVoyage,
  deleteVoyage,
};

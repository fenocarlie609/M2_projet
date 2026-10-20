const { prisma } = require("../../config/database");
const { getIO } = require("../../config/socket");
const logger = require("../../config/logger");

const resourceModels = {
  vessel: "vessel",
  port: "port",
};

// Nom de l'evenement et de la cle porteuse de l'objet diffuse. Les
// antiquets de l'interface ecoutent ces deux nommage.
const resourceEvents = {
  vessel: { event: "ships:changed", key: "ship" },
  port: { event: "ports:changed", key: "port" },
};

/**
 * Diffuse les changements du referentiel maritime en temps reel.
 */
const broadcastResourceChange = (resource, action, payload = null) => {
  const config = resourceEvents[resource];
  if (!config) return;

  try {
    getIO().emit(config.event, {
      action,
      [config.key]: payload,
      id: payload ? payload.id : undefined,
    });
  } catch (err) {
    logger.warn(
      "Socket.IO indisponible, changement maritime non diffusé en direct.",
    );
  }
};

const getInclude = () => undefined;

const getModel = (resource) => prisma[resourceModels[resource]];

const create = async (resource, data) => {
  const created = await getModel(resource).create({
    data,
    include: getInclude(resource),
  });

  broadcastResourceChange(resource, "created", created);

  return created;
};

const update = async (resource, id, data) => {
  const updated = await getModel(resource).update({
    where: { id },
    data,
    include: getInclude(resource),
  });

  broadcastResourceChange(resource, "updated", updated);

  return updated;
};

const remove = async (resource, id) => {
  // Suppression logique : l'enregistrement reste consultable dans l'historique
  // et disparait des listes, comme pour les autres referentiels.
  const deleted = await getModel(resource).update({
    where: { id },
    data: { deletedAt: new Date() },
    include: getInclude(resource),
  });

  broadcastResourceChange(resource, "deleted", deleted);

  return deleted;
};

const getAll = (resource) => {
  return getModel(resource).findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
    include: getInclude(resource),
  });
};

const getById = (resource, id) => {
  return getModel(resource).findFirst({
    where: { id, deletedAt: null },
    include: getInclude(resource),
  });
};

module.exports = {
  create,
  update,
  remove,
  getAll,
  getById,
};

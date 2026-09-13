const { prisma } = require("../../config/database");

const resourceModels = {
  vessel: "vessel",
  port: "port",
  voyage: "voyage",
  vehicle: "vehicle",
};

const getInclude = (resource) => {
  if (resource === "voyage") {
    return {
      vessel: true,
      departurePort: true,
      arrivalPort: true,
    };
  }

  return undefined;
};

const getModel = (resource) => prisma[resourceModels[resource]];

const create = (resource, data) => {
  return getModel(resource).create({
    data,
    include: getInclude(resource),
  });
};

const update = (resource, id, data) => {
  return getModel(resource).update({
    where: { id },
    data,
    include: getInclude(resource),
  });
};

const remove = (resource, id) => {
  return getModel(resource).delete({ where: { id } });
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

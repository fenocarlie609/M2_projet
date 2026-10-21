// src/modules/warehouse/warehouse.service.js
// Entreposage : les marchandises dechargees d'un navire sont conservees en
// entrepot dans l'attente soit du retrait par le client, soit du
// reembarquement sur un prochain voyage.
const { PrismaClient, Prisma } = require("../../generated/prisma");
const { prisma } = require("../../config/database");
const AppError = require("../../common/utils/AppError");
const { getIO } = require("../../config/socket");
const logger = require("../../config/logger");
const loadingPlanService = require("../loading-plans/loading-plan.service");

const STATUT_EN_STOCK = "IN_STOCK";
const STATUT_EMBARQUE = "EMBARKED";
const STATUT_RETIRE = "PICKED_UP";

const MOUVEMENT_ENTREE = "ENTRY";
const MOUVEMENT_RETRAIT = "PICKUP";
const MOUVEMENT_REEMBARQUEMENT = "RE_EMBARKMENT";

const decimal = (value) => new Prisma.Decimal(String(value));

const broadcast = (action, payload) => {
  try {
    getIO().emit("warehouse:changed", { action, payload });
  } catch (err) {
    logger.warn(
      "Socket.IO indisponible, changement d'entrepot non diffusé en direct.",
    );
  }
};

const warehouseInclude = {
  items: {
    where: { deletedAt: null, status: STATUT_EN_STOCK },
    select: { id: true, weightKg: true, packageCount: true },
  },
};

const itemInclude = {
  warehouse: { select: { id: true, code: true, name: true } },
  client: { select: { id: true, name: true, reference: true } },
  load: {
    select: {
      id: true,
      // Position de la marchandise : le quai de chargement d'origine.
      loadingPosition: true,
      loadingPlan: { select: { id: true, reference: true } },
    },
  },
  mouvements: { orderBy: { createdAt: "desc" } },
};

const getWarehouses = async () => {
  const warehouses = await prisma.warehouse.findMany({
    where: { deletedAt: null },
    include: warehouseInclude,
    orderBy: { name: "asc" },
  });

  return warehouses.map((warehouse) => {
    const tonnage = warehouse.items.reduce(
      (total, item) => total + Number(item.weightKg || 0),
      0,
    );
    return {
      ...warehouse,
      articlesEnStock: warehouse.items.length,
      tonnageEnStock: Math.round(tonnage) / 1000,
      tauxOccupation:
        Number(warehouse.capacityTons) > 0
          ? Math.round((tonnage / (Number(warehouse.capacityTons) * 1000)) * 1000) / 10
          : null,
    };
  });
};

const getWarehouse = async (id) => {
  const warehouse = await prisma.warehouse.findFirst({
    where: { id, deletedAt: null },
    include: warehouseInclude,
  });
  if (!warehouse) throw new AppError("Entrepôt non trouvé.", 404);
  return warehouse;
};

const createWarehouse = async (data) => {
  const warehouse = await prisma.warehouse.create({ data });
  broadcast("created", warehouse);
  return warehouse;
};

const updateWarehouse = async (id, data) => {
  const warehouse = await prisma.warehouse.findFirst({
    where: { id, deletedAt: null },
  });
  if (!warehouse) throw new AppError("Entrepôt non trouvé.", 404);

  const updated = await prisma.warehouse.update({ where: { id }, data });
  broadcast("updated", updated);
  return updated;
};

const deleteWarehouse = async (id) => {
  const warehouse = await prisma.warehouse.findFirst({
    where: { id, deletedAt: null },
    include: { items: { where: { deletedAt: null, status: STATUT_EN_STOCK } } },
  });
  if (!warehouse) throw new AppError("Entrepôt non trouvé.", 404);

  if (warehouse.items.length > 0) {
    throw new AppError(
      "Cet entrepôt contient encore des marchandises en stock : videz-le avant de le supprimer.",
      409,
    );
  }

  const deleted = await prisma.warehouse.update({
    where: { id },
    data: { deletedAt: new Date(), isActive: false },
  });
  broadcast("deleted", deleted);
  return deleted;
};

/**
 * Tonnage actuellement entrepose dans un entrepot donne.
 */
const tonnageEnStock = async (warehouseId, transaction = prisma) => {
  const items = await transaction.warehouseItem.findMany({
    where: { warehouseId, deletedAt: null, status: STATUT_EN_STOCK },
    select: { weightKg: true },
  });
  return items.reduce((total, item) => total + Number(item.weightKg || 0), 0);
};

const getItems = async (filtres = {}) => {
  const where = { deletedAt: null };

  if (filtres.warehouseId) where.warehouseId = filtres.warehouseId;
  if (filtres.clientId) where.clientId = filtres.clientId;
  if (filtres.status) where.status = filtres.status;

  return prisma.warehouseItem.findMany({
    where,
    include: itemInclude,
    orderBy: { arrivalDate: "desc" },
  });
};

const getItem = async (id) => {
  const item = await prisma.warehouseItem.findFirst({
    where: { id, deletedAt: null },
    include: itemInclude,
  });
  if (!item) throw new AppError("Marchandise en entrepôt non trouvée.", 404);
  return item;
};

/**
 * Entree en entrepot d'une marchandise.
 */
const createItem = async (data, employeeId) => {
  const warehouse = await prisma.warehouse.findFirst({
    where: { id: data.warehouseId, deletedAt: null },
  });
  if (!warehouse) throw new AppError("Entrepôt non trouvé.", 404);
  if (!warehouse.isActive) {
    throw new AppError("Cet entrepôt n'est pas en service.", 409);
  }

  const client = await prisma.client.findFirst({
    where: { id: data.clientId, deletedAt: null },
  });
  if (!client) throw new AppError("Client non trouvé.", 404);

  if (data.loadId) {
    const load = await prisma.load.findFirst({
      where: { id: data.loadId, deletedAt: null },
      include: { loadingPlan: true },
    });
    if (!load) throw new AppError("Ligne de marchandise non trouvée.", 404);
    if (load.loadingPlan?.operationType !== "UNLOAD") {
      throw new AppError(
        "Seule une ligne issue d'un plan de déchargement peut entrer en entrepôt.",
        400,
      );
    }
    if (!load.loadingPlan?.status) {
      throw new AppError(
        "Le plan de déchargement doit être validé : le navire n'est pas encore arrivé.",
        409,
      );
    }
  }

  const capacite = Number(warehouse.capacityTons || 0);
  if (capacite > 0) {
    const dejaStocke = await tonnageEnStock(warehouse.id);
    const nouveau = dejaStocke + Number(data.weightKg);
    if (nouveau > capacite * 1000) {
      throw new AppError(
        "La capacité de l'entrepôt serait dépassée par cette entrée.",
        409,
      );
    }
  }

  const reference = `STK-${Date.now().toString(36).toUpperCase()}-${Math.floor(
    Math.random() * 1000,
  )
    .toString()
    .padStart(3, "0")}`;

  const item = await prisma.$transaction(async (transaction) => {
    const created = await transaction.warehouseItem.create({
      data: {
        reference,
        warehouseId: warehouse.id,
        clientId: client.id,
        loadId: data.loadId || null,
        description: data.description,
        packageCount: data.packageCount,
        weightKg: decimal(data.weightKg),
        status: STATUT_EN_STOCK,
        arrivalDate: data.arrivalDate || new Date(),
      },
      include: itemInclude,
    });

    await transaction.warehouseMovement.create({
      data: {
        itemId: created.id,
        warehouseId: warehouse.id,
        employeeId: employeeId || null,
        type: MOUVEMENT_ENTREE,
        note: data.note || "Entrée en entrepôt",
      },
    });

    return created;
  });

  broadcast("item-created", item);
  return item;
};

/**
 * Retrait d'une marchandise par son client.
 */
const pickupItem = async (id, employeeId, data = {}) => {
  const item = await prisma.warehouseItem.findFirst({
    where: { id, deletedAt: null },
  });
  if (!item) throw new AppError("Marchandise en entrepôt non trouvée.", 404);

  if (item.status !== STATUT_EN_STOCK) {
    throw new AppError(
      "Cette marchandise ne peut plus être retirée : elle a déjà quitté l'entrepôt.",
      409,
    );
  }

  const updated = await prisma.$transaction(async (transaction) => {
    const result = await transaction.warehouseItem.update({
      where: { id },
      data: {
        status: STATUT_RETIRE,
        departureDate: new Date(),
        departureReason: MOUVEMENT_RETRAIT,
      },
      include: itemInclude,
    });

    await transaction.warehouseMovement.create({
      data: {
        itemId: id,
        warehouseId: item.warehouseId,
        employeeId: employeeId || null,
        type: MOUVEMENT_RETRAIT,
        note: data.note || "Retrait par le client",
      },
    });

    return result;
  });

  broadcast("item-pickup", updated);
  return updated;
};

/**
 * Reembarquement d'une marchandise en attente sur un prochain voyage.
 */
const embarkItem = async (id, employeeId, data) => {
  const item = await prisma.warehouseItem.findFirst({
    where: { id, deletedAt: null },
    include: { load: { select: { loadingPosition: true } } },
  });
  if (!item) throw new AppError("Marchandise en entrepôt non trouvée.", 404);

  if (item.status !== STATUT_EN_STOCK) {
    throw new AppError(
      "Cette marchandise ne peut plus être embarquée : elle a déjà quitté l'entrepôt.",
      409,
    );
  }

  const plan = await prisma.loadingPlan.findFirst({
    where: { id: data.loadingPlanId, deletedAt: null },
  });
  if (!plan) throw new AppError("Plan de chargement non trouvé.", 404);
  if (plan.operationType !== "LOAD") {
    throw new AppError(
      "Le réembarquement doit porter sur un plan de chargement.",
      400,
    );
  }

  // La creation de la ligne reutilise le service des plans : la capacite du
  // navire est controlee et le total du plan recalcule.
  const load = await loadingPlanService.createLoad(
    plan.id,
    {
      clientId: item.clientId,
      packageCount: item.packageCount,
      description: item.description,
      weightKg: item.weightKg,
      status: "PENDING",
      loadingDate: new Date(),
      // La marchandise conserve son quai de chargement : la position
      // d'une marchandise designe toujours un quai de Toamasina.
      loadingPosition: item.load?.loadingPosition || null,
    },
    employeeId,
  );

  const updated = await prisma.$transaction(async (transaction) => {
    await transaction.load.update({
      where: { id: load.id },
      data: { stockItemId: item.id },
    });

    const result = await transaction.warehouseItem.update({
      where: { id },
      data: {
        status: STATUT_EMBARQUE,
        departureDate: new Date(),
        departureReason: MOUVEMENT_REEMBARQUEMENT,
      },
      include: itemInclude,
    });

    await transaction.warehouseMovement.create({
      data: {
        itemId: id,
        warehouseId: item.warehouseId,
        employeeId: employeeId || null,
        type: MOUVEMENT_REEMBARQUEMENT,
        note: data.note || `Réembarquement sur ${plan.reference}`,
      },
    });

    return result;
  });

  broadcast("item-embarked", updated);
  return updated;
};

/**
 * Marchandises disponibles pour une entree en entrepot : lignes de plan de
 * dechargement validees, donc decharges, et non encore stockees.
 */
const getAvailableItems = async () => {
  const lignes = await prisma.load.findMany({
    where: {
      deletedAt: null,
      status: "LOADED",
      stockSource: null,
      loadingPlan: {
        operationType: "UNLOAD",
        status: true,
        deletedAt: null,
      },
    },
    include: {
      client: { select: { id: true, name: true } },
      loadingPlan: {
        select: {
          id: true,
          reference: true,
          voyage: { select: { voyageNumber: true, vessel: { select: { name: true } } } },
        },
      },
    },
    orderBy: { loadingDate: "desc" },
  });

  return lignes.map((ligne) => ({
    id: ligne.id,
    clientId: ligne.clientId,
    client: ligne.client?.name || "—",
    description: ligne.description,
    packageCount: ligne.packageCount,
    weightKg: ligne.weightKg,
    plan: ligne.loadingPlan?.reference || "—",
    voyage: ligne.loadingPlan?.voyage?.voyageNumber || "—",
    navire: ligne.loadingPlan?.voyage?.vessel?.name || "—",
  }));
};

/**
 * Journal des mouvements d'un entrepot ou de l'ensemble.
 */
const getMovements = async (filtres = {}) => {
  const where = {};
  if (filtres.warehouseId) where.warehouseId = filtres.warehouseId;
  if (filtres.type) where.type = filtres.type;

  return prisma.warehouseMovement.findMany({
    where,
    include: {
      item: { select: { id: true, reference: true, description: true } },
      employee: { select: { id: true, name: true, matricule: true } },
      warehouse: { select: { id: true, code: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: Number(filtres.take || 100),
  });
};

module.exports = {
  getWarehouses,
  getWarehouse,
  createWarehouse,
  updateWarehouse,
  deleteWarehouse,
  getItems,
  getItem,
  getAvailableItems,
  createItem,
  pickupItem,
  embarkItem,
  getMovements,
  STATUT_EN_STOCK,
  STATUT_EMBARQUE,
  STATUT_RETIRE,
  MOUVEMENT_ENTREE,
  MOUVEMENT_RETRAIT,
  MOUVEMENT_REEMBARQUEMENT,
};

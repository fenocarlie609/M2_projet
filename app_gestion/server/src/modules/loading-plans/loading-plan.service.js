const { prisma } = require("../../config/database");
const { Prisma } = require("../../generated/prisma");
const AppError = require("../../common/utils/AppError");

const planInclude = {
  voyage: {
    include: {
      vessel: true,
      departurePort: true,
      arrivalPort: true,
    },
  },
  validatedBy: {
    select: { id: true, name: true, matricule: true },
  },
  sourceLoadingPlan: {
    select: { id: true, reference: true },
  },
  unloadPlan: {
    select: { id: true, reference: true, status: true, validatedAt: true },
  },
  loads: {
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
    include: {
      client: true,
      loadedBy: { select: { id: true, name: true, matricule: true } },
    },
  },
};

const loadInclude = {
  client: true,
  loadedBy: { select: { id: true, name: true, matricule: true } },
};

const decimal = (value) => new Prisma.Decimal(String(value));

const getPlanOrThrow = async (id, transaction = prisma) => {
  const plan = await transaction.loadingPlan.findFirst({
    where: { id, deletedAt: null },
    include: planInclude,
  });

  if (!plan) {
    throw new AppError("Plan de chargement introuvable.", 404);
  }

  return plan;
};

const ensureEditable = (plan) => {
  if (plan.validatedAt) {
    throw new AppError("Ce plan est validé et n'est plus modifiable.", 409);
  }
};

const ensureCapacity = (plan, totalWeightKg) => {
  const capacityTons = plan.voyage?.vessel?.capacityTons;
  if (!capacityTons) return;

  const capacityKg = decimal(capacityTons).mul(1000);
  if (totalWeightKg.gt(capacityKg)) {
    throw new AppError(
      `La capacité du navire est dépassée : ${totalWeightKg.toString()} kg pour ${capacityKg.toString()} kg autorisés.`,
      409,
    );
  }
};

const sumActiveLoadWeights = (loads, overrides = {}) =>
  loads.reduce((total, load) => {
    if (load.id === overrides.excludeId) return total;
    const candidate = load.id === overrides.loadId ? overrides.load : load;
    if (candidate.status === "CANCELLED") return total;
    return total.add(decimal(candidate.weightKg));
  }, decimal(0));

const getAllPlans = async () =>
  prisma.loadingPlan.findMany({
    where: { deletedAt: null },
    include: planInclude,
    orderBy: { createdAt: "desc" },
  });

const getPlanById = (id) => getPlanOrThrow(id);

const getPlanByReference = async (reference) => {
  const plan = await prisma.loadingPlan.findFirst({
    where: { reference, deletedAt: null },
    include: planInclude,
  });

  if (!plan) {
    throw new AppError("Plan de chargement introuvable.", 404);
  }

  return plan;
};

const createPlan = async (data) => {
  if (data.operationType === "UNLOAD") {
    throw new AppError(
      "Un plan de déchargement est généré automatiquement après validation du chargement.",
      409,
    );
  }

  const voyage = await prisma.voyage.findFirst({
    where: { id: data.voyageId, deletedAt: null },
  });

  if (!voyage) {
    throw new AppError("Voyage introuvable.", 404);
  }

  return prisma.loadingPlan.create({
    data: {
      reference: data.reference,
      voyageId: data.voyageId,
      operationType: data.operationType,
      status: false,
      totalWeightKg: decimal(0),
    },
    include: planInclude,
  });
};

const updatePlan = async (id, data) => {
  const plan = await getPlanOrThrow(id);
  ensureEditable(plan);

  if (data.voyageId && data.voyageId !== plan.voyageId) {
    const voyage = await prisma.voyage.findFirst({
      where: { id: data.voyageId, deletedAt: null },
      include: { vessel: true },
    });
    if (!voyage) throw new AppError("Voyage introuvable.", 404);
    ensureCapacity({ ...plan, voyage }, decimal(plan.totalWeightKg));
  }

  return prisma.loadingPlan.update({
    where: { id },
    data,
    include: planInclude,
  });
};

const deletePlan = async (id) => {
  const plan = await getPlanOrThrow(id);
  ensureEditable(plan);
  if (plan.sourceLoadingPlanId) {
    throw new AppError(
      "Un plan de déchargement généré automatiquement ne peut pas être supprimé.",
      409,
    );
  }
  await prisma.loadingPlan.delete({ where: { id } });
};

const createLoad = async (planId, data, employeeId) =>
  prisma.$transaction(async (transaction) => {
    const plan = await getPlanOrThrow(planId, transaction);
    ensureEditable(plan);

    const loads = await transaction.load.findMany({
      where: { loadingPlanId: planId, deletedAt: null },
      select: { id: true, weightKg: true, status: true },
    });
    const totalWeightKg = sumActiveLoadWeights(loads).add(
      data.status === "CANCELLED" ? decimal(0) : decimal(data.weightKg),
    );
    ensureCapacity(plan, totalWeightKg);

    const load = await transaction.load.create({
      data: {
        ...data,
        weightKg: decimal(data.weightKg),
        loadingPlanId: planId,
        loadedById: data.status === "LOADED" ? employeeId : null,
      },
      include: loadInclude,
    });

    await transaction.loadingPlan.update({
      where: { id: planId },
      data: { totalWeightKg },
    });

    return load;
  });

const updateLoad = async (planId, loadId, data, employeeId) =>
  prisma.$transaction(async (transaction) => {
    const plan = await getPlanOrThrow(planId, transaction);
    ensureEditable(plan);

    const currentLoad = await transaction.load.findFirst({
      where: { id: loadId, loadingPlanId: planId, deletedAt: null },
    });
    if (!currentLoad) throw new AppError("Marchandise introuvable.", 404);

    const loads = await transaction.load.findMany({
      where: { loadingPlanId: planId, deletedAt: null },
      select: { id: true, weightKg: true, status: true },
    });
    const candidate = {
      ...currentLoad,
      ...data,
      weightKg:
        data.weightKg === undefined
          ? currentLoad.weightKg
          : decimal(data.weightKg),
    };
    const totalWeightKg = sumActiveLoadWeights(loads, {
      loadId,
      load: candidate,
    });
    ensureCapacity(plan, totalWeightKg);

    const updatedLoad = await transaction.load.update({
      where: { id: loadId },
      data: {
        ...data,
        ...(data.status === "LOADED" && currentLoad.status !== "LOADED"
          ? { loadedById: employeeId }
          : data.status && data.status !== "LOADED"
            ? { loadedById: null }
            : {}),
        ...(data.weightKg === undefined
          ? {}
          : { weightKg: decimal(data.weightKg) }),
      },
      include: loadInclude,
    });

    await transaction.loadingPlan.update({
      where: { id: planId },
      data: { totalWeightKg },
    });

    return updatedLoad;
  });

const deleteLoad = async (planId, loadId) =>
  prisma.$transaction(async (transaction) => {
    const plan = await getPlanOrThrow(planId, transaction);
    ensureEditable(plan);

    const load = await transaction.load.findFirst({
      where: { id: loadId, loadingPlanId: planId, deletedAt: null },
      select: { id: true },
    });
    if (!load) throw new AppError("Marchandise introuvable.", 404);

    const loads = await transaction.load.findMany({
      where: { loadingPlanId: planId, deletedAt: null },
      select: { id: true, weightKg: true, status: true },
    });
    const totalWeightKg = sumActiveLoadWeights(loads, { excludeId: loadId });

    await transaction.load.update({
      where: { id: loadId },
      data: { deletedAt: new Date() },
    });
    await transaction.loadingPlan.update({
      where: { id: planId },
      data: { totalWeightKg },
    });
  });

const validatePlan = async (id, employeeId) =>
  prisma.$transaction(async (transaction) => {
    const plan = await getPlanOrThrow(id, transaction);
    ensureEditable(plan);

    const loads = plan.loads.filter((load) => load.status !== "CANCELLED");
    if (!loads.length || loads.some((load) => load.status !== "LOADED")) {
      throw new AppError(
        `Toutes les marchandises actives doivent être ${plan.operationType === "UNLOAD" ? "déchargées" : "chargées"} avant validation.`,
        409,
      );
    }

    const totalWeightKg = sumActiveLoadWeights(plan.loads);
    ensureCapacity(plan, totalWeightKg);

    const validatedPlan = await transaction.loadingPlan.update({
      where: { id },
      data: {
        status: true,
        totalWeightKg,
        validatedAt: new Date(),
        validatedById: employeeId,
      },
      include: planInclude,
    });

    if (plan.operationType === "LOAD") {
      const unloadLoads = loads.map((load) => ({
        clientId: load.clientId,
        driverName: null,
        vehiclePlate: null,
        loadingDate: null,
        packageCount: load.packageCount,
        description: load.description,
        weightKg: decimal(load.weightKg),
        anomaly: load.anomaly,
        loadingPosition: load.loadingPosition,
        isHazardous: load.isHazardous,
        status: "PENDING",
      }));
      const unloadPlan = await transaction.loadingPlan.create({
        data: {
          reference: `DECH-${plan.reference}`,
          voyageId: plan.voyageId,
          operationType: "UNLOAD",
          sourceLoadingPlanId: plan.id,
          status: false,
          totalWeightKg,
          loads: { create: unloadLoads },
        },
        include: planInclude,
      });
      return { ...validatedPlan, unloadPlan };
    }

    return validatedPlan;
  });

module.exports = {
  getAllPlans,
  getPlanById,
  getPlanByReference,
  createPlan,
  updatePlan,
  deletePlan,
  createLoad,
  updateLoad,
  deleteLoad,
  validatePlan,
};
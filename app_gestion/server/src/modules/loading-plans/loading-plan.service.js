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
  cargoLines: {
    where: { deletedAt: null },
    orderBy: { loadingDate: "asc" },
    include: {
      client: true,
      driver: true,
      vehicle: true,
      loadedBy: {
        select: { id: true, name: true, matricule: true },
      },
    },
  },
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
  if (["VALIDATED", "CLOSED"].includes(plan.status)) {
    throw new AppError("Ce plan n'est plus modifiable.", 409);
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

const getAllPlans = () =>
  prisma.loadingPlan.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
    include: planInclude,
  });

const getPlanById = (id) => getPlanOrThrow(id);

const createPlan = async (data) => {
  const voyage = await prisma.voyage.findFirst({
    where: { id: data.voyageId, deletedAt: null },
    include: { vessel: true },
  });

  if (!voyage) {
    throw new AppError("Voyage introuvable.", 404);
  }

  return prisma.loadingPlan.create({
    data: {
      reference: data.reference,
      voyageId: data.voyageId,
      status: data.status || "DRAFT",
      totalWeightKg: decimal(0),
    },
    include: planInclude,
  });
};

const updatePlan = async (id, data) => {
  const plan = await getPlanOrThrow(id);
  ensureEditable(plan);

  return prisma.loadingPlan.update({
    where: { id },
    data,
    include: planInclude,
  });
};

const deletePlan = async (id) => {
  const plan = await getPlanOrThrow(id);
  ensureEditable(plan);
  await prisma.loadingPlan.delete({ where: { id } });
};

const createLine = async (planId, data, loadedById) =>
  prisma.$transaction(async (transaction) => {
    const plan = await getPlanOrThrow(planId, transaction);
    ensureEditable(plan);

    const totalWeightKg = decimal(plan.totalWeightKg).add(
      decimal(data.weightKg),
    );
    ensureCapacity(plan, totalWeightKg);

    await transaction.loadingPlan.update({
      where: { id: planId },
      data: { totalWeightKg },
    });

    return transaction.cargoLine.create({
      data: {
        ...data,
        weightKg: decimal(data.weightKg),
        loadedById,
      },
      include: {
        client: true,
        driver: true,
        vehicle: true,
      },
    });
  });

const updateLine = async (planId, lineId, data) =>
  prisma.$transaction(async (transaction) => {
    const plan = await getPlanOrThrow(planId, transaction);
    ensureEditable(plan);

    const currentLine = await transaction.cargoLine.findFirst({
      where: { id: lineId, loadingPlanId: planId, deletedAt: null },
    });

    if (!currentLine) {
      throw new AppError("Ligne de marchandise introuvable.", 404);
    }

    const currentWeightKg = decimal(currentLine.weightKg);
    const nextWeightKg =
      data.weightKg === undefined ? currentWeightKg : decimal(data.weightKg);
    const totalWeightKg = decimal(plan.totalWeightKg)
      .sub(currentWeightKg)
      .add(nextWeightKg);
    ensureCapacity(plan, totalWeightKg);

    await transaction.loadingPlan.update({
      where: { id: planId },
      data: { totalWeightKg },
    });

    return transaction.cargoLine.update({
      where: { id: lineId },
      data: {
        ...data,
        ...(data.weightKg === undefined ? {} : { weightKg: nextWeightKg }),
      },
      include: {
        client: true,
        driver: true,
        vehicle: true,
      },
    });
  });

const deleteLine = async (planId, lineId) =>
  prisma.$transaction(async (transaction) => {
    const plan = await getPlanOrThrow(planId, transaction);
    ensureEditable(plan);

    const line = await transaction.cargoLine.findFirst({
      where: { id: lineId, loadingPlanId: planId, deletedAt: null },
    });

    if (!line) {
      throw new AppError("Ligne de marchandise introuvable.", 404);
    }

    const totalWeightKg = decimal(plan.totalWeightKg).sub(
      decimal(line.weightKg),
    );
    await transaction.loadingPlan.update({
      where: { id: planId },
      data: {
        totalWeightKg: totalWeightKg.greaterThan(0)
          ? totalWeightKg
          : decimal(0),
      },
    });
    await transaction.cargoLine.delete({ where: { id: lineId } });
  });

const validatePlan = async (id, employeeId) =>
  prisma.$transaction(async (transaction) => {
    const plan = await getPlanOrThrow(id, transaction);
    ensureEditable(plan);

    if (plan.cargoLines.length === 0) {
      throw new AppError(
        "Un plan doit contenir au moins une marchandise.",
        409,
      );
    }

    ensureCapacity(plan, decimal(plan.totalWeightKg));

    return transaction.loadingPlan.update({
      where: { id },
      data: {
        status: "VALIDATED",
        validatedAt: new Date(),
        validatedById: employeeId,
      },
      include: planInclude,
    });
  });

module.exports = {
  getAllPlans,
  getPlanById,
  createPlan,
  updatePlan,
  deletePlan,
  createLine,
  updateLine,
  deleteLine,
  validatePlan,
};

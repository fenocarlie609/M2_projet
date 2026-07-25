const { prisma } = require("../../config/database");
const AppError = require("../../common/utils/AppError");

const getAllModules = async () => {
  return prisma.appModule.findMany({ orderBy: { label: "asc" } });
};

const createModule = async ({ code, label }) => {
  const existing = await prisma.appModule.findUnique({ where: { code } });
  if (existing) {
    throw new AppError("Ce module existe déjà.", 400);
  }

  return prisma.appModule.create({ data: { code, label } });
};

module.exports = { getAllModules, createModule };

// src/modules/company-structure/company-structure.service.js
const { prisma } = require("../../config/database");
const AppError = require("../../common/utils/AppError");

/**
 * Récupère tous les départements avec leurs postes associés
 */
const getFullStructure = async () => {
  return await prisma.department.findMany({
    include: {
      positions: {
        orderBy: { label: "asc" },
      },
    },
    orderBy: { label: "asc" },
  });
};

/**
 * Récupère un département spécifique avec ses postes
 */
const getDepartmentById = async (id) => {
  const department = await prisma.department.findUnique({
    where: { id },
    include: { positions: true },
  });

  if (!department) {
    throw new AppError("Département non trouvé.", 404);
  }

  return department;
};

/**
 * Crée un nouveau département
 */
const createDepartment = async (data) => {
  const existing = await prisma.department.findUnique({
    where: { code: data.code },
  });
  if (existing) {
    throw new AppError("Un département avec ce code existe déjà.", 400);
  }

  return await prisma.department.create({ data });
};

/**
 * Ajoute un poste à un département spécifique
 */
const createPosition = async (departmentId, data) => {
  const department = await prisma.department.findUnique({
    where: { id: departmentId },
  });
  if (!department) {
    throw new AppError("Département parent non trouvé.", 404);
  }

  const existing = await prisma.position.findUnique({
    where: { code: data.code },
  });
  if (existing) {
    throw new AppError("Un poste avec ce code global existe déjà.", 400);
  }

  return await prisma.position.create({
    data: {
      code: data.code,
      label: data.label,
      departmentId: departmentId,
    },
  });
};

module.exports = {
  getFullStructure,
  getDepartmentById,
  createDepartment,
  createPosition,
};

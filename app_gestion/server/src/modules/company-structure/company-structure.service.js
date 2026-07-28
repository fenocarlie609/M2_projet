// src/modules/company-structure/company-structure.service.js
const { prisma } = require("../../config/database");
const AppError = require("../../common/utils/AppError");

/**
 * Récupère tous les départements actifs avec leurs postes actifs associés
 */
const getFullStructure = async () => {
  return await prisma.department.findMany({
    where: { deletedAt: null },
    include: {
      positions: {
        where: { deletedAt: null },
        orderBy: { label: "asc" },
      },
    },
    orderBy: { label: "asc" },
  });
};

/**
 * Récupère un département spécifique (actif) avec ses postes actifs
 */
const getDepartmentById = async (id) => {
  const department = await prisma.department.findFirst({
    where: { id, deletedAt: null },
    include: {
      positions: { where: { deletedAt: null } },
    },
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
  const existing = await prisma.department.findFirst({
    where: { code: data.code, deletedAt: null },
  });
  if (existing) {
    throw new AppError("Un département avec ce code existe déjà.", 400);
  }

  return await prisma.department.create({
    data: { code: data.code, label: data.label },
  });
};

/**
 * Modifie un département existant
 */
const updateDepartment = async (id, data) => {
  const department = await prisma.department.findFirst({
    where: { id, deletedAt: null },
  });
  if (!department) {
    throw new AppError("Département non trouvé.", 404);
  }

  if (data.code && data.code !== department.code) {
    const codeTaken = await prisma.department.findFirst({
      where: { code: data.code, deletedAt: null, NOT: { id } },
    });
    if (codeTaken) {
      throw new AppError("Un département avec ce code existe déjà.", 400);
    }
  }

  return await prisma.department.update({
    where: { id },
    data: { code: data.code, label: data.label },
  });
};

/**
 * Supprime (soft delete) un département et ses postes associés
 */
const deleteDepartment = async (id) => {
  const department = await prisma.department.findFirst({
    where: { id, deletedAt: null },
  });
  if (!department) {
    throw new AppError("Département non trouvé.", 404);
  }

  const now = new Date();

  await prisma.$transaction([
    prisma.position.updateMany({
      where: { departmentId: id, deletedAt: null },
      data: { deletedAt: now },
    }),
    prisma.department.update({
      where: { id },
      data: { deletedAt: now },
    }),
  ]);
};

/**
 * Ajoute un poste à un département spécifique
 */
const createPosition = async (departmentId, data) => {
  const department = await prisma.department.findFirst({
    where: { id: departmentId, deletedAt: null },
  });
  if (!department) {
    throw new AppError("Département parent non trouvé.", 404);
  }

  const existing = await prisma.position.findFirst({
    where: { code: data.code, deletedAt: null },
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

/**
 * Modifie un poste existant
 */
const updatePosition = async (id, data) => {
  const position = await prisma.position.findFirst({
    where: { id, deletedAt: null },
  });
  if (!position) {
    throw new AppError("Poste non trouvé.", 404);
  }

  if (data.code && data.code !== position.code) {
    const codeTaken = await prisma.position.findFirst({
      where: { code: data.code, deletedAt: null, NOT: { id } },
    });
    if (codeTaken) {
      throw new AppError("Un poste avec ce code global existe déjà.", 400);
    }
  }

  return await prisma.position.update({
    where: { id },
    data: { code: data.code, label: data.label },
  });
};

/**
 * Supprime (soft delete) un poste
 */
const deletePosition = async (id) => {
  const position = await prisma.position.findFirst({
    where: { id, deletedAt: null },
  });
  if (!position) {
    throw new AppError("Poste non trouvé.", 404);
  }

  await prisma.position.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
};

module.exports = {
  getFullStructure,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  createPosition,
  updatePosition,
  deletePosition,
};

// src/modules/users/user.service.js
const { prisma } = require("../../config/database");
const { hashPassword } = require("../../common/utils/password.utils");

/**
 * Crée un nouvel utilisateur
 */
const createUser = async (userData, authContext) => {
  const hashedPassword = await hashPassword(userData.password);

  // CORRECTION : prisma.user au lieu de prisma.users
  return await prisma.user.create({
    data: {
      email: userData.email,
      password: hashedPassword,
      name: userData.name,
      role: userData.role || "USER",
    },
    context: authContext,
  });
};

/**
 * Met à jour un utilisateur (génère un delta oldValues/newValues dans l'audit)
 */
const updateUser = async (id, updateData, authContext) => {
  if (updateData.password) {
    updateData.password = await hashPassword(updateData.password);
  }
  // CORRECTION : suppression du mot "create;" qui traînait ici

  // CORRECTION : prisma.user au lieu de prisma.users
  return await prisma.user.update({
    where: { id },
    data: updateData,
    context: authContext,
  });
};

/**
 * Suppression logique (Soft Delete)
 */
const softDeleteUser = async (id, authContext) => {
  // CORRECTION : prisma.user au lieu de prisma.users
  return await prisma.user.update({
    where: { id },
    data: {
      deletedAt: new Date(),
    },
    context: authContext,
  });
};

/**
 * Récupère tous les utilisateurs actifs
 */
const getAllActiveUsers = async () => {
  // CORRECTION : prisma.user au lieu de prisma.users
  return await prisma.user.findMany({
    where: {
      deletedAt: null,
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
    },
  });
};

module.exports = {
  createUser,
  updateUser,
  softDeleteUser,
  getAllActiveUsers,
};

const { prisma } = require("../../config/database");
const AppError = require("../../common/utils/AppError");
const { getIO } = require("../../config/socket");
const logger = require("../../config/logger");

/**
 * Diffuse un signal "la liste des modules a changé" à tous les clients
 * connectés. Pas de payload détaillé : le front (PermissionsModal notamment)
 * refait simplement GET /modules. Protégé par try/catch, comme pour
 * company-structure : un souci de diffusion ne doit jamais faire échouer
 * l'opération CRUD qui a, elle, réussi en base.
 */
const broadcastModulesChange = () => {
  try {
    getIO().emit("modules:changed");
  } catch (err) {
    logger.warn(
      "Socket.IO indisponible, changement de module non diffusé en direct.",
    );
  }
};

const getAllModules = async () => {
  return prisma.appModule.findMany({ orderBy: { label: "asc" } });
};

const getModuleById = async (id) => {
  const appModule = await prisma.appModule.findUnique({ where: { id } });
  if (!appModule) {
    throw new AppError("Module non trouvé.", 404);
  }
  return appModule;
};

const createModule = async ({ code, label }) => {
  const existing = await prisma.appModule.findUnique({ where: { code } });
  if (existing) {
    throw new AppError("Ce module existe déjà.", 400);
  }

  const appModule = await prisma.appModule.create({ data: { code, label } });

  broadcastModulesChange();

  return appModule;
};

const updateModule = async (id, { code, label }) => {
  const appModule = await prisma.appModule.findUnique({ where: { id } });
  if (!appModule) {
    throw new AppError("Module non trouvé.", 404);
  }

  if (code && code !== appModule.code) {
    const codeTaken = await prisma.appModule.findUnique({ where: { code } });
    if (codeTaken) {
      throw new AppError("Ce code de module est déjà utilisé.", 400);
    }
  }

  const updatedModule = await prisma.appModule.update({
    where: { id },
    data: {
      code: code ?? undefined,
      label: label ?? undefined,
    },
  });

  broadcastModulesChange();

  return updatedModule;
};

const deleteModule = async (id) => {
  const appModule = await prisma.appModule.findUnique({ where: { id } });
  if (!appModule) {
    throw new AppError("Module non trouvé.", 404);
  }

  // AppModule.code n'est pas une clé étrangère stricte sur EmployeePermission
  // (juste une chaîne validée dynamiquement côté front) -> on bloque quand
  // même la suppression tant que des permissions actives l'utilisent, pour
  // éviter des permissions "fantômes" pointant vers un module qui n'existe
  // plus dans le sélecteur (PermissionsModal).
  const usageCount = await prisma.employeePermission.count({
    where: { module: appModule.code },
  });
  if (usageCount > 0) {
    throw new AppError(
      `Impossible de supprimer ce module : ${usageCount} permission(s) l'utilisent encore. Révoquez-les d'abord.`,
      400,
    );
  }

  const deleted = await prisma.appModule.delete({ where: { id } });

  broadcastModulesChange();

  return deleted;
};

module.exports = {
  getAllModules,
  getModuleById,
  createModule,
  updateModule,
  deleteModule,
};

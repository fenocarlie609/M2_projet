// src/modules/uploads/upload.controller.js
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const catchAsync = require("../../common/utils/catchAsync");
const AppError = require("../../common/utils/AppError");
const logger = require("../../config/logger");
const { prisma } = require("../../config/database");
const {
  uploadDir,
  sanitizeForFilename,
  detectImageExtension,
} = require("../../common/middlewares/upload.middleware");

const hasEmployeePermission = (user, action) =>
  (user.permissions || []).some(
    (permission) =>
      (permission.module === "EMPLOYEES" || permission.module === "*") &&
      (permission.action === action || permission.action === "*"),
  );

exports.uploadAvatar = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError("Aucun fichier reçu.", 400));
  }

  const extension = detectImageExtension(req.file.buffer);
  if (!extension) {
    throw new AppError("Le fichier doit être une image JPEG, PNG ou WEBP valide.", 400);
  }

  const suppliedMatricule = sanitizeForFilename(req.body?.matricule || "");
  const ownMatricule = sanitizeForFilename(req.user.matricule || "");
  let filenameKey;

  if (!suppliedMatricule && !hasEmployeePermission(req.user, "CREATE")) {
    filenameKey = ownMatricule;
  } else if (!suppliedMatricule) {
    filenameKey = `TEMP-${crypto.randomUUID()}`;
  } else if (suppliedMatricule === ownMatricule) {
    filenameKey = ownMatricule;
  } else {
    const targetEmployee = await prisma.employee.findUnique({
      where: { matricule: suppliedMatricule },
      select: { id: true, deletedAt: true },
    });

    if (targetEmployee?.deletedAt) {
      throw new AppError("Employé non trouvé.", 404);
    }

    if (targetEmployee) {
      if (!hasEmployeePermission(req.user, "UPDATE")) {
        throw new AppError("Vous n'avez pas le droit de modifier cet avatar.", 403);
      }
      filenameKey = suppliedMatricule;
    } else {
      if (!hasEmployeePermission(req.user, "CREATE")) {
        throw new AppError("Vous n'avez pas le droit de créer cet avatar.", 403);
      }
      filenameKey = suppliedMatricule;
    }
  }

  if (!filenameKey) {
    throw new AppError("Un matricule valide est nécessaire pour l'avatar.", 400);
  }

  const filename = `${filenameKey}${extension}`;
  const targetPath = path.join(uploadDir, filename);
  await fs.promises.writeFile(targetPath, req.file.buffer, { flag: "w" });

  const previousFilename = path.basename(req.body?.previousUrl || "");
  const previousExtensions = new Set([".jpg", ".jpeg", ".png", ".webp"]);
  const previousExtension = path.extname(previousFilename).toLowerCase();
  if (
    previousFilename !== filename &&
    previousFilename.startsWith(`${filenameKey}.`) &&
    previousExtensions.has(previousExtension)
  ) {
    try {
      await fs.promises.unlink(path.join(uploadDir, previousFilename));
    } catch (cleanupError) {
      if (cleanupError.code !== "ENOENT") {
        logger.error("Échec de la suppression de l'ancien avatar :", cleanupError);
      }
    }
  }

  const baseUrl = process.env.APP_URL || `${req.protocol}://${req.get("host")}`;
  const url = `${baseUrl}/uploads/avatars/${filename}`;

  res.status(201).json({
    status: "success",
    data: { url },
  });
});

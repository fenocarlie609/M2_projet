// src/modules/uploads/upload.controller.js
const path = require("path");
const fs = require("fs");
const catchAsync = require("../../common/utils/catchAsync");
const AppError = require("../../common/utils/AppError");
const logger = require("../../config/logger");
const { uploadDir } = require("../../common/middlewares/upload.middleware");

exports.uploadAvatar = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError("Aucun fichier reçu.", 400));
  }

  // Si le front nous indique l'URL de l'ancienne photo (changement d'extension,
  // de matricule, etc.), on la supprime pour ne pas accumuler des fichiers
  // orphelins sur le serveur. Si le nouveau fichier a le même nom que l'ancien
  // (cas normal : même matricule, même extension), il l'a déjà écrasé et il
  // n'y a rien à faire.
  if (req.body.previousUrl) {
    try {
      const previousFilename = path.basename(req.body.previousUrl);
      if (previousFilename && previousFilename !== req.file.filename) {
        const previousPath = path.join(uploadDir, previousFilename);
        if (fs.existsSync(previousPath)) {
          fs.unlinkSync(previousPath);
        }
      }
    } catch (err) {
      // Un échec de nettoyage ne doit jamais faire échouer l'upload
      logger.error("Échec de la suppression de l'ancienne photo :", err);
    }
  }

  const baseUrl = process.env.APP_URL || `${req.protocol}://${req.get("host")}`;
  const url = `${baseUrl}/uploads/avatars/${req.file.filename}`;

  res.status(201).json({
    status: "success",
    data: { url },
  });
});

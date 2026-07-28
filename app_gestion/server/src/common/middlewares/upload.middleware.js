// src/common/middlewares/upload.middleware.js
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const AppError = require("../utils/AppError");

// Dossier physique où sont stockées les photos : <projet>/public/uploads/avatars
const uploadDir = path.join(__dirname, "../../../public/uploads/avatars");
fs.mkdirSync(uploadDir, { recursive: true });

// Nettoie le matricule pour en faire un nom de fichier sûr (pas de / \ espace etc.)
const sanitizeForFilename = (value) =>
  value
    .toString()
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9_-]/g, "");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();

    // IMPORTANT : req.body.matricule n'est disponible ici que si le champ
    // "matricule" a été ajouté au FormData AVANT le champ "avatar" côté front.
    const rawMatricule = req.body?.matricule;

    if (rawMatricule) {
      const safeMatricule = sanitizeForFilename(rawMatricule);
      // Nom fixe par matricule : un nouvel upload pour le même employé
      // écrase directement l'ancien fichier au lieu d'en créer un nouveau.
      return cb(null, `${safeMatricule}${ext}`);
    }

    // Fallback si aucun matricule n'est fourni (ne devrait pas arriver si le
    // front est bien câblé, mais on évite de planter l'upload pour autant)
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  },
});

const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];

const fileFilter = (req, file, cb) => {
  if (!allowedMimeTypes.includes(file.mimetype)) {
    return cb(
      new AppError(
        "Format d'image non supporté (JPEG, PNG ou WEBP uniquement).",
        400,
      ),
    );
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 Mo max
});

module.exports = { upload, uploadDir };

// src/common/middlewares/upload.middleware.js
const multer = require("multer");
const fs = require("fs");
const path = require("path");
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

const detectImageExtension = (buffer) => {
  if (
    buffer?.length >= 3 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff
  ) {
    return ".jpg";
  }

  if (
    buffer?.length >= 8 &&
    buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
  ) {
    return ".png";
  }

  if (
    buffer?.length >= 12 &&
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP"
  ) {
    return ".webp";
  }

  return null;
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 Mo max
});

module.exports = { upload, uploadDir, sanitizeForFilename, detectImageExtension };

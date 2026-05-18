// src/common/utils/password.utils.js
const bcrypt = require("bcryptjs");

/**
 * Hache un mot de passe en utilisant un salage (salt) de 10 tours
 * @param {string} password - Le mot de passe en clair
 * @returns {Promise<string>} Le mot de passe haché
 */
const hashPassword = async (password) => {
  if (!password) return null;
  return await bcrypt.hash(password, 10);
};

/**
 * Compare un mot de passe en clair avec un mot de passe haché de la base de données
 * @param {string} password - Le mot de passe en clair à vérifier
 * @param {string} hashedPassword - Le mot de passe haché stocké
 * @returns {Promise<boolean>} True si les mots de passe correspondent, sinon False
 */
const comparePassword = async (password, hashedPassword) => {
  if (!password || !hashedPassword) return false;
  return await bcrypt.compare(password, hashedPassword);
};

module.exports = {
  hashPassword,
  comparePassword,
};

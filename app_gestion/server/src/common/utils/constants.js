// src/common/utils/constants.js

const APP_ACTIONS = {
  CREATE: "CREATE",
  READ: "READ",
  UPDATE: "UPDATE",
  DELETE: "DELETE",
  ALL: "*", // Ton joker / wildcard
};

// La position d'une marchandise designe le quai de chargement au port de
// Toamasina. Ces trois quais sont les seules positions possibles.
const QUAIS_TOAMASINA = ["QUAI 1", "QUAI 2", "QUAI 3"];

module.exports = { APP_ACTIONS, QUAIS_TOAMASINA };

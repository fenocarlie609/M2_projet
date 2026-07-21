// src/common/utils/constants.js

const APP_MODULES = {
  EMPLOYEES: "EMPLOYEES",
  CHARGEMENT: "CHARGEMENT",
  AUDIT: "AUDIT",
  CLIENTS: "CLIENTS",
  DRIVERS: "DRIVERS",
  ALL: "*",
};

const APP_ACTIONS = {
  CREATE: "CREATE",
  READ: "READ",
  UPDATE: "UPDATE",
  DELETE: "DELETE",
  ALL: "*", // Ton joker / wildcard
};

module.exports = { APP_MODULES, APP_ACTIONS };

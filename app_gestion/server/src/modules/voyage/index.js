// src/modules/voyage/index.js
const voyageRoutes = require("./voyage.route");
const voyageController = require("./voyage.controller");
const voyageService = require("./voyage.service");

module.exports = {
  voyageRoutes,
  voyageController,
  voyageService,
};

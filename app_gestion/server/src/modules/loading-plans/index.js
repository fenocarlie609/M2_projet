const loadingPlanRoutes = require("./loading-plan.routes");
const loadingPlanController = require("./loading-plan.controller");
const loadingPlanService = require("./loading-plan.service");
const loadController = require("./load.controller");
const loadService = require("./load.service");

// Les routes des lignes de marchandises sont montees par le plan
// (/loading-plans/:id/loads) : il n'existe pas de route /loads autonome.
module.exports = {
  loadingPlanRoutes,
  loadingPlanController,
  loadingPlanService,
  loadController,
  loadService,
};

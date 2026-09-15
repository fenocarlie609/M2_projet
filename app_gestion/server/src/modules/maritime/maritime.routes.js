const express = require("express");
const authMiddleware = require("../../common/middlewares/auth.middleware");
const validate = require("../../common/middlewares/validate.middleware");
const { APP_ACTIONS } = require("../../common/utils/constants");
const controller = require("./maritime.controller");
const {
  vesselValidation,
  portValidation,
  voyageValidation,
  vehicleValidation,
} = require("./maritime.validation");

const router = express.Router();
router.use(authMiddleware.protect);

const registerCrudRoutes = ({ path, resource, label, module, validation }) => {
  router
    .route(path)
    .get(
      authMiddleware.authorize(module, APP_ACTIONS.READ),
      controller.getAll(resource),
    )
    .post(
      authMiddleware.authorize(module, APP_ACTIONS.CREATE),
      validate(validation.create),
      controller.create(resource, label),
    );

  router
    .route(`${path}/:id`)
    .get(
      authMiddleware.authorize(module, APP_ACTIONS.READ),
      controller.getById(resource, label),
    )
    .put(
      authMiddleware.authorize(module, APP_ACTIONS.UPDATE),
      validate(validation.update),
      controller.update(resource, label),
    )
    .delete(
      authMiddleware.authorize(module, APP_ACTIONS.DELETE),
      controller.remove(resource, label),
    );
};

registerCrudRoutes({
  path: "/vessels",
  resource: "vessel",
  label: "Navire",
  module: "VESSELS",
  validation: vesselValidation,
});
registerCrudRoutes({
  path: "/ports",
  resource: "port",
  label: "Port",
  module: "PORTS",
  validation: portValidation,
});
registerCrudRoutes({
  path: "/voyages",
  resource: "voyage",
  label: "Voyage",
  module: "LOADING_PLANS",
  validation: voyageValidation,
});
registerCrudRoutes({
  path: "/vehicles",
  resource: "vehicle",
  label: "Véhicule",
  module: "VEHICLES",
  validation: vehicleValidation,
});

module.exports = router;

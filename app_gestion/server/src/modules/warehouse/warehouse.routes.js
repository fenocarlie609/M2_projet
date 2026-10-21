// src/modules/warehouse/warehouse.routes.js
const express = require("express");
const authMiddleware = require("../../common/middlewares/auth.middleware");
const validate = require("../../common/middlewares/validate.middleware");
const { warehouseValidation } = require("./warehouse.validation");
const { APP_ACTIONS } = require("../../common/utils/constants");
const controller = require("./warehouse.controller");

const router = express.Router();

router.use(authMiddleware.protect);

// --- Marchandises en entrepot ---
// Les routes litterales sont declarees avant les routes parametrees, afin
// qu'elles ne soient pas interpretees comme un identifiant.
router.get(
  "/items/movements",
  authMiddleware.authorize("ENTREPOTS", APP_ACTIONS.READ),
  controller.getMovements,
);

router.get(
  "/items/disponibles",
  authMiddleware.authorize("ENTREPOTS", APP_ACTIONS.READ),
  controller.getAvailableItems,
);

router.get(
  "/items",
  authMiddleware.authorize("ENTREPOTS", APP_ACTIONS.READ),
  controller.getItems,
);

router.post(
  "/items",
  authMiddleware.authorize("ENTREPOTS", APP_ACTIONS.CREATE),
  validate(warehouseValidation.item),
  controller.createItem,
);

router.post(
  "/items/:id/pickup",
  authMiddleware.authorize("ENTREPOTS", APP_ACTIONS.UPDATE),
  validate(warehouseValidation.pickup),
  controller.pickupItem,
);

router.post(
  "/items/:id/embark",
  authMiddleware.authorize("ENTREPOTS", APP_ACTIONS.UPDATE),
  validate(warehouseValidation.embark),
  controller.embarkItem,
);

router.get(
  "/items/:id",
  authMiddleware.authorize("ENTREPOTS", APP_ACTIONS.READ),
  controller.getItem,
);

// --- Entrepots ---
router
  .route("/")
  .get(
    authMiddleware.authorize("ENTREPOTS", APP_ACTIONS.READ),
    controller.getWarehouses,
  )
  .post(
    authMiddleware.authorize("ENTREPOTS", APP_ACTIONS.CREATE),
    validate(warehouseValidation.create),
    controller.createWarehouse,
  );

router
  .route("/:id")
  .get(
    authMiddleware.authorize("ENTREPOTS", APP_ACTIONS.READ),
    controller.getWarehouse,
  )
  .put(
    authMiddleware.authorize("ENTREPOTS", APP_ACTIONS.UPDATE),
    validate(warehouseValidation.update),
    controller.updateWarehouse,
  )
  .delete(
    authMiddleware.authorize("ENTREPOTS", APP_ACTIONS.DELETE),
    controller.deleteWarehouse,
  );

module.exports = router;

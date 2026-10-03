const express = require("express");
const voyageController = require("./voyage.controller");
const authMiddleware = require("../../common/middlewares/auth.middleware");
const validate = require("../../common/middlewares/validate.middleware");
const { voyageValidation } = require("./voyage.validation");
const { APP_ACTIONS } = require("../../common/utils/constants");

const router = express.Router();

// Protéger toutes les routes avec l'authentification
router.use(authMiddleware.protect);

router
  .route("/")
  .get(voyageController.getAllVoyages)
  .post(
    authMiddleware.authorize("VOYAGES", APP_ACTIONS.CREATE),
    validate(voyageValidation.create),
    voyageController.createVoyage,
  );

router
  .route("/:id")
  .get(voyageController.getVoyageById)
  .put(
    authMiddleware.authorize("VOYAGES", APP_ACTIONS.UPDATE),
    validate(voyageValidation.update),
    voyageController.updateVoyage,
  )
  .delete(
    authMiddleware.authorize("VOYAGES", APP_ACTIONS.DELETE),
    voyageController.deleteVoyage,
  );

module.exports = router;

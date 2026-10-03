const express = require("express");
const loadController = require("./load.controller");
const authMiddleware = require("../../common/middlewares/auth.middleware");
const validate = require("../../common/middlewares/validate.middleware");
const { loadValidation } = require("./load.validation");
const { APP_ACTIONS } = require("../../common/utils/constants");

const router = express.Router();

// Protéger toutes les routes avec l'authentification
router.use(authMiddleware.protect);

router
  .route("/")
  .get(loadController.getAllLoads)
  .post(
    authMiddleware.authorize("LOADING_PLANS", APP_ACTIONS.CREATE),
    validate(loadValidation.create),
    loadController.createLoad,
  );

router
  .route("/:id")
  .get(loadController.getLoadById)
  .put(
    authMiddleware.authorize("LOADING_PLANS", APP_ACTIONS.UPDATE),
    validate(loadValidation.update),
    loadController.updateLoad,
  )
  .delete(
    authMiddleware.authorize("LOADING_PLANS", APP_ACTIONS.DELETE),
    loadController.deleteLoad,
  );

module.exports = router;

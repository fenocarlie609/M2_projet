const express = require("express");
const authMiddleware = require("../../common/middlewares/auth.middleware");
const validate = require("../../common/middlewares/validate.middleware");
const { APP_ACTIONS } = require("../../common/utils/constants");
const controller = require("./loading-plan.controller");
const { LoadValidation, loadValidation } = require("./loading-plan.validation");

const router = express.Router();
router.use(authMiddleware.protect);

router
  .route("/")
  .get(
    authMiddleware.authorize("LOADING_PLANS", APP_ACTIONS.READ),
    controller.getAll,
  )
  .post(
    authMiddleware.authorize("LOADING_PLANS", APP_ACTIONS.CREATE),
    validate(LoadValidation.create),
    controller.create,
  );

router.get(
  "/reference/:reference",
  authMiddleware.authorize("LOADING_PLANS", APP_ACTIONS.READ),
  controller.getByReference,
);

router
  .route("/:id")
  .get(
    authMiddleware.authorize("LOADING_PLANS", APP_ACTIONS.READ),
    controller.getById,
  )
  .put(
    authMiddleware.authorize("LOADING_PLANS", APP_ACTIONS.UPDATE),
    validate(LoadValidation.update),
    controller.update,
  )
  .delete(
    authMiddleware.authorize("LOADING_PLANS", APP_ACTIONS.DELETE),
    controller.remove,
  );

router.post(
  "/:id/loads",
  authMiddleware.authorize("CARGO", APP_ACTIONS.CREATE),
  validate(loadValidation.create),
  controller.createLoad,
);

router
  .route("/:id/loads/:loadId")
  .put(
    authMiddleware.authorize("CARGO", APP_ACTIONS.UPDATE),
    validate(loadValidation.update),
    controller.updateLoad,
  )
  .delete(
    authMiddleware.authorize("CARGO", APP_ACTIONS.DELETE),
    controller.removeLoad,
  );

router.post(
  "/:id/validate",
  authMiddleware.authorize("LOADING_PLANS", APP_ACTIONS.UPDATE),
  controller.validate,
);

module.exports = router;

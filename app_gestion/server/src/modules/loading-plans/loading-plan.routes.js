const express = require("express");
const authMiddleware = require("../../common/middlewares/auth.middleware");
const validate = require("../../common/middlewares/validate.middleware");
const { APP_ACTIONS } = require("../../common/utils/constants");
const controller = require("./loading-plan.controller");
const { planValidation, lineValidation } = require("./loading-plan.validation");

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
    validate(planValidation.create),
    controller.create,
  );

router
  .route("/:id")
  .get(
    authMiddleware.authorize("LOADING_PLANS", APP_ACTIONS.READ),
    controller.getById,
  )
  .put(
    authMiddleware.authorize("LOADING_PLANS", APP_ACTIONS.UPDATE),
    validate(planValidation.update),
    controller.update,
  )
  .delete(
    authMiddleware.authorize("LOADING_PLANS", APP_ACTIONS.DELETE),
    controller.remove,
  );

router.post(
  "/:id/lines",
  authMiddleware.authorize("CARGO", APP_ACTIONS.CREATE),
  validate(lineValidation.create),
  controller.createLine,
);

router
  .route("/:id/lines/:lineId")
  .put(
    authMiddleware.authorize("CARGO", APP_ACTIONS.UPDATE),
    validate(lineValidation.update),
    controller.updateLine,
  )
  .delete(
    authMiddleware.authorize("CARGO", APP_ACTIONS.DELETE),
    controller.removeLine,
  );

router.post(
  "/:id/validate",
  authMiddleware.authorize("LOADING_PLANS", APP_ACTIONS.UPDATE),
  controller.validate,
);

module.exports = router;

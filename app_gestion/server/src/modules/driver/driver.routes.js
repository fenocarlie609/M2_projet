// src/features/driver/driver.routes.js
const express = require("express");
const driverController = require("./driver.controller");
const authMiddleware = require("../../common/middlewares/auth.middleware");
const validate = require("../../common/middlewares/validate.middleware");
const { driverValidation } = require("./driver.validation");
const { APP_ACTIONS } = require("../../common/utils/constants");

const router = express.Router();

router.use(authMiddleware.protect);

router
  .route("/")
  .get(
    authMiddleware.authorize("DRIVER", APP_ACTIONS.READ),
    driverController.getAll,
  )
  .post(
    authMiddleware.authorize("DRIVER", APP_ACTIONS.CREATE),
    validate(driverValidation.create),
    driverController.create,
  );

router
  .route("/:id")
  .get(
    authMiddleware.authorize("DRIVER", APP_ACTIONS.READ),
    driverController.getById,
  )
  .put(
    authMiddleware.authorize("DRIVER", APP_ACTIONS.UPDATE),
    validate(driverValidation.update),
    driverController.update,
  )
  .delete(
    authMiddleware.authorize("DRIVER", APP_ACTIONS.DELETE),
    driverController.delete,
  );

module.exports = router;

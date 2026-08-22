// src/features/client/client.routes.js
const express = require("express");
const clientController = require("./client.controller");
const authMiddleware = require("../../common/middlewares/auth.middleware");
const validate = require("../../common/middlewares/validate.middleware");
const { clientValidation } = require("./client.validation");
const { APP_ACTIONS } = require("../../common/utils/constants");

const router = express.Router();

// Injection systématique de req.user
router.use(authMiddleware.protect);

router
  .route("/")
  .get(
    authMiddleware.authorize("CLIENTS", APP_ACTIONS.READ),
    clientController.getAll,
  )
  .post(
    authMiddleware.authorize("CLIENTS", APP_ACTIONS.CREATE),
    validate(clientValidation.create),
    clientController.create,
  );

router
  .route("/:id")
  .get(
    authMiddleware.authorize("CLIENTS", APP_ACTIONS.READ),
    clientController.getById,
  )
  .put(
    authMiddleware.authorize("CLIENTS", APP_ACTIONS.UPDATE),
    validate(clientValidation.update),
    clientController.update,
  )
  .delete(
    authMiddleware.authorize("CLIENTS", APP_ACTIONS.DELETE),
    clientController.delete,
  );

module.exports = router;

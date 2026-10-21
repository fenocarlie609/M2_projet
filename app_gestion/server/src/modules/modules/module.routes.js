// src/modules/modules/module.routes.js
const express = require("express");
const moduleController = require("./module.controller");
const authMiddleware = require("../../common/middlewares/auth.middleware");
const validate = require("../../common/middlewares/validate.middleware");
const { moduleValidation } = require("./module.validation");
const { APP_ACTIONS } = require("../../common/utils/constants");

const router = express.Router();

router.use(authMiddleware.protect);

// Lecture : utile pour peupler le <Select> du formulaire de permissions,
// donc accessible à tout employé authentifié (pas seulement l'IT).
router.get("/", moduleController.getAll);
router.get("/:id", moduleController.getById);

// Création, modification et suppression : elles suivent le systeme de
// permissions, comme les autres modules. Le droit MODULE est donc
// significatif et peut etre accorde a un compte non technique.
router.post(
  "/",
  authMiddleware.authorize("MODULE", APP_ACTIONS.CREATE),
  validate(moduleValidation.create),
  moduleController.create,
);

router.put(
  "/:id",
  authMiddleware.authorize("MODULE", APP_ACTIONS.UPDATE),
  validate(moduleValidation.update),
  moduleController.update,
);

router.delete(
  "/:id",
  authMiddleware.authorize("MODULE", APP_ACTIONS.DELETE),
  moduleController.delete,
);

module.exports = router;

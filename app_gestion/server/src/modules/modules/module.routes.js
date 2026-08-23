const express = require("express");
const moduleController = require("./module.controller");
const authMiddleware = require("../../common/middlewares/auth.middleware");
const restrictToDepartment = require("../../common/middlewares/restrictToDepartment.middleware");
const validate = require("../../common/middlewares/validate.middleware");
const { moduleValidation } = require("./module.validation");

const router = express.Router();

router.use(authMiddleware.protect);

// Lecture : utile pour peupler le <Select> du formulaire de permissions,
// donc accessible à tout employé authentifié (pas seulement l'IT).
router.get("/", moduleController.getAll);
router.get("/:id", moduleController.getById);

// Création, modification, suppression : réservées à l'IT, comme le reste de
// la gestion des accès.
router.post(
  "/",
  restrictToDepartment("TECH"),
  validate(moduleValidation.create),
  moduleController.create,
);

router.put(
  "/:id",
  restrictToDepartment("TECH"),
  validate(moduleValidation.update),
  moduleController.update,
);

router.delete("/:id", restrictToDepartment("TECH"), moduleController.delete);

module.exports = router;

// src/features/company-structure/company-structure.routes.js
const express = require("express");
const companyStructureController = require("./company-structure.controller");
const authMiddleware = require("../../common/middlewares/auth.middleware");
const validate = require("../../common/middlewares/validate.middleware");
const {
  companyStructureValidation,
} = require("./company-structure.validation");
const { APP_MODULES, APP_ACTIONS } = require("../../common/utils/constants");

const router = express.Router();

// Protéger toutes les routes de ce module
router.use(authMiddleware.protect);

// Route principale pour alimenter le formulaire de création d'employé
router
  .route("/")
  .get(companyStructureController.getStructure)
  .post(
    authMiddleware.authorize(APP_MODULES.EMPLOYEES, APP_ACTIONS.CREATE),
    validate(companyStructureValidation.createDepartment),
    companyStructureController.createDepartment,
  );

router.route("/:id").get(companyStructureController.getDepartment);

// Ajouter un poste au sein d'un département existant
router
  .route("/:departmentId/positions")
  .post(
    authMiddleware.authorize(APP_MODULES.EMPLOYEES, APP_ACTIONS.CREATE),
    validate(companyStructureValidation.createPosition),
    companyStructureController.createPosition,
  );

module.exports = router;

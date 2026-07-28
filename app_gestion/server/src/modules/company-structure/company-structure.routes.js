// src/modules/company-structure/company-structure.routes.js
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
// (renvoie tous les départements actifs + leurs postes actifs)
router.route("/").get(companyStructureController.getStructure);

// --- Départements ---
// NB: ces chemins sont préfixés par "/departments" pour matcher exactement
// les appels faits depuis companyStructure.service.js côté front.
router
  .route("/departments")
  .post(
    authMiddleware.authorize(APP_MODULES.EMPLOYEES, APP_ACTIONS.CREATE),
    validate(companyStructureValidation.createDepartment),
    companyStructureController.createDepartment,
  );

router
  .route("/departments/:id")
  .get(companyStructureController.getDepartment)
  .put(
    authMiddleware.authorize(APP_MODULES.EMPLOYEES, APP_ACTIONS.UPDATE),
    validate(companyStructureValidation.updateDepartment),
    companyStructureController.updateDepartment,
  )
  .delete(
    authMiddleware.authorize(APP_MODULES.EMPLOYEES, APP_ACTIONS.DELETE),
    companyStructureController.deleteDepartment,
  );

// --- Postes ---
// createPosition reçoit departmentId dans le body (comme envoyé par
// CompanyStructurePage.jsx: onPositionCreated -> { ...data, departmentId })
router
  .route("/positions")
  .post(
    authMiddleware.authorize(APP_MODULES.EMPLOYEES, APP_ACTIONS.CREATE),
    validate(companyStructureValidation.createPosition),
    companyStructureController.createPosition,
  );

router
  .route("/positions/:id")
  .put(
    authMiddleware.authorize(APP_MODULES.EMPLOYEES, APP_ACTIONS.UPDATE),
    validate(companyStructureValidation.updatePosition),
    companyStructureController.updatePosition,
  )
  .delete(
    authMiddleware.authorize(APP_MODULES.EMPLOYEES, APP_ACTIONS.DELETE),
    companyStructureController.deletePosition,
  );

module.exports = router;

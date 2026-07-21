const express = require("express");
const employeeController = require("./employee.controller");
const authMiddleware = require("../../common/middlewares/auth.middleware");
const {
  isSelfOrAuthorized,
} = require("../../common/middlewares/owner.middleware");
const validate = require("../../common/middlewares/validate.middleware");
const { employeeValidation } = require("./employee.validation");
const { APP_MODULES, APP_ACTIONS } = require("../../common/utils/constants");

const router = express.Router();

// Tout le module employees nécessite d'être connecté
// router.use(authMiddleware.protect);

router
  .route("/")
  .get(
    authMiddleware.authorize(APP_MODULES.EMPLOYEES, APP_ACTIONS.READ),
    employeeController.getAll,
  )
  .post(
    /*authMiddleware.authorize(APP_MODULES.EMPLOYEES, APP_ACTIONS.CREATE),*/
    validate(employeeValidation.create),
    employeeController.create,
  );

router
  .route("/:id")
  .get(
    isSelfOrAuthorized(APP_MODULES.EMPLOYEES, APP_ACTIONS.READ),
    employeeController.getById,
  )
  .put(
    isSelfOrAuthorized(APP_MODULES.EMPLOYEES, APP_ACTIONS.UPDATE),
    validate(employeeValidation.update),
    employeeController.update,
  )
  .delete(
    authMiddleware.authorize(APP_MODULES.EMPLOYEES, APP_ACTIONS.DELETE),
    employeeController.delete,
  );

// Gestion des permissions individuelles d'un employé (jamais sur soi-même,
// donc pas de isSelfOrAuthorized ici : toujours la vraie permission requise)
router
  .route("/:id/permissions")
  .post(
    authMiddleware.authorize(APP_MODULES.EMPLOYEES, APP_ACTIONS.UPDATE),
    validate(employeeValidation.assignPermission),
    employeeController.assignPermission,
  );

router
  .route("/:id/permissions/:permissionId")
  .delete(
    authMiddleware.authorize(APP_MODULES.EMPLOYEES, APP_ACTIONS.UPDATE),
    employeeController.revokePermission,
  );

module.exports = router;

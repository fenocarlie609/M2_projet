// src/modules/users/user.routes.js
const express = require("express");
const userController = require("./user.controller");
const authMiddleware = require("../../common/middlewares/auth.middleware");
const restrictToDepartment = require("../../common/middlewares/restrictToDepartment.middleware");
const validate = require("../../common/middlewares/validate.middleware");
const { userValidation } = require("./user.validation");
const { APP_ACTIONS } = require("../../common/utils/constants");

const router = express.Router();

// Authentification obligatoire + réservé au département IT ("TECH").
// La gestion des accès suit par ailleurs le systeme de permissions : chaque
// route exige le droit correspondant sur le module USERS.
router.use(authMiddleware.protect);
router.use(restrictToDepartment("TECH"));

router.get(
  "/",
  authMiddleware.authorize("USERS", APP_ACTIONS.READ),
  userController.getAll,
);
// ⚠️ Ces routes littérales doivent rester déclarées AVANT "/:id" pour ne
// pas être interprétées comme un id.
router.get(
  "/pending",
  authMiddleware.authorize("USERS", APP_ACTIONS.READ),
  userController.getPending,
);
router.get(
  "/permissions",
  authMiddleware.authorize("USERS", APP_ACTIONS.READ),
  userController.getAllPermissions,
);
router.get(
  "/:id",
  authMiddleware.authorize("USERS", APP_ACTIONS.READ),
  userController.getById,
);

router
  .route("/:id/access")
  .post(
    authMiddleware.authorize("USERS", APP_ACTIONS.CREATE),
    validate(userValidation.grantAccess),
    userController.grantAccess,
  )
  .patch(
    authMiddleware.authorize("USERS", APP_ACTIONS.UPDATE),
    validate(userValidation.updateAccess),
    userController.updateAccess,
  )
  .delete(
    authMiddleware.authorize("USERS", APP_ACTIONS.DELETE),
    userController.revokeAccess,
  );

router
  .route("/:id/permissions")
  .post(
    authMiddleware.authorize("USERS", APP_ACTIONS.UPDATE),
    validate(userValidation.assignPermission),
    userController.assignPermission,
  )
  // Révocation groupée : body { permissionIds: [...] }
  .delete(
    authMiddleware.authorize("USERS", APP_ACTIONS.UPDATE),
    validate(userValidation.revokeMany),
    userController.revokeManyPermissions,
  );

router
  .route("/:id/permissions/:permissionId")
  .delete(
    authMiddleware.authorize("USERS", APP_ACTIONS.DELETE),
    userController.revokePermission,
  );

module.exports = router;

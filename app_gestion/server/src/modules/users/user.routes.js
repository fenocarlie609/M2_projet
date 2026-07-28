const express = require("express");
const userController = require("./user.controller");
const authMiddleware = require("../../common/middlewares/auth.middleware");
const restrictToDepartment = require("../../common/middlewares/restrictToDepartment.middleware");
const validate = require("../../common/middlewares/validate.middleware");
const { userValidation } = require("./user.validation");

const router = express.Router();

// Authentification obligatoire + réservé au département IT ("TECH")
router.use(authMiddleware.protect);
router.use(restrictToDepartment("TECH"));

router.get("/", userController.getAll);
// ⚠️ Ces routes littérales doivent rester déclarées AVANT "/:id" pour ne
// pas être interprétées comme un id.
router.get("/pending", userController.getPending);
router.get("/permissions", userController.getAllPermissions);
router.get("/:id", userController.getById);

router
  .route("/:id/access")
  .post(validate(userValidation.grantAccess), userController.grantAccess)
  .patch(validate(userValidation.updateAccess), userController.updateAccess)
  .delete(userController.revokeAccess);

router
  .route("/:id/permissions")
  .post(
    validate(userValidation.assignPermission),
    userController.assignPermission,
  )
  // Révocation groupée : body { permissionIds: [...] }
  // ⚠️ Manquait dans le fichier uploadé.
  .delete(
    validate(userValidation.revokeMany),
    userController.revokeManyPermissions,
  );

router
  .route("/:id/permissions/:permissionId")
  .delete(userController.revokePermission);

module.exports = router;

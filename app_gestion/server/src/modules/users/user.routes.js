// src/modules/users/user.routes.js
const express = require("express");
const userController = require("./user.controller");
const authMiddleware = require("../../common/middlewares/auth.middleware");
const { isOwnerOrAdmin } = require("../../common/middlewares/owner.middleware");
const validate = require("../../common/middlewares/validate.middleware");
const schemas = require("../../common/utils/validation.schemas");

const router = express.Router();

// 1. Route publique : Création de compte / Inscription
router.post(
  "/register",
  validate(schemas.user.register),
  userController.register,
);

// 2. Barrière de Sécurité Globale : Toutes les routes en dessous nécessitent d'être connecté
router.use(authMiddleware.protect);

// 3. Route accessible uniquement par l'ADMIN pour lister les utilisateurs
router
  .route("/")
  .get(
    authMiddleware.restrictTo("ADMIN", "SUPERADMIN"),
    userController.getUsers,
  );

// 4. Routes pour modifier ou supprimer un utilisateur spécifique (Réservé à l'ADMIN)
router
  .route("/:id")
  .put(
    isOwnerOrAdmin, // Applique la hiérarchie (Superadmin > Admin > User)
    validate(schemas.user.update),
    userController.update,
  )
  .delete(
    isOwnerOrAdmin, // Empêche aussi un ADMIN de supprimer un SUPERADMIN
    validate(schemas.user.delete),
    userController.delete,
  );

module.exports = router;

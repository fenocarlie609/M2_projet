const express = require("express");
const {
  authLimiter,
} = require("../../common/middlewares/rateLimiter.middleware");
const authMiddleware = require("../../common/middlewares/auth.middleware");
const validate = require("../../common/middlewares/validate.middleware");
const { authValidation } = require("./auth.validation");
const authController = require("./auth.controller");

const router = express.Router();

// NOTE : la route publique "/register" a été retirée.
// Les employés ne s'auto-inscrivent plus : ils sont créés par un admin
// via POST /api/v1/employees (voir module employees).

router.post(
  "/login",
  authLimiter,
  validate(authValidation.login),
  authController.login,
);

router.get("/me", authMiddleware.protect, authController.me);
router.get("/test", authMiddleware.protect, authController.test);
router.post("/logout", authController.logout);

module.exports = router;

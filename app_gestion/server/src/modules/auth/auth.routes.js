const express = require("express");
const {
  authLimiter,
} = require("../../common/middlewares/rateLimiter.middleware");
const authMiddleware = require("../../common/middlewares/auth.middleware");
const validate = require("../../common/middlewares/validate.middleware");
const schemas = require("../../common/utils/validation.schemas");
const authController = require("./auth.controller");

const router = express.Router();

router.post(
  "/login",
  authLimiter,
  validate(schemas.auth.login),
  authController.login,
);

router.get("/me", authMiddleware.protect, authController.me);
router.post("/logout", authController.logout);

module.exports = router;

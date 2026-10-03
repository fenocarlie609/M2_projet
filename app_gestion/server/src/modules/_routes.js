// src/modules/_routes.js
const express = require("express");
const logger = require("../config/logger");
const { verifyCsrf } = require("../common/middlewares/csrf.middleware");
const router = express.Router();

router.get("/health", (req, res) => {
  logger.info("Route /health appelée");
  res.status(200).json({
    status: "success",
    message: "L'API fonctionne parfaitement.",
    timestamp: new Date().toISOString(),
  });
});

router.use((req, res, next) => {
  const mutatingMethods = ["POST", "PUT", "PATCH", "DELETE"];
  const csrfExemptedPaths = ["/auth/login", "/auth/csrf-token"];

  if (
    !mutatingMethods.includes(req.method) ||
    csrfExemptedPaths.includes(req.path)
  ) {
    return next();
  }

  return verifyCsrf(req, res, next);
});

// Exemples de futures intégrations de modules :
const authRoutes = require("./auth/auth.routes");
const { employeeRoutes } = require("./employees");
const { companyStructureRoutes } = require("./company-structure");
const { userRoutes } = require("./users");
const { uploadRoutes } = require("./uploads");
const { moduleRoutes } = require("./modules");
const { clientRoutes } = require("./clients");
const { driverRoutes } = require("./driver");
const { notificationRoutes } = require("./notifications");
const { maritimeRoutes } = require("./maritime");
const { loadingPlanRoutes } = require("./loading-plans");
const { voyageRoutes } = require("./voyage");

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/employees", employeeRoutes);
router.use("/company-structure", companyStructureRoutes);
router.use("/modules", moduleRoutes);
router.use("/uploads", uploadRoutes);
router.use("/clients", clientRoutes);
// router.use("/drivers", driverRoutes);
router.use("/notifications", notificationRoutes);
router.use("/maritime", maritimeRoutes);
router.use("/loading-plans", loadingPlanRoutes);
router.use("/voyages", voyageRoutes);

module.exports = router;

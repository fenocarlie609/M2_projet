// src/modules/_routes.js
const express = require("express");
const logger = require("../config/logger");
const router = express.Router();

router.get("/health", (req, res) => {
  logger.info("Route /health appelée");
  res.status(200).json({
    status: "success",
    message: "L'API fonctionne parfaitement.",
    timestamp: new Date().toISOString(),
  });
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

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/employees", employeeRoutes);
router.use("/company-structure", companyStructureRoutes);
router.use("/modules", moduleRoutes);
router.use("/uploads", uploadRoutes);
router.use("/clients", clientRoutes);
router.use("/drivers", driverRoutes);
router.use("/notifications", notificationRoutes);

module.exports = router;

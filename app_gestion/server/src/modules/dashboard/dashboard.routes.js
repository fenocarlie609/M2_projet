// src/modules/dashboard/dashboard.routes.js
const express = require("express");
const authMiddleware = require("../../common/middlewares/auth.middleware");
const dashboardController = require("./dashboard.controller");

const router = express.Router();

// Le tableau de bord est accessible a tout employe connecte : son contenu
// est filtre par les permissions de l'utilisateur, bloc par bloc.
router.use(authMiddleware.protect);

router.route("/summary").get(dashboardController.getSummary);

module.exports = router;

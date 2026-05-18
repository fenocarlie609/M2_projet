// src/modules/_routes.js
const express = require("express");
const router = express.Router();

// Route de test globale pour vérifier que l'API répond
router.get("/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "L'API fonctionne parfaitement.",
    timestamp: new Date().toISOString(),
  });
});

// Exemples de futures intégrations de modules :
// const authRoutes = require('./auth/auth.routes');
// const userRoutes = require('./users/users.routes');
// router.use('/auth', authRoutes);
// router.use('/users', userRoutes);

module.exports = router;

const express = require("express");
const cors = require("cors");

const app = express();

// Middlewares globaux
app.use(cors());
app.use(express.json());

// Route de test de l'API
app.get("/ping", (req, res) => {
  res.status(200).json({ message: "L'API modulaire fonctionne parfaitement." });
});

module.exports = app;

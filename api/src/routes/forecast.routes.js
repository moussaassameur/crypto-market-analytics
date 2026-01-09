const express = require("express");
const router = express.Router();
const forecastController = require("../controllers/forecast.controller");

// GET /api/forecast/:symbol - Génère des prévisions de prix
// Query params: days (1-30), model (linear, sma, ema, combined)
router.get("/:symbol", forecastController.getForecast);

// GET /api/forecast/:symbol/indicators - Retourne les indicateurs techniques
router.get("/:symbol/indicators", forecastController.getIndicators);

module.exports = router;

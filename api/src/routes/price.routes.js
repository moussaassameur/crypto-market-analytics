const express = require("express");
const router = express.Router();

const priceController = require("../controllers/price.controller");

router.get("/cryptos/latest", priceController.getLatest);
router.get("/cryptos/:symbol/prices", priceController.getHistoryBySymbol);
router.get("/cryptos/:symbol/chart", priceController.getChartData);
router.get("/market/stats", priceController.getMarketStats);

module.exports = router;

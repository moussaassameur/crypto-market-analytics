const express = require("express");
const router = express.Router();
const priceController = require("../controllers/price.controller");

router.get("/cryptos/latest", priceController.getLatest);

module.exports = router;

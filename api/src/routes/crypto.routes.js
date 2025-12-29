const express = require("express");
const router = express.Router();

const cryptoController = require("../controllers/crypto.controller");
const verifyToken = require("../middlewares/verifyToken");
const verifyAdmin = require("../middlewares/verifyAdmin");

router.get("/cryptos/latest", verifyToken, cryptoController.getLatest);

module.exports = router;

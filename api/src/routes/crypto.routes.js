const express = require('express');
const router = express.Router();

const cryptoController = require('../controllers/crypto.controller');

router.get('/cryptos', cryptoController.getCryptos);

module.exports = router;

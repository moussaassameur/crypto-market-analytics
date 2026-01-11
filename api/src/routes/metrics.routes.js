const express = require('express');
const router = express.Router();
const { register } = require('../services/metrics.service');

// Endpoint pour Prometheus - GET /metrics
router.get('/', async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (error) {
    res.status(500).end(error.message);
  }
});

module.exports = router;

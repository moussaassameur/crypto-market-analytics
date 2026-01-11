const express = require('express');
const { register } = require('./metrics');

const app = express();
const PORT = process.env.METRICS_PORT || 9091;

// Endpoint pour Prometheus
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (error) {
    res.status(500).end(error);
  }
});

// Endpoint de santé
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'collector' });
});

function startMetricsServer() {
  app.listen(PORT, () => {
    console.log(`📊 Serveur de métriques démarré sur le port ${PORT}`);
    console.log(`   → http://localhost:${PORT}/metrics`);
  });
}

module.exports = { startMetricsServer };

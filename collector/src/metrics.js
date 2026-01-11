const client = require('prom-client');

// Créer le registre de métriques
const register = new client.Registry();

// Ajouter les métriques par défaut (CPU, mémoire, etc.)
client.collectDefaultMetrics({ register });

// Métrique : Prix des cryptomonnaies en USD
const cryptoPrices = new client.Gauge({
  name: 'crypto_price_usd',
  help: 'Prix actuel des cryptomonnaies en USD',
  labelNames: ['symbol', 'name'],
  registers: [register]
});

// Métrique : Nombre de collectes effectuées
const collectionsTotal = new client.Counter({
  name: 'collector_collections_total',
  help: 'Nombre total de collectes effectuées',
  registers: [register]
});

// Métrique : Erreurs de collecte
const collectionErrors = new client.Counter({
  name: 'collector_errors_total',
  help: 'Nombre total d\'erreurs lors de la collecte',
  labelNames: ['type'],
  registers: [register]
});

// Métrique : Durée de la collecte
const collectionDuration = new client.Histogram({
  name: 'collector_duration_seconds',
  help: 'Durée de la collecte en secondes',
  buckets: [0.1, 0.5, 1, 2, 5, 10],
  registers: [register]
});

module.exports = {
  register,
  cryptoPrices,
  collectionsTotal,
  collectionErrors,
  collectionDuration
};

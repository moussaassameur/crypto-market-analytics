const client = require('prom-client');

// Créer un registre
const register = new client.Registry();

// Ajouter les métriques par défaut (CPU, mémoire, etc.)
client.collectDefaultMetrics({ register });

// Compteur de requêtes HTTP
const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total des requêtes HTTP',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register]
});

// Histogramme de durée des requêtes
const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Durée des requêtes HTTP en secondes',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.001, 0.005, 0.015, 0.05, 0.1, 0.5, 1, 5],
  registers: [register]
});

// Gauge pour les connexions actives
const activeConnections = new client.Gauge({
  name: 'active_connections',
  help: 'Nombre de connexions actives',
  registers: [register]
});

// Compteur d'alertes déclenchées
const alertsTriggered = new client.Counter({
  name: 'crypto_alerts_triggered_total',
  help: 'Nombre total d\'alertes crypto déclenchées',
  labelNames: ['crypto', 'condition'],
  registers: [register]
});

// Gauge pour les prix crypto
const cryptoPrices = new client.Gauge({
  name: 'crypto_price_usd',
  help: 'Prix actuel des cryptomonnaies en USD',
  labelNames: ['symbol'],
  registers: [register]
});

// Compteur d'erreurs
const errorsTotal = new client.Counter({
  name: 'errors_total',
  help: 'Nombre total d\'erreurs',
  labelNames: ['type', 'route'],
  registers: [register]
});

// Gauge pour les utilisateurs actifs
const activeUsers = new client.Gauge({
  name: 'active_users',
  help: 'Nombre d\'utilisateurs actifs',
  registers: [register]
});

// Set pour tracker les utilisateurs connectés en mémoire
const connectedUsers = new Set();

// Initialiser le compteur à 0 au démarrage
activeUsers.set(0);

// Fonctions pour gérer les utilisateurs connectés
const userConnected = (userId) => {
  connectedUsers.add(userId);
  activeUsers.set(connectedUsers.size);
};

const userDisconnected = (userId) => {
  connectedUsers.delete(userId);
  activeUsers.set(connectedUsers.size);
};

// Fonction pour réinitialiser tous les utilisateurs (en cas de redémarrage)
const resetAllUsers = () => {
  connectedUsers.clear();
  activeUsers.set(0);
};

// Compteur de transactions portfolio
const portfolioTransactions = new client.Counter({
  name: 'portfolio_transactions_total',
  help: 'Nombre total de transactions portfolio',
  labelNames: ['type', 'crypto'],
  registers: [register]
});

module.exports = {
  register,
  httpRequestsTotal,
  httpRequestDuration,
  activeConnections,
  alertsTriggered,
  cryptoPrices,
  errorsTotal,
  activeUsers,
  userConnected,
  userDisconnected,
  resetAllUsers,
  portfolioTransactions
};

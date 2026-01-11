const { 
  httpRequestsTotal, 
  httpRequestDuration, 
  activeConnections,
  errorsTotal 
} = require('../services/metrics.service');

const metricsMiddleware = (req, res, next) => {
  // Ignorer les requêtes vers /metrics
  if (req.path === '/metrics') {
    return next();
  }

  // Incrémenter les connexions actives
  activeConnections.inc();
  
  // Démarrer le timer
  const start = Date.now();
  
  // Intercepter la fin de la requête
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route ? req.route.path : req.path;
    const labels = {
      method: req.method,
      route: route,
      status_code: res.statusCode
    };
    
    // Enregistrer les métriques
    httpRequestsTotal.inc(labels);
    httpRequestDuration.observe(labels, duration);
    
    // Décrémenter les connexions actives
    activeConnections.dec();
    
    // Compter les erreurs
    if (res.statusCode >= 400) {
      errorsTotal.inc({ 
        type: res.statusCode >= 500 ? 'server' : 'client',
        route: route 
      });
    }
  });
  
  next();
};

module.exports = metricsMiddleware;

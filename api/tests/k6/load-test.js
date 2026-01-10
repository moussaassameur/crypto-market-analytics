/**
 * Test de Charge (Load Testing)
 * 
 * Objectif : Évaluer les performances sous charge normale attendue
 * Simule 50 utilisateurs simultanés pendant 5 minutes
 * 
 * Métriques mesurées :
 * - Latence moyenne et P95/P99
 * - Throughput (requêtes/sec)
 * - Taux d'erreur
 * - Stabilité dans le temps
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';
import { randomString, randomIntBetween } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

// Métriques personnalisées
const errorRate = new Rate('errors');
const authLatency = new Trend('auth_duration');
const portfolioLatency = new Trend('portfolio_duration');
const forecastLatency = new Trend('forecast_duration');
const successfulRequests = new Counter('successful_requests');

// Configuration du test de charge
export const options = {
  stages: [
    { duration: '1m', target: 10 },   // Warm-up : montée progressive
    { duration: '2m', target: 50 },   // Ramp-up : atteindre 50 users
    { duration: '5m', target: 50 },   // Load : maintenir 50 users
    { duration: '2m', target: 100 },  // Peak : tester 100 users
    { duration: '1m', target: 0 }     // Cool-down
  ],
  
  // Seuils de performance (critères de réussite)
  thresholds: {
    // 95% des requêtes doivent être < 500ms
    http_req_duration: ['p(95)<500', 'p(99)<1000'],
    
    // Taux d'erreur < 1%
    http_req_failed: ['rate<0.01'],
    
    // Par endpoint
    'http_req_duration{endpoint:cryptos}': ['p(95)<300'],
    'http_req_duration{endpoint:portfolio}': ['p(95)<400'],
    'http_req_duration{endpoint:forecast}': ['p(95)<800'],
    
    // Métriques custom
    errors: ['rate<0.05'],
    auth_duration: ['p(95)<300'],
  },
  
  // Paramètres généraux
  noConnectionReuse: false,
  userAgent: 'K6LoadTest/1.0',
};

// Configuration
const BASE_URL = __ENV.API_URL || 'http://localhost:3000';

// Fonction setup : exécutée une fois au début
export function setup() {
  console.log(`🚀 Démarrage du test de charge sur ${BASE_URL}`);
  
  // Vérifier que l'API répond
  const healthCheck = http.get(`${BASE_URL}/api/health`);
  const isHealthy = check(healthCheck, {
    'API is healthy': (r) => r.status === 200,
  });
  
  if (!isHealthy) {
    throw new Error('API is not healthy, aborting test');
  }
  
  console.log('✅ API Health check passed');
  
  return { baseUrl: BASE_URL };
}

// Fonction principale : chaque VU exécute ceci en boucle
export default function(data) {
  // Scénario aléatoire basé sur des patterns réels
  const scenario = Math.random();
  
  if (scenario < 0.6) {
    // 60% : Utilisateur public (visite, consulte)
    publicUserScenario(data.baseUrl);
  } else if (scenario < 0.9) {
    // 30% : Utilisateur authentifié (portfolio, alertes)
    authenticatedUserScenario(data.baseUrl);
  } else {
    // 10% : Power user (tout utilise)
    powerUserScenario(data.baseUrl);
  }
}

// Scénario 1 : Utilisateur Public
function publicUserScenario(baseUrl) {
  // 1. Page d'accueil - Latest prices
  let response = http.get(`${baseUrl}/api/cryptos/latest`, {
    tags: { endpoint: 'cryptos_latest', scenario: 'public' }
  });
  
  const checkResult = check(response, {
    'crypto list status 200': (r) => r.status === 200,
    'crypto list has data': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.data && body.data.length > 0;
      } catch {
        return false;
      }
    },
    'response time < 300ms': (r) => r.timings.duration < 300,
  });
  
  if (!checkResult) errorRate.add(1);
  else successfulRequests.add(1);
  
  sleep(randomIntBetween(1, 3)); // Think time réaliste
  
  // 2. Chart d'une crypto (Bitcoin)
  const cryptos = ['btc', 'eth', 'sol'];
  const randomCrypto = cryptos[randomIntBetween(0, cryptos.length - 1)];
  
  response = http.get(`${baseUrl}/api/cryptos/${randomCrypto}/chart?range=24h`, {
    tags: { endpoint: 'crypto_chart', scenario: 'public' }
  });
  
  check(response, {
    'chart status 200': (r) => r.status === 200,
  }) || errorRate.add(1);
  
  sleep(randomIntBetween(2, 4));
  
  // 3. Market stats
  response = http.get(`${baseUrl}/api/market/stats`, {
    tags: { endpoint: 'market_stats', scenario: 'public' }
  });
  
  check(response, {
    'market stats status 200': (r) => r.status === 200,
  }) || errorRate.add(1);
  
  sleep(1);
}

// Scénario 2 : Utilisateur Authentifié
function authenticatedUserScenario(baseUrl) {
  const startAuth = Date.now();
  
  // Générer des credentials uniques
  const email = `loadtest_${__VU}_${__ITER}_${randomString(8)}@test.com`;
  const password = 'LoadTest123!';
  
  // 1. Register
  let response = http.post(`${baseUrl}/api/auth/register`, 
    JSON.stringify({ email, password, name: 'Load Test User' }),
    {
      headers: { 'Content-Type': 'application/json' },
      tags: { endpoint: 'register', scenario: 'auth' }
    }
  );
  
  let token = '';
  
  if (response.status === 201) {
    try {
      token = JSON.parse(response.body).token;
    } catch (e) {
      errorRate.add(1);
      return;
    }
  } else {
    errorRate.add(1);
    return;
  }
  
  const authDuration = Date.now() - startAuth;
  authLatency.add(authDuration);
  
  if (!token) {
    errorRate.add(1);
    return;
  }
  
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
  
  sleep(1);
  
  // 2. Voir le portfolio
  const startPortfolio = Date.now();
  response = http.get(`${baseUrl}/api/portfolio`, {
    headers: headers,
    tags: { endpoint: 'portfolio', scenario: 'auth' }
  });
  
  check(response, {
    'portfolio status 200': (r) => r.status === 200,
  }) || errorRate.add(1);
  
  portfolioLatency.add(Date.now() - startPortfolio);
  
  sleep(1);
  
  // 3. Ajouter une transaction
  response = http.post(`${baseUrl}/api/portfolio/transaction`,
    JSON.stringify({
      type: 'achat',
      crypto: ['BTC', 'ETH', 'SOL'][randomIntBetween(0, 2)],
      amount: Math.random() * 2,
      price: 30000 + Math.random() * 20000,
      date: '2026-01-09'
    }),
    {
      headers: headers,
      tags: { endpoint: 'portfolio_add', scenario: 'auth' }
    }
  );
  
  check(response, {
    'transaction created': (r) => r.status === 201,
  }) || errorRate.add(1);
  
  sleep(2);
  
  // 4. Créer une alerte
  response = http.post(`${baseUrl}/api/alerts`,
    JSON.stringify({
      crypto: 'btc',
      condition: Math.random() > 0.5 ? '>' : '<',
      threshold: 50000 + Math.random() * 50000
    }),
    {
      headers: headers,
      tags: { endpoint: 'alerts_create', scenario: 'auth' }
    }
  );
  
  check(response, {
    'alert created': (r) => r.status === 201,
  }) || errorRate.add(1);
  
  sleep(1);
}

// Scénario 3 : Power User
function powerUserScenario(baseUrl) {
  const email = `poweruser_${__VU}_${__ITER}_${randomString(8)}@test.com`;
  const password = 'PowerTest123!';
  
  // Register & Login
  let response = http.post(`${baseUrl}/api/auth/register`, 
    JSON.stringify({ email, password, name: 'Power User' }),
    { headers: { 'Content-Type': 'application/json' } }
  );
  
  if (response.status !== 201) {
    errorRate.add(1);
    return;
  }
  
  const token = JSON.parse(response.body).token;
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
  
  sleep(1);
  
  // Batch de requêtes
  const requests = [
    { method: 'GET', url: `${baseUrl}/api/portfolio`, headers },
    { method: 'GET', url: `${baseUrl}/api/portfolio/stats`, headers },
    { method: 'GET', url: `${baseUrl}/api/alerts`, headers },
    { method: 'GET', url: `${baseUrl}/api/cryptos/latest`, headers: {} },
  ];
  
  const responses = http.batch(requests);
  
  responses.forEach(r => {
    check(r, {
      'batch request success': (r) => r.status === 200,
    }) || errorRate.add(1);
  });
  
  sleep(2);
  
  // Prévisions (endpoint lourd)
  const startForecast = Date.now();
  response = http.get(`${baseUrl}/api/forecast/btc?days=30&model=combined`, {
    headers: headers,
    tags: { endpoint: 'forecast', scenario: 'power' }
  });
  
  check(response, {
    'forecast status 200': (r) => r.status === 200,
    'has predictions': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.predictions && body.predictions.length > 0;
      } catch {
        return false;
      }
    },
  }) || errorRate.add(1);
  
  forecastLatency.add(Date.now() - startForecast);
  
  sleep(1);
}

// Teardown : exécuté une fois à la fin
export function teardown(data) {
  console.log('🏁 Test de charge terminé');
}

// Handler pour résumé personnalisé
export function handleSummary(data) {
  return {
    'stdout': textSummary(data, { indent: ' ', enableColors: true }),
    'summary.json': JSON.stringify(data),
  };
}

function textSummary(data, options) {
  const indent = options.indent || '';
  let output = '\n';
  
  output += `${indent}📊 RÉSUMÉ DU TEST DE CHARGE\n`;
  output += `${indent}${'='.repeat(50)}\n\n`;
  
  // Statistiques globales
  output += `${indent}⏱️  Durée totale: ${(data.state.testRunDurationMs / 1000).toFixed(2)}s\n`;
  output += `${indent}👥 VUs max: ${data.metrics.vus_max.values.max}\n`;
  output += `${indent}🔄 Iterations: ${data.metrics.iterations.values.count}\n`;
  output += `${indent}📨 Requêtes totales: ${data.metrics.http_reqs.values.count}\n`;
  output += `${indent}📈 Requêtes/sec: ${data.metrics.http_reqs.values.rate.toFixed(2)}\n\n`;
  
  // Latence
  if (data.metrics.http_req_duration) {
    output += `${indent}⚡ Latence:\n`;
    output += `${indent}   Moyenne: ${data.metrics.http_req_duration.values.avg.toFixed(2)}ms\n`;
    output += `${indent}   Min: ${data.metrics.http_req_duration.values.min.toFixed(2)}ms\n`;
    output += `${indent}   Max: ${data.metrics.http_req_duration.values.max.toFixed(2)}ms\n`;
    output += `${indent}   P95: ${data.metrics.http_req_duration.values['p(95)'].toFixed(2)}ms\n`;
    output += `${indent}   P99: ${data.metrics.http_req_duration.values['p(99)'].toFixed(2)}ms\n\n`;
  }
  
  // Taux d'erreur
  if (data.metrics.http_req_failed) {
    const errorRate = (data.metrics.http_req_failed.values.rate * 100).toFixed(2);
    const status = errorRate < 1 ? '✅' : '❌';
    output += `${indent}${status} Taux d'erreur: ${errorRate}%\n\n`;
  }
  
  return output;
}

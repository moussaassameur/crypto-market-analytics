/**
 * Test de Stress (Stress Testing)
 * 
 * Objectif : Trouver le point de rupture du système
 * Montée progressive jusqu'à 800 utilisateurs pour identifier les limites
 * 
 * Ce test aide à :
 * - Identifier le breaking point de l'API
 * - Détecter les goulots d'étranglement
 * - Mesurer la dégradation des performances
 * - Vérifier la récupération après stress
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const errorRate = new Rate('errors');
const latencyTrend = new Trend('latency');

export const options = {
  stages: [
    // Montée progressive pour identifier le breaking point
    { duration: '2m', target: 50 },
    { duration: '2m', target: 100 },
    { duration: '2m', target: 200 },
    { duration: '2m', target: 400 },
    { duration: '2m', target: 600 },
    { duration: '2m', target: 800 },   // Point de stress maximal
    { duration: '2m', target: 0 }      // Récupération
  ],
  
  thresholds: {
    // Critères plus souples que le load test
    http_req_duration: ['p(95)<2000'], // Accepter jusqu'à 2s en stress
    http_req_failed: ['rate<0.05'],    // Accepter 5% d'erreurs max
  }
};

const BASE_URL = __ENV.API_URL || 'http://localhost:3000';

export function setup() {
  console.log('🔥 Démarrage du test de stress');
  console.log('⚠️  Attention : ce test pousse le système à ses limites');
  
  const healthCheck = http.get(`${BASE_URL}/api/health`);
  if (healthCheck.status !== 200) {
    throw new Error('API not healthy');
  }
  
  return { baseUrl: BASE_URL };
}

export default function(data) {
  const currentVUs = __VU;
  
  // Endpoints les plus sollicités
  const endpoints = [
    '/api/cryptos/latest',
    '/api/cryptos/btc/chart?range=24h',
    '/api/market/stats',
    '/api/health'
  ];
  
  const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
  
  const startTime = Date.now();
  const response = http.get(`${data.baseUrl}${endpoint}`, {
    tags: { endpoint: endpoint, vus: currentVUs }
  });
  
  const duration = Date.now() - startTime;
  latencyTrend.add(duration);
  
  const success = check(response, {
    'status 200': (r) => r.status === 200,
    'response time acceptable': (r) => r.timings.duration < 5000,
  });
  
  if (!success) {
    errorRate.add(1);
    console.log(`❌ Erreur à ${currentVUs} VUs: ${response.status}, latence: ${duration}ms`);
  }
  
  // Log des métriques aux paliers importants
  if (currentVUs % 100 === 0 && __ITER === 0) {
    console.log(`📊 ${currentVUs} VUs actifs - Latence: ${duration}ms`);
  }
  
  sleep(1);
}

export function teardown(data) {
  console.log('🏁 Test de stress terminé');
  console.log('💡 Analyser les métriques pour identifier le breaking point');
}

export function handleSummary(data) {
  const maxVUs = data.metrics.vus_max.values.max;
  const avgLatency = data.metrics.http_req_duration.values.avg;
  const errorRate = data.metrics.http_req_failed.values.rate * 100;
  
  let summary = '\n';
  summary += '🔥 RÉSUMÉ DU TEST DE STRESS\n';
  summary += '='.repeat(50) + '\n\n';
  summary += `👥 VUs maximum atteints: ${maxVUs}\n`;
  summary += `⚡ Latence moyenne: ${avgLatency.toFixed(2)}ms\n`;
  summary += `❌ Taux d'erreur: ${errorRate.toFixed(2)}%\n\n`;
  
  // Analyse du breaking point
  if (errorRate > 5) {
    summary += '⚠️  Breaking point atteint!\n';
    summary += `Le système commence à échouer au-delà de ~${Math.floor(maxVUs * 0.8)} VUs\n`;
  } else if (avgLatency > 1000) {
    summary += '⚠️  Dégradation significative des performances\n';
    summary += `Latence acceptable jusqu'à ~${Math.floor(maxVUs * 0.7)} VUs\n`;
  } else {
    summary += '✅ Le système a tenu le stress test!\n';
    summary += `Capacité recommandée: ${Math.floor(maxVUs * 0.6)} utilisateurs simultanés\n`;
  }
  
  summary += '\n💡 Recommandations:\n';
  summary += '   - Vérifier les logs serveur pour identifier les goulots\n';
  summary += '   - Monitorer l\'utilisation CPU/RAM pendant le test\n';
  summary += '   - Optimiser les endpoints les plus lents\n';
  
  return {
    'stdout': summary,
    'stress-test-results.json': JSON.stringify(data),
  };
}

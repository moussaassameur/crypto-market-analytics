/**
 * Test de Pic (Spike Testing)
 * 
 * Objectif : Simuler un pic de trafic soudain
 * Scénario : Bitcoin monte à 100k$ et tout le monde arrive en même temps
 * 
 * Ce test vérifie :
 * - La résilience face à un trafic soudain
 * - Le temps de récupération après le pic
 * - La stabilité sous charge extrême instantanée
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Counter } from 'k6/metrics';

const errorRate = new Rate('errors');
const spikeRecovery = new Counter('spike_recovery_requests');

export const options = {
  stages: [
    // Trafic normal
    { duration: '30s', target: 20 },
    
    // 🚀 SPIKE SOUDAIN ! (en 10 secondes)
    { duration: '10s', target: 500 },
    
    // Maintenir le pic
    { duration: '1m', target: 500 },
    
    // Retour à la normale
    { duration: '30s', target: 20 },
    
    // Vérifier la récupération
    { duration: '30s', target: 20 }
  ],
  
  thresholds: {
    // Pendant le spike, accepter une latence plus élevée
    http_req_duration: ['p(95)<3000'],
    
    // Mais pas trop d'erreurs même pendant le pic
    http_req_failed: ['rate<0.1'],
    
    // Après le pic, vérifier la récupération
    'http_req_duration{phase:recovery}': ['p(95)<500'],
  }
};

const BASE_URL = __ENV.API_URL || 'http://localhost:3000';

export function setup() {
  console.log('⚡ Démarrage du test de spike');
  console.log('🎯 Simulation : Événement crypto viral');
  
  return { baseUrl: BASE_URL };
}

export default function(data) {
  const currentVUs = __VU;
  const currentIteration = __ITER;
  
  // Déterminer la phase du test
  let phase = 'normal';
  if (currentVUs > 400) {
    phase = 'spike';
  } else if (currentIteration > 100 && currentVUs < 50) {
    phase = 'recovery';
    spikeRecovery.add(1);
  }
  
  // Pendant le spike, tout le monde veut voir les prix
  const endpoint = phase === 'spike' 
    ? '/api/cryptos/btc/chart?range=24h'
    : ['/api/cryptos/latest', '/api/market/stats', '/api/health'][Math.floor(Math.random() * 3)];
  
  const response = http.get(`${data.baseUrl}${endpoint}`, {
    tags: { phase: phase }
  });
  
  const success = check(response, {
    'survit au spike': (r) => r.status === 200,
    'latence acceptable': (r) => {
      // Critères différents selon la phase
      if (phase === 'spike') {
        return r.timings.duration < 5000; // 5s max pendant le spike
      }
      return r.timings.duration < 1000; // 1s en temps normal
    },
  });
  
  if (!success) {
    errorRate.add(1);
  }
  
  // Log aux moments clés
  if (phase === 'spike' && currentIteration === 0) {
    console.log(`🚀 SPIKE! ${currentVUs} utilisateurs simultanés`);
  } else if (phase === 'recovery' && currentIteration === 0) {
    console.log(`🔄 Récupération en cours, ${currentVUs} VUs`);
  }
  
  sleep(Math.random() * 2); // Comportement humain aléatoire
}

export function teardown(data) {
  console.log('🏁 Test de spike terminé');
}

export function handleSummary(data) {
  const totalRequests = data.metrics.http_reqs.values.count;
  const failedRequests = data.metrics.http_req_failed.values.count;
  const errorRate = (failedRequests / totalRequests * 100).toFixed(2);
  const avgLatency = data.metrics.http_req_duration.values.avg;
  const maxLatency = data.metrics.http_req_duration.values.max;
  
  let summary = '\n';
  summary += '⚡ RÉSUMÉ DU TEST DE SPIKE\n';
  summary += '='.repeat(50) + '\n\n';
  
  summary += `📊 Statistiques globales:\n`;
  summary += `   Total requêtes: ${totalRequests}\n`;
  summary += `   Requêtes échouées: ${failedRequests} (${errorRate}%)\n`;
  summary += `   Latence moyenne: ${avgLatency.toFixed(2)}ms\n`;
  summary += `   Latence max: ${maxLatency.toFixed(2)}ms\n\n`;
  
  // Évaluation de la résilience
  summary += `🎯 Évaluation de la résilience:\n`;
  
  if (errorRate < 5) {
    summary += `   ✅ EXCELLENT - L'API a survécu au spike (${errorRate}% erreurs)\n`;
  } else if (errorRate < 10) {
    summary += `   ⚠️  ACCEPTABLE - Quelques erreurs pendant le pic (${errorRate}%)\n`;
  } else {
    summary += `   ❌ PROBLÉMATIQUE - Trop d'erreurs (${errorRate}%)\n`;
  }
  
  if (avgLatency < 1000) {
    summary += `   ✅ Latence bien gérée (${avgLatency.toFixed(0)}ms moyenne)\n`;
  } else if (avgLatency < 2000) {
    summary += `   ⚠️  Latence élevée mais acceptable (${avgLatency.toFixed(0)}ms)\n`;
  } else {
    summary += `   ❌ Latence excessive (${avgLatency.toFixed(0)}ms)\n`;
  }
  
  summary += `\n💡 Scénarios réels similaires:\n`;
  summary += `   - Annonce majeure de prix\n`;
  summary += `   - Alerte breaking news crypto\n`;
  summary += `   - Mention sur réseaux sociaux\n`;
  
  return {
    'stdout': summary,
    'spike-test-results.json': JSON.stringify(data),
  };
}

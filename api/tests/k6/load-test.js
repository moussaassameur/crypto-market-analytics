import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '30s', target: 20 },  // Monte progressivement à 20 users
    { duration: '1m', target: 50 },   // Monte à 50 users
    { duration: '1m', target: 50 },   // Maintien à 50 users
    { duration: '30s', target: 0 },   // Descente
  ],
  
  thresholds: {
    http_req_duration: ['p(95)<500'],      // 95% des requêtes < 500ms
    http_req_failed: ['rate<0.30'],        // < 30% d'erreurs 
    http_reqs: ['rate>10'],                // > 10 req/sec
  }
};

const BASE_URL = __ENV.API_URL || 'http://localhost:3000';

export function setup() {
  console.log(' Démarrage du Load Test');
  console.log(' Objectif : Tester charge normale (50 utilisateurs)');
  return { baseUrl: BASE_URL };
}

export default function(data) {
  // Test 1: Health Check
  let res = http.get(`${data.baseUrl}/api/health`);
  check(res, {
    'health OK': (r) => r.status === 200,
  }) || errorRate.add(1);

  sleep(1); //pause 

  // Test 2: Login
  res = http.post(`${data.baseUrl}/api/auth/login`, JSON.stringify({
    email: 'test@example.com',
    password: 'password123',
  }), {
    headers: { 'Content-Type': 'application/json' },
  });
  
  const loginSuccess = check(res, {
    'login OK': (r) => r.status === 200,
    'token présent': (r) => r.json('token') !== undefined,
  });
  
  if (!loginSuccess) {
    errorRate.add(1);
    return;
  }

  const token = res.json('token');
  sleep(1);

  // Test 3: Liste des cryptos
  res = http.get(`${data.baseUrl}/api/cryptos/latest`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  
  check(res, {
    'cryptos OK': (r) => r.status === 200,
    'données présentes': (r) => r.json().length > 0,
  }) || errorRate.add(1);

  sleep(2);

  // Test 4: Portfolio
  res = http.get(`${data.baseUrl}/api/portfolio`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  
  check(res, {
    'portfolio OK': (r) => r.status === 200 || r.status === 404,
  }) || errorRate.add(1);

  sleep(1);
}

export function teardown(data) {
  console.log(' Load Test terminé');
}

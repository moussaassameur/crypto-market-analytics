/**
 * Utilitaires pour les tests d'intégration
 * - resetDb: nettoie les tables principales
 * - getToken: crée un utilisateur et retourne un JWT
 * - createTestUser: crée un utilisateur de test
 */

const request = require("supertest");

// Charger les variables d'environnement de test
require("dotenv").config({ path: ".env.test" });

const app = require("../../src/app");
const db = require("../../src/db/pool");

/**
 * Nettoie les tables de la base de données pour les tests
 * L'ordre est important à cause des contraintes FK
 */
const resetDb = async () => {
  try {
    // Désactiver temporairement les contraintes FK pour un nettoyage plus simple
    await db.query("SET session_replication_role = 'replica'");
    
    // Nettoyer les tables dans l'ordre (enfants d'abord)
    await db.query("DELETE FROM alerts");
    await db.query("DELETE FROM portfolio_transactions");
    await db.query("DELETE FROM users");
    
    // Réactiver les contraintes FK
    await db.query("SET session_replication_role = 'origin'");
    
    // Réinitialiser les séquences pour avoir des IDs prévisibles
    await db.query("ALTER SEQUENCE users_id_seq RESTART WITH 1");
    await db.query("ALTER SEQUENCE alerts_id_seq RESTART WITH 1");
    await db.query("ALTER SEQUENCE portfolio_transactions_id_seq RESTART WITH 1");
  } catch (err) {
    console.error("Erreur resetDb:", err.message);
    throw err;
  }
};

/**
 * Ferme la connexion à la base de données
 */
const closeDb = async () => {
  await db.pool.end();
};

/**
 * Génère des données utilisateur uniques pour éviter les conflits
 */
let userCounter = 0;
const generateUniqueUser = () => {
  userCounter++;
  const timestamp = Date.now();
  return {
    email: `testuser_${timestamp}_${userCounter}@test.com`,
    password: "TestPassword123!",
    name: `Test User ${userCounter}`,
  };
};

/**
 * Crée un utilisateur de test via l'API
 * @returns {Promise<{user: object, password: string}>}
 */
const createTestUser = async (userData = null) => {
  const user = userData || generateUniqueUser();
  
  const res = await request(app)
    .post("/api/auth/register")
    .send(user);

  if (res.status !== 201) {
    throw new Error(`Échec création user: ${res.status} - ${JSON.stringify(res.body)}`);
  }

  return {
    user: res.body,
    password: user.password,
    email: user.email,
  };
};

/**
 * Crée un utilisateur et récupère un token JWT
 * @returns {Promise<{token: string, user: object}>}
 */
const getToken = async (userData = null) => {
  const { user, password, email } = await createTestUser(userData);

  // Login pour obtenir le token
  const loginRes = await request(app)
    .post("/api/auth/login")
    .send({ email, password });

  if (loginRes.status !== 200 || !loginRes.body.token) {
    throw new Error(`Échec login: ${loginRes.status} - ${JSON.stringify(loginRes.body)}`);
  }

  return {
    token: loginRes.body.token,
    user,
    email,
  };
};

/**
 * Helper pour faire des requêtes authentifiées
 */
const authRequest = (method, url, token) => {
  return request(app)[method](url).set("Authorization", `Bearer ${token}`);
};

module.exports = {
  app,
  db,
  resetDb,
  closeDb,
  createTestUser,
  getToken,
  generateUniqueUser,
  authRequest,
  request,
};

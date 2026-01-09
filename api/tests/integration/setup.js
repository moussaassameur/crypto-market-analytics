/**
 * Configuration globale pour les tests d'intégration
 * Charge les variables d'environnement de test avant tous les tests
 */

const path = require("path");
const dotenv = require("dotenv");

// Charger .env.test depuis le dossier api/
dotenv.config({ path: path.resolve(__dirname, "../../.env.test") });

// S'assurer que NODE_ENV est bien "test"
process.env.NODE_ENV = "test";

// Timeout plus long pour les tests d'intégration
jest.setTimeout(30000);

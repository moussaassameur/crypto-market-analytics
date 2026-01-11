module.exports = {
  testEnvironment: "node",
  coverageDirectory: "coverage",
  collectCoverageFrom: [
    "src/**/*.js",
    "!src/server.js",
    "!src/__tests__/**",
  ],
  testMatch: [
    "**/__tests__/**/*.test.js",
    "**/tests/integration/**/*.test.js",
    "**/tests/unit/**/*.test.js"
  ],
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  // Configuration spécifique pour les tests d'intégration
  testTimeout: 30000,
  // Ignorer node_modules sauf si besoin
  testPathIgnorePatterns: ["/node_modules/"],
  // Setup file pour les tests d'intégration
  setupFilesAfterEnv: ["<rootDir>/tests/integration/setup.js"],
  // Configuration de couverture
  coverageReporters: ["text", "text-summary", "html", "lcov"],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  // Affichage détaillé de la couverture
  verbose: true,
  collectCoverage: false // Par défaut false, activé uniquement avec --coverage
};

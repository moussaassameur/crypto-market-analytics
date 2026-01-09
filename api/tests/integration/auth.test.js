/**
 * Tests d'intégration - Authentification
 * 
 * Scénarios testés:
 * - POST /api/auth/register -> 201 (succès)
 * - POST /api/auth/register -> 409 (email déjà utilisé)
 * - POST /api/auth/login -> 200 + token
 * - POST /api/auth/login -> 401 (mauvais password)
 */

const { app, resetDb, closeDb, request, generateUniqueUser } = require("./testUtils");

describe("Auth Integration Tests", () => {
  // Nettoyer la DB avant tous les tests
  beforeAll(async () => {
    await resetDb();
  });

  // Fermer la connexion après tous les tests
  afterAll(async () => {
    await closeDb();
  });

  describe("POST /api/auth/register", () => {
    it("devrait créer un nouvel utilisateur avec succès (201)", async () => {
      const userData = generateUniqueUser();

      const res = await request(app)
        .post("/api/auth/register")
        .send(userData);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("id");
      expect(res.body.email).toBe(userData.email);
      expect(res.body.name).toBe(userData.name);
      expect(res.body).not.toHaveProperty("password");
      expect(res.body).not.toHaveProperty("password_hash");
    });

    it("devrait retourner 409 si email déjà utilisé", async () => {
      const userData = generateUniqueUser();

      // Premier enregistrement
      await request(app)
        .post("/api/auth/register")
        .send(userData);

      // Deuxième tentative avec le même email
      const res = await request(app)
        .post("/api/auth/register")
        .send(userData);

      expect(res.status).toBe(409);
      expect(res.body.error).toBe("Conflict");
      expect(res.body.message).toContain("Email déjà utilisé");
    });

    it("devrait retourner 400 si champs manquants", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({ email: "incomplete@test.com" });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Bad Request");
    });
  });

  describe("POST /api/auth/login", () => {
    const testUser = {
      email: `login_test_${Date.now()}@test.com`,
      password: "SecurePassword123!",
      name: "Login Test User",
    };

    beforeAll(async () => {
      // Créer l'utilisateur pour les tests de login
      await request(app)
        .post("/api/auth/register")
        .send(testUser);
    });

    it("devrait retourner un token JWT après login réussi (200)", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({
          email: testUser.email,
          password: testUser.password,
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("token");
      expect(typeof res.body.token).toBe("string");
      expect(res.body.token.split(".")).toHaveLength(3); // JWT format: header.payload.signature
    });

    it("devrait retourner 401 avec un mauvais mot de passe", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({
          email: testUser.email,
          password: "WrongPassword123!",
        });

      expect(res.status).toBe(401);
      expect(res.body.error).toBe("Unauthorized");
      expect(res.body.message).toContain("Identifiants invalides");
    });

    it("devrait retourner 401 avec un email inexistant", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({
          email: "nonexistent@test.com",
          password: "SomePassword123!",
        });

      expect(res.status).toBe(401);
      expect(res.body.error).toBe("Unauthorized");
    });

    it("devrait retourner 400 si champs manquants", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: testUser.email });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Bad Request");
    });
  });
});

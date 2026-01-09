/**
 * Tests d'intégration - Portfolio
 * 
 * Scénarios testés:
 * - POST /api/portfolio/transaction sans token -> 401
 * - POST /api/portfolio/transaction avec token -> 201 + transaction créée
 * - GET /api/portfolio/transactions -> 200 + liste des transactions
 * - DELETE /api/portfolio/transaction/:id -> 200 supprime la transaction
 * - Sécurité: un utilisateur ne peut pas supprimer la transaction d'un autre
 */

const { app, resetDb, closeDb, getToken, request } = require("./testUtils");

describe("Portfolio Integration Tests", () => {
  let authToken;
  let authUser;
  let createdTransactionId;

  // Nettoyer la DB et créer un utilisateur avant tous les tests
  beforeAll(async () => {
    await resetDb();
    const auth = await getToken();
    authToken = auth.token;
    authUser = auth.user;
  });

  // Fermer la connexion après tous les tests
  afterAll(async () => {
    await closeDb();
  });

  describe("POST /api/portfolio/transaction", () => {
    it("devrait retourner 401 sans token d'authentification", async () => {
      const transaction = {
        type: "achat",
        crypto: "BTC",
        amount: 0.5,
        price: 45000,
        date: "2026-01-09",
      };

      const res = await request(app)
        .post("/api/portfolio/transaction")
        .send(transaction);

      expect(res.status).toBe(401);
    });

    it("devrait créer une transaction avec succès (201)", async () => {
      const transaction = {
        type: "achat",
        crypto: "BTC",
        amount: 0.5,
        price: 45000,
        date: "2026-01-09",
      };

      const res = await request(app)
        .post("/api/portfolio/transaction")
        .set("Authorization", `Bearer ${authToken}`)
        .send(transaction);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("id");
      expect(res.body.crypto).toBe("BTC");
      expect(res.body.amount).toBe(0.5);
      expect(res.body.type).toBe("achat");

      // Sauvegarder l'ID pour les tests suivants
      createdTransactionId = res.body.id;
    });

    it("devrait créer une transaction de vente avec succès", async () => {
      const transaction = {
        type: "vente",
        crypto: "ETH",
        amount: 2.0,
        price: 3000,
        date: "2026-01-08",
      };

      const res = await request(app)
        .post("/api/portfolio/transaction")
        .set("Authorization", `Bearer ${authToken}`)
        .send(transaction);

      expect(res.status).toBe(201);
      expect(res.body.type).toBe("vente");
      expect(res.body.crypto).toBe("ETH");
    });

    it("devrait retourner 400 si champs manquants", async () => {
      const res = await request(app)
        .post("/api/portfolio/transaction")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ crypto: "BTC" }); // Manque type, amount, price, date

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Bad Request");
    });

    it("devrait retourner 400 si type invalide", async () => {
      const res = await request(app)
        .post("/api/portfolio/transaction")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          type: "invalid",
          crypto: "BTC",
          amount: 1,
          price: 50000,
          date: "2026-01-09",
        });

      expect(res.status).toBe(400);
    });
  });

  describe("GET /api/portfolio/transactions", () => {
    it("devrait retourner 401 sans token", async () => {
      const res = await request(app)
        .get("/api/portfolio/transactions");

      expect(res.status).toBe(401);
    });

    it("devrait retourner la liste des transactions (200)", async () => {
      const res = await request(app)
        .get("/api/portfolio/transactions")
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(2); // BTC + ETH créés avant

      // Vérifier la structure d'une transaction
      const btcTx = res.body.find((tx) => tx.crypto === "BTC");
      expect(btcTx).toBeDefined();
      expect(btcTx).toHaveProperty("id");
      expect(btcTx).toHaveProperty("type");
      expect(btcTx).toHaveProperty("amount");
      expect(btcTx).toHaveProperty("price");
      expect(btcTx).toHaveProperty("date");
    });
  });

  describe("GET /api/portfolio/stats", () => {
    it("devrait retourner les statistiques du portefeuille (200)", async () => {
      const res = await request(app)
        .get("/api/portfolio/stats")
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      // Vérifier les champs de stats retournés
      expect(res.body).toHaveProperty("totalValue");
      expect(res.body).toHaveProperty("gainLoss");
    });
  });

  describe("DELETE /api/portfolio/transaction/:id", () => {
    it("devrait retourner 401 sans token", async () => {
      const res = await request(app)
        .delete(`/api/portfolio/transaction/${createdTransactionId}`);

      expect(res.status).toBe(401);
    });

    it("devrait supprimer une transaction avec succès (200)", async () => {
      const res = await request(app)
        .delete(`/api/portfolio/transaction/${createdTransactionId}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toContain("supprimée");
    });

    it("devrait retourner 404 si transaction inexistante", async () => {
      const res = await request(app)
        .delete("/api/portfolio/transaction/99999")
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.status).toBe(404);
    });
  });

  describe("Sécurité - Isolation des utilisateurs", () => {
    it("un utilisateur ne peut pas supprimer la transaction d'un autre", async () => {
      // Créer une transaction avec le premier utilisateur
      const txRes = await request(app)
        .post("/api/portfolio/transaction")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          type: "achat",
          crypto: "SOL",
          amount: 10,
          price: 100,
          date: "2026-01-09",
        });

      const transactionId = txRes.body.id;

      // Créer un deuxième utilisateur
      const auth2 = await getToken();

      // Tenter de supprimer la transaction du premier utilisateur
      const res = await request(app)
        .delete(`/api/portfolio/transaction/${transactionId}`)
        .set("Authorization", `Bearer ${auth2.token}`);

      expect(res.status).toBe(401); // Ou 403 selon l'implémentation
    });
  });
});

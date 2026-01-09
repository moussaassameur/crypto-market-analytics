/**
 * Tests d'intégration - Alertes
 * 
 * Scénarios testés:
 * - POST /api/alerts sans token -> 401
 * - POST /api/alerts avec token -> 201 + alerte créée
 * - GET /api/alerts -> 200 + liste des alertes
 * - PUT /api/alerts/:id -> 200 update (threshold/active)
 * - DELETE /api/alerts/:id -> 200 supprime
 * - POST /api/alerts/check -> déclenchement avec mock notification
 */

const { app, resetDb, closeDb, getToken, request, db } = require("./testUtils");
const alertController = require("../../src/controllers/alert.controller");

describe("Alerts Integration Tests", () => {
  let authToken;
  let authUser;
  let createdAlertId;

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

  describe("POST /api/alerts", () => {
    it("devrait retourner 401 sans token d'authentification", async () => {
      const alert = {
        crypto: "BTC",
        condition: ">",
        threshold: 50000,
      };

      const res = await request(app)
        .post("/api/alerts")
        .send(alert);

      expect(res.status).toBe(401);
    });

    it("devrait créer une alerte avec succès (201)", async () => {
      const alert = {
        crypto: "BTC",
        condition: ">",
        threshold: 50000,
      };

      const res = await request(app)
        .post("/api/alerts")
        .set("Authorization", `Bearer ${authToken}`)
        .send(alert);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("alert");
      expect(res.body.alert).toHaveProperty("id");
      expect(res.body.alert.crypto).toBe("BTC");
      expect(res.body.alert.condition).toBe(">");
      expect(res.body.alert.threshold).toBe(50000);
      expect(res.body.alert.active).toBe(true);
      expect(res.body.alert.triggered).toBe(false);

      // Sauvegarder l'ID pour les tests suivants
      createdAlertId = res.body.alert.id;
    });

    it("devrait créer une alerte avec condition '<'", async () => {
      const alert = {
        crypto: "ETH",
        condition: "<",
        threshold: 2000,
      };

      const res = await request(app)
        .post("/api/alerts")
        .set("Authorization", `Bearer ${authToken}`)
        .send(alert);

      expect(res.status).toBe(201);
      expect(res.body.alert.condition).toBe("<");
    });

    it("devrait retourner 400 si champs manquants", async () => {
      const res = await request(app)
        .post("/api/alerts")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ crypto: "BTC" }); // Manque condition et threshold

      expect(res.status).toBe(400);
    });

    it("devrait retourner 400 si condition invalide", async () => {
      const res = await request(app)
        .post("/api/alerts")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          crypto: "BTC",
          condition: ">=", // Invalide
          threshold: 50000,
        });

      expect(res.status).toBe(400);
    });

    it("devrait retourner 400 si threshold négatif", async () => {
      const res = await request(app)
        .post("/api/alerts")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          crypto: "BTC",
          condition: ">",
          threshold: -100,
        });

      expect(res.status).toBe(400);
    });
  });

  describe("GET /api/alerts", () => {
    it("devrait retourner 401 sans token", async () => {
      const res = await request(app)
        .get("/api/alerts");

      expect(res.status).toBe(401);
    });

    it("devrait retourner la liste des alertes (200)", async () => {
      const res = await request(app)
        .get("/api/alerts")
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(2); // BTC + ETH créés avant

      // Vérifier la structure d'une alerte
      const btcAlert = res.body.find((a) => a.crypto === "BTC");
      expect(btcAlert).toBeDefined();
      expect(btcAlert).toHaveProperty("id");
      expect(btcAlert).toHaveProperty("condition");
      expect(btcAlert).toHaveProperty("threshold");
      expect(btcAlert).toHaveProperty("active");
      expect(btcAlert).toHaveProperty("triggered");
    });
  });

  describe("GET /api/alerts/:id", () => {
    it("devrait retourner une alerte spécifique (200)", async () => {
      const res = await request(app)
        .get(`/api/alerts/${createdAlertId}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(createdAlertId);
      expect(res.body.crypto).toBe("BTC");
    });

    it("devrait retourner 404 si alerte inexistante", async () => {
      const res = await request(app)
        .get("/api/alerts/99999")
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.status).toBe(404);
    });
  });

  describe("PUT /api/alerts/:id", () => {
    it("devrait modifier le threshold d'une alerte (200)", async () => {
      const res = await request(app)
        .put(`/api/alerts/${createdAlertId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({ threshold: 55000 });

      expect(res.status).toBe(200);
      expect(res.body.alert.threshold).toBe(55000);
    });

    it("devrait modifier active à false", async () => {
      const res = await request(app)
        .put(`/api/alerts/${createdAlertId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({ active: false });

      expect(res.status).toBe(200);
      expect(res.body.alert.active).toBe(false);
    });

    it("devrait retourner 404 si alerte inexistante", async () => {
      const res = await request(app)
        .put("/api/alerts/99999")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ threshold: 60000 });

      expect(res.status).toBe(404);
    });
  });

  describe("PATCH /api/alerts/:id/toggle", () => {
    it("devrait basculer l'état actif de l'alerte", async () => {
      // Remettre active à true
      const res = await request(app)
        .patch(`/api/alerts/${createdAlertId}/toggle`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.alert.active).toBe(true); // Était false, maintenant true
    });
  });

  describe("DELETE /api/alerts/:id", () => {
    let alertToDelete;

    beforeAll(async () => {
      // Créer une alerte à supprimer
      const res = await request(app)
        .post("/api/alerts")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          crypto: "SOL",
          condition: ">",
          threshold: 100,
        });
      alertToDelete = res.body.alert.id;
    });

    it("devrait retourner 401 sans token", async () => {
      const res = await request(app)
        .delete(`/api/alerts/${alertToDelete}`);

      expect(res.status).toBe(401);
    });

    it("devrait supprimer une alerte avec succès (200)", async () => {
      const res = await request(app)
        .delete(`/api/alerts/${alertToDelete}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toContain("supprimée");

      // Vérifier que l'alerte n'existe plus
      const getRes = await request(app)
        .get(`/api/alerts/${alertToDelete}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(getRes.status).toBe(404);
    });
  });

  describe("Sécurité - Isolation des utilisateurs", () => {
    it("un utilisateur ne peut pas voir les alertes d'un autre", async () => {
      // Créer un deuxième utilisateur
      const auth2 = await getToken();

      // Tenter d'accéder à l'alerte du premier utilisateur
      const res = await request(app)
        .get(`/api/alerts/${createdAlertId}`)
        .set("Authorization", `Bearer ${auth2.token}`);

      expect(res.status).toBe(403);
    });

    it("un utilisateur ne peut pas supprimer l'alerte d'un autre", async () => {
      const auth2 = await getToken();

      const res = await request(app)
        .delete(`/api/alerts/${createdAlertId}`)
        .set("Authorization", `Bearer ${auth2.token}`);

      expect(res.status).toBe(403);
    });
  });

  describe("POST /api/alerts/check - Déclenchement d'alertes", () => {
    let triggerAlertId;
    let mockNotificationService;
    let originalService;

    beforeAll(async () => {
      // Créer une alerte qui sera déclenchée
      // Threshold bas pour que le prix actuel la déclenche
      const res = await request(app)
        .post("/api/alerts")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          crypto: "BTC",
          condition: ">",
          threshold: 49000, // Prix attendu: 50000, donc > 49000 = triggered
        });

      triggerAlertId = res.body.alert.id;

      // Configurer le mock de notification
      mockNotificationService = {
        send: jest.fn().mockResolvedValue(true),
      };

      // Injecter le mock
      alertController.setNotificationService(mockNotificationService);
    });

    afterAll(() => {
      // Réinitialiser le service de notification par défaut
      alertController.setNotificationService({
        send: async () => true,
      });
    });

    it("devrait retourner 401 sans token", async () => {
      const res = await request(app)
        .post("/api/alerts/check")
        .send({ prices: { BTC: 50000 } });

      expect(res.status).toBe(401);
    });

    it("devrait retourner 400 si prices manquant", async () => {
      const res = await request(app)
        .post("/api/alerts/check")
        .set("Authorization", `Bearer ${authToken}`)
        .send({});

      expect(res.status).toBe(400);
    });

    it("devrait déclencher une alerte et appeler le service de notification", async () => {
      const res = await request(app)
        .post("/api/alerts/check")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          prices: {
            BTC: 50000, // > 49000, donc doit déclencher
          },
        });

      expect(res.status).toBe(200);
      expect(res.body.triggered.length).toBeGreaterThanOrEqual(1);

      // Vérifier que le mock a été appelé
      expect(mockNotificationService.send).toHaveBeenCalled();

      // Vérifier que l'alerte est marquée triggered en DB
      const alertRes = await request(app)
        .get(`/api/alerts/${triggerAlertId}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(alertRes.body.triggered).toBe(true);
    });

    it("ne devrait pas re-déclencher une alerte déjà triggered", async () => {
      // Reset le mock
      mockNotificationService.send.mockClear();

      const res = await request(app)
        .post("/api/alerts/check")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          prices: {
            BTC: 51000,
          },
        });

      expect(res.status).toBe(200);

      // L'alerte ne devrait pas être dans triggered car déjà déclenchée
      const triggeredBTC = res.body.triggered.find(
        (t) => t.id === triggerAlertId
      );
      expect(triggeredBTC).toBeUndefined();
    });

    it("devrait gérer plusieurs cryptos en une fois", async () => {
      // Créer une nouvelle alerte ETH
      await request(app)
        .post("/api/alerts")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          crypto: "ETH",
          condition: "<",
          threshold: 4000,
        });

      const res = await request(app)
        .post("/api/alerts/check")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          prices: {
            BTC: 52000,
            ETH: 3000, // < 4000, donc doit déclencher
            SOL: 150,
          },
        });

      expect(res.status).toBe(200);
      expect(res.body.checked).toBeGreaterThan(0);
    });
  });
});

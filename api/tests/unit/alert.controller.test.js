const {
  createAlert,
  getAlerts,
  getAlert,
  updateAlert,
  toggleAlert,
  deleteAlert,
  resetAlert,
  checkAlerts,
  setNotificationService,
} = require("../../src/controllers/alert.controller");
const alertRepository = require("../../src/repositories/alert.repository");

// Mock du repository
jest.mock("../../src/repositories/alert.repository");

describe("alert.controller", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      user: { sub: 1 },
      params: {},
      body: {},
    };
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe("createAlert", () => {
    it("devrait créer une alerte avec succès (201)", async () => {
      req.body = { crypto: "BTC", condition: ">", threshold: 50000 };
      const mockAlert = {
        id: 1,
        user_id: 1,
        crypto_symbol: "BTC",
        condition: ">",
        threshold: 50000,
        active: true,
        triggered: false,
        triggered_at: null,
        created_at: new Date(),
      };
      alertRepository.create.mockResolvedValue(mockAlert);

      await createAlert(req, res, next);

      expect(alertRepository.create).toHaveBeenCalledWith(1, "BTC", ">", 50000);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Alerte créée avec succès",
          alert: expect.objectContaining({
            id: "1",
            crypto: "BTC",
            condition: ">",
            threshold: 50000,
          }),
        })
      );
    });

    it("devrait retourner 400 si champs manquants", async () => {
      req.body = { crypto: "BTC" }; // condition et threshold manquants

      await createAlert(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Les champs crypto, condition et threshold sont requis",
      });
    });

    it("devrait retourner 400 si crypto invalide (trop long)", async () => {
      req.body = { crypto: "BTCETHSOLXRPAVAXDOTADAMATIC", condition: ">", threshold: 100 };

      await createAlert(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Le symbole crypto doit être alphanumérique (max 20 caractères)",
      });
    });

    it("devrait retourner 400 si crypto contient des caractères spéciaux", async () => {
      req.body = { crypto: "BTC-USD", condition: ">", threshold: 100 };

      await createAlert(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Le symbole crypto doit être alphanumérique (max 20 caractères)",
      });
    });

    it("devrait retourner 400 si condition invalide", async () => {
      req.body = { crypto: "BTC", condition: ">=", threshold: 50000 };

      await createAlert(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "La condition doit être '>' ou '<'",
      });
    });

    it("devrait retourner 400 si threshold négatif", async () => {
      req.body = { crypto: "BTC", condition: ">", threshold: -100 };

      await createAlert(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Le threshold doit être un nombre positif",
      });
    });

    it("devrait retourner 400 si threshold est zéro", async () => {
      req.body = { crypto: "BTC", condition: ">", threshold: 0 };

      await createAlert(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Le threshold doit être un nombre positif",
      });
    });

    it("devrait appeler next() en cas d'erreur", async () => {
      req.body = { crypto: "BTC", condition: ">", threshold: 50000 };
      const mockError = new Error("Database error");
      alertRepository.create.mockRejectedValue(mockError);

      await createAlert(req, res, next);

      expect(next).toHaveBeenCalledWith(mockError);
    });
  });

  describe("getAlerts", () => {
    it("devrait retourner la liste des alertes", async () => {
      const mockAlerts = [
        { id: 1, crypto_symbol: "BTC", condition: ">", threshold: 50000, active: true, triggered: false, created_at: new Date() },
        { id: 2, crypto_symbol: "ETH", condition: "<", threshold: 2000, active: true, triggered: false, created_at: new Date() },
      ];
      alertRepository.findByUserId.mockResolvedValue(mockAlerts);

      await getAlerts(req, res, next);

      expect(alertRepository.findByUserId).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ crypto: "BTC" }),
          expect.objectContaining({ crypto: "ETH" }),
        ])
      );
    });

    it("devrait retourner un tableau vide si aucune alerte", async () => {
      alertRepository.findByUserId.mockResolvedValue([]);

      await getAlerts(req, res, next);

      expect(res.json).toHaveBeenCalledWith([]);
    });

    it("devrait appeler next() en cas d'erreur", async () => {
      const mockError = new Error("Database error");
      alertRepository.findByUserId.mockRejectedValue(mockError);

      await getAlerts(req, res, next);

      expect(next).toHaveBeenCalledWith(mockError);
    });
  });

  describe("getAlert", () => {
    it("devrait retourner une alerte spécifique", async () => {
      req.params.id = "1";
      const mockAlert = { id: 1, user_id: 1, crypto_symbol: "BTC", condition: ">", threshold: 50000, active: true, triggered: false, created_at: new Date() };
      alertRepository.findById.mockResolvedValue(mockAlert);

      await getAlert(req, res, next);

      expect(alertRepository.findById).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ id: "1", crypto: "BTC" })
      );
    });

    it("devrait retourner 404 si alerte non trouvée", async () => {
      req.params.id = "999";
      alertRepository.findById.mockResolvedValue(null);

      await getAlert(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Alerte non trouvée" });
    });

    it("devrait retourner 403 si l'alerte appartient à un autre utilisateur", async () => {
      req.params.id = "1";
      const mockAlert = { id: 1, user_id: 2, crypto_symbol: "BTC", condition: ">", threshold: 50000, active: true };
      alertRepository.findById.mockResolvedValue(mockAlert);

      await getAlert(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: "Accès non autorisé" });
    });

    it("devrait appeler next() en cas d'erreur", async () => {
      req.params.id = "1";
      const mockError = new Error("Database error");
      alertRepository.findById.mockRejectedValue(mockError);

      await getAlert(req, res, next);

      expect(next).toHaveBeenCalledWith(mockError);
    });
  });

  describe("updateAlert", () => {
    const existingAlert = {
      id: 1,
      user_id: 1,
      crypto_symbol: "BTC",
      condition: ">",
      threshold: 50000,
      active: true,
    };

    it("devrait modifier une alerte avec succès", async () => {
      req.params.id = "1";
      req.body = { threshold: 55000 };
      alertRepository.findById.mockResolvedValue(existingAlert);
      alertRepository.update.mockResolvedValue({ ...existingAlert, threshold: 55000, created_at: new Date() });

      await updateAlert(req, res, next);

      expect(alertRepository.update).toHaveBeenCalledWith(1, "BTC", ">", 55000, true);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Alerte modifiée avec succès",
        })
      );
    });

    it("devrait retourner 404 si alerte non trouvée", async () => {
      req.params.id = "999";
      req.body = { threshold: 55000 };
      alertRepository.findById.mockResolvedValue(null);

      await updateAlert(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Alerte non trouvée" });
    });

    it("devrait retourner 403 si l'alerte appartient à un autre utilisateur", async () => {
      req.params.id = "1";
      req.body = { threshold: 55000 };
      alertRepository.findById.mockResolvedValue({ ...existingAlert, user_id: 2 });

      await updateAlert(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: "Accès non autorisé" });
    });

    it("devrait retourner 400 si condition invalide", async () => {
      req.params.id = "1";
      req.body = { condition: "==" };
      alertRepository.findById.mockResolvedValue(existingAlert);

      await updateAlert(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "La condition doit être '>' ou '<'",
      });
    });

    it("devrait retourner 400 si threshold invalide", async () => {
      req.params.id = "1";
      req.body = { threshold: -100 };
      alertRepository.findById.mockResolvedValue(existingAlert);

      await updateAlert(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Le threshold doit être un nombre positif",
      });
    });

    it("devrait appeler next() en cas d'erreur", async () => {
      req.params.id = "1";
      req.body = { threshold: 55000 };
      const mockError = new Error("Database error");
      alertRepository.findById.mockRejectedValue(mockError);

      await updateAlert(req, res, next);

      expect(next).toHaveBeenCalledWith(mockError);
    });
  });

  describe("toggleAlert", () => {
    it("devrait activer une alerte désactivée", async () => {
      req.params.id = "1";
      const mockAlert = { id: 1, user_id: 1, crypto_symbol: "BTC", condition: ">", threshold: 50000, active: false, created_at: new Date() };
      alertRepository.findById.mockResolvedValue(mockAlert);
      alertRepository.toggleActive.mockResolvedValue({ ...mockAlert, active: true });

      await toggleAlert(req, res, next);

      expect(alertRepository.toggleActive).toHaveBeenCalledWith(1, true);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Alerte activée",
        })
      );
    });

    it("devrait désactiver une alerte activée", async () => {
      req.params.id = "1";
      const mockAlert = { id: 1, user_id: 1, crypto_symbol: "BTC", condition: ">", threshold: 50000, active: true, created_at: new Date() };
      alertRepository.findById.mockResolvedValue(mockAlert);
      alertRepository.toggleActive.mockResolvedValue({ ...mockAlert, active: false });

      await toggleAlert(req, res, next);

      expect(alertRepository.toggleActive).toHaveBeenCalledWith(1, false);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Alerte désactivée",
        })
      );
    });

    it("devrait retourner 404 si alerte non trouvée", async () => {
      req.params.id = "999";
      alertRepository.findById.mockResolvedValue(null);

      await toggleAlert(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it("devrait retourner 403 si l'alerte appartient à un autre utilisateur", async () => {
      req.params.id = "1";
      alertRepository.findById.mockResolvedValue({ id: 1, user_id: 2 });

      await toggleAlert(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
    });

    it("devrait appeler next() en cas d'erreur", async () => {
      req.params.id = "1";
      const mockError = new Error("Database error");
      alertRepository.findById.mockRejectedValue(mockError);

      await toggleAlert(req, res, next);

      expect(next).toHaveBeenCalledWith(mockError);
    });
  });

  describe("deleteAlert", () => {
    it("devrait supprimer une alerte avec succès", async () => {
      req.params.id = "1";
      const mockAlert = { id: 1, user_id: 1, crypto_symbol: "BTC" };
      alertRepository.findById.mockResolvedValue(mockAlert);
      alertRepository.remove.mockResolvedValue();

      await deleteAlert(req, res, next);

      expect(alertRepository.remove).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith({ message: "Alerte supprimée avec succès" });
    });

    it("devrait retourner 404 si alerte non trouvée", async () => {
      req.params.id = "999";
      alertRepository.findById.mockResolvedValue(null);

      await deleteAlert(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it("devrait retourner 403 si l'alerte appartient à un autre utilisateur", async () => {
      req.params.id = "1";
      alertRepository.findById.mockResolvedValue({ id: 1, user_id: 2 });

      await deleteAlert(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
    });

    it("devrait appeler next() en cas d'erreur", async () => {
      req.params.id = "1";
      const mockError = new Error("Database error");
      alertRepository.findById.mockRejectedValue(mockError);

      await deleteAlert(req, res, next);

      expect(next).toHaveBeenCalledWith(mockError);
    });
  });

  describe("resetAlert", () => {
    it("devrait réinitialiser une alerte triggered", async () => {
      req.params.id = "1";
      const mockAlert = { id: 1, user_id: 1, crypto_symbol: "BTC", triggered: true, created_at: new Date() };
      alertRepository.findById.mockResolvedValue(mockAlert);
      alertRepository.resetTriggered.mockResolvedValue({ ...mockAlert, triggered: false });

      await resetAlert(req, res, next);

      expect(alertRepository.resetTriggered).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Alerte réinitialisée",
        })
      );
    });

    it("devrait retourner 404 si alerte non trouvée", async () => {
      req.params.id = "999";
      alertRepository.findById.mockResolvedValue(null);

      await resetAlert(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it("devrait retourner 403 si l'alerte appartient à un autre utilisateur", async () => {
      req.params.id = "1";
      alertRepository.findById.mockResolvedValue({ id: 1, user_id: 2 });

      await resetAlert(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
    });

    it("devrait appeler next() en cas d'erreur", async () => {
      req.params.id = "1";
      const mockError = new Error("Database error");
      alertRepository.findById.mockRejectedValue(mockError);

      await resetAlert(req, res, next);

      expect(next).toHaveBeenCalledWith(mockError);
    });
  });

  describe("checkAlerts", () => {
    it("devrait vérifier et déclencher les alertes", async () => {
      req.body = { prices: { BTC: 55000 } };
      const mockAlerts = [
        { id: 1, user_id: 1, crypto_symbol: "BTC", condition: ">", threshold: 50000, active: true, email: "test@test.com" },
      ];
      alertRepository.findActiveBySymbol.mockResolvedValue(mockAlerts);
      alertRepository.markTriggered.mockResolvedValue();

      // Mock du service de notification
      const mockNotificationService = { send: jest.fn().mockResolvedValue(true) };
      setNotificationService(mockNotificationService);

      await checkAlerts(req, res, next);

      expect(alertRepository.findActiveBySymbol).toHaveBeenCalledWith("BTC");
      expect(alertRepository.markTriggered).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "1 alerte(s) déclenchée(s)",
          triggered: expect.arrayContaining([
            expect.objectContaining({ id: "1", crypto: "BTC" }),
          ]),
        })
      );
    });

    it("devrait retourner 400 si prices manquant", async () => {
      req.body = {};

      await checkAlerts(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Le champ 'prices' est requis (objet { symbol: price })",
      });
    });

    it("devrait gérer les prix invalides", async () => {
      req.body = { prices: { BTC: -100 } };

      await checkAlerts(req, res, next);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          errors: expect.arrayContaining([
            expect.objectContaining({ symbol: "BTC", error: "Prix invalide" }),
          ]),
        })
      );
    });

    it("ne devrait pas déclencher si condition non remplie", async () => {
      req.body = { prices: { BTC: 45000 } };
      const mockAlerts = [
        { id: 1, user_id: 1, crypto_symbol: "BTC", condition: ">", threshold: 50000, active: true },
      ];
      alertRepository.findActiveBySymbol.mockResolvedValue(mockAlerts);

      await checkAlerts(req, res, next);

      expect(alertRepository.markTriggered).not.toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "0 alerte(s) déclenchée(s)",
          triggered: [],
        })
      );
    });

    it("devrait déclencher pour condition '<'", async () => {
      req.body = { prices: { BTC: 45000 } };
      const mockAlerts = [
        { id: 1, user_id: 1, crypto_symbol: "BTC", condition: "<", threshold: 50000, active: true, email: "test@test.com" },
      ];
      alertRepository.findActiveBySymbol.mockResolvedValue(mockAlerts);
      alertRepository.markTriggered.mockResolvedValue();

      const mockNotificationService = { send: jest.fn().mockResolvedValue(true) };
      setNotificationService(mockNotificationService);

      await checkAlerts(req, res, next);

      expect(alertRepository.markTriggered).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "1 alerte(s) déclenchée(s)",
        })
      );
    });

    it("devrait gérer les erreurs de notification", async () => {
      req.body = { prices: { BTC: 55000 } };
      const mockAlerts = [
        { id: 1, user_id: 1, crypto_symbol: "BTC", condition: ">", threshold: 50000, active: true },
      ];
      alertRepository.findActiveBySymbol.mockResolvedValue(mockAlerts);
      alertRepository.markTriggered.mockResolvedValue();

      const mockNotificationService = { send: jest.fn().mockRejectedValue(new Error("Email failed")) };
      setNotificationService(mockNotificationService);

      await checkAlerts(req, res, next);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          errors: expect.arrayContaining([
            expect.objectContaining({ alertId: 1, error: "Notification failed: Email failed" }),
          ]),
        })
      );
    });

    it("devrait appeler next() en cas d'erreur", async () => {
      req.body = { prices: { BTC: 55000 } };
      const mockError = new Error("Database error");
      alertRepository.findActiveBySymbol.mockRejectedValue(mockError);

      await checkAlerts(req, res, next);

      expect(next).toHaveBeenCalledWith(mockError);
    });
  });
});

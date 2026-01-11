const alertRepository = require("../../src/repositories/alert.repository");
const db = require("../../src/db/pool");

// Mock de la base de données
jest.mock("../../src/db/pool");

describe("alert.repository", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("devrait créer une nouvelle alerte", async () => {
      const mockAlert = {
        id: 1,
        user_id: 1,
        crypto_symbol: "BTC",
        condition: ">",
        threshold: 50000,
        active: true,
        triggered: false,
        created_at: new Date(),
      };
      db.query.mockResolvedValue({ rows: [mockAlert] });

      const result = await alertRepository.create(1, "btc", ">", 50000);

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO alerts"),
        [1, "BTC", ">", 50000]
      );
      expect(result).toEqual(mockAlert);
    });

    it("devrait convertir le symbole crypto en majuscules", async () => {
      db.query.mockResolvedValue({ rows: [{ id: 1, crypto_symbol: "ETH" }] });

      await alertRepository.create(1, "eth", "<", 2000);

      expect(db.query).toHaveBeenCalledWith(
        expect.any(String),
        [1, "ETH", "<", 2000]
      );
    });

    it("devrait propager l'erreur de base de données", async () => {
      const mockError = new Error("Database connection failed");
      db.query.mockRejectedValue(mockError);

      await expect(alertRepository.create(1, "BTC", ">", 50000)).rejects.toThrow("Database connection failed");
    });
  });

  describe("findByUserId", () => {
    it("devrait retourner toutes les alertes d'un utilisateur", async () => {
      const mockAlerts = [
        { id: 1, crypto_symbol: "BTC", condition: ">", threshold: 50000, active: true },
        { id: 2, crypto_symbol: "ETH", condition: "<", threshold: 2000, active: true },
      ];
      db.query.mockResolvedValue({ rows: mockAlerts });

      const result = await alertRepository.findByUserId(1);

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining("WHERE user_id = $1"),
        [1]
      );
      expect(result).toEqual(mockAlerts);
      expect(result).toHaveLength(2);
    });

    it("devrait retourner un tableau vide si aucune alerte", async () => {
      db.query.mockResolvedValue({ rows: [] });

      const result = await alertRepository.findByUserId(999);

      expect(result).toEqual([]);
    });

    it("devrait propager l'erreur de base de données", async () => {
      const mockError = new Error("Query failed");
      db.query.mockRejectedValue(mockError);

      await expect(alertRepository.findByUserId(1)).rejects.toThrow("Query failed");
    });
  });

  describe("findById", () => {
    it("devrait retourner une alerte par son ID", async () => {
      const mockAlert = {
        id: 1,
        user_id: 1,
        crypto_symbol: "BTC",
        condition: ">",
        threshold: 50000,
      };
      db.query.mockResolvedValue({ rows: [mockAlert] });

      const result = await alertRepository.findById(1);

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining("WHERE id = $1"),
        [1]
      );
      expect(result).toEqual(mockAlert);
    });

    it("devrait retourner null si alerte non trouvée", async () => {
      db.query.mockResolvedValue({ rows: [] });

      const result = await alertRepository.findById(999);

      expect(result).toBeNull();
    });

    it("devrait propager l'erreur de base de données", async () => {
      const mockError = new Error("Query failed");
      db.query.mockRejectedValue(mockError);

      await expect(alertRepository.findById(1)).rejects.toThrow("Query failed");
    });
  });

  describe("update", () => {
    it("devrait mettre à jour une alerte", async () => {
      const mockUpdatedAlert = {
        id: 1,
        crypto_symbol: "BTC",
        condition: "<",
        threshold: 45000,
        active: false,
        triggered: false,
      };
      db.query.mockResolvedValue({ rows: [mockUpdatedAlert] });

      const result = await alertRepository.update(1, "btc", "<", 45000, false);

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining("UPDATE alerts"),
        [1, "BTC", "<", 45000, false]
      );
      expect(result).toEqual(mockUpdatedAlert);
    });

    it("devrait convertir le symbole en majuscules", async () => {
      db.query.mockResolvedValue({ rows: [{ id: 1 }] });

      await alertRepository.update(1, "eth", ">", 3000, true);

      expect(db.query).toHaveBeenCalledWith(
        expect.any(String),
        [1, "ETH", ">", 3000, true]
      );
    });

    it("devrait retourner null si alerte non trouvée", async () => {
      db.query.mockResolvedValue({ rows: [] });

      const result = await alertRepository.update(999, "BTC", ">", 50000, true);

      expect(result).toBeNull();
    });

    it("devrait propager l'erreur de base de données", async () => {
      const mockError = new Error("Update failed");
      db.query.mockRejectedValue(mockError);

      await expect(alertRepository.update(1, "BTC", ">", 50000, true)).rejects.toThrow("Update failed");
    });
  });

  describe("toggleActive", () => {
    it("devrait activer une alerte", async () => {
      const mockAlert = { id: 1, crypto_symbol: "BTC", active: true };
      db.query.mockResolvedValue({ rows: [mockAlert] });

      const result = await alertRepository.toggleActive(1, true);

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining("SET active = $2"),
        [1, true]
      );
      expect(result.active).toBe(true);
    });

    it("devrait désactiver une alerte", async () => {
      const mockAlert = { id: 1, crypto_symbol: "BTC", active: false };
      db.query.mockResolvedValue({ rows: [mockAlert] });

      const result = await alertRepository.toggleActive(1, false);

      expect(db.query).toHaveBeenCalledWith(
        expect.any(String),
        [1, false]
      );
      expect(result.active).toBe(false);
    });

    it("devrait retourner null si alerte non trouvée", async () => {
      db.query.mockResolvedValue({ rows: [] });

      const result = await alertRepository.toggleActive(999, true);

      expect(result).toBeNull();
    });

    it("devrait propager l'erreur de base de données", async () => {
      const mockError = new Error("Toggle failed");
      db.query.mockRejectedValue(mockError);

      await expect(alertRepository.toggleActive(1, true)).rejects.toThrow("Toggle failed");
    });
  });

  describe("remove", () => {
    it("devrait supprimer une alerte et retourner true", async () => {
      db.query.mockResolvedValue({ rowCount: 1 });

      const result = await alertRepository.remove(1);

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining("DELETE FROM alerts"),
        [1]
      );
      expect(result).toBe(true);
    });

    it("devrait retourner false si alerte non trouvée", async () => {
      db.query.mockResolvedValue({ rowCount: 0 });

      const result = await alertRepository.remove(999);

      expect(result).toBe(false);
    });

    it("devrait propager l'erreur de base de données", async () => {
      const mockError = new Error("Delete failed");
      db.query.mockRejectedValue(mockError);

      await expect(alertRepository.remove(1)).rejects.toThrow("Delete failed");
    });
  });

  describe("findActiveBySymbol", () => {
    it("devrait retourner les alertes actives non déclenchées pour une crypto", async () => {
      const mockAlerts = [
        { id: 1, user_id: 1, crypto_symbol: "BTC", condition: ">", threshold: 50000, email: "user1@test.com" },
        { id: 2, user_id: 2, crypto_symbol: "BTC", condition: "<", threshold: 45000, email: "user2@test.com" },
      ];
      db.query.mockResolvedValue({ rows: mockAlerts });

      const result = await alertRepository.findActiveBySymbol("btc");

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining("WHERE a.crypto_symbol = $1 AND a.active = TRUE AND a.triggered = FALSE"),
        ["BTC"]
      );
      expect(result).toHaveLength(2);
    });

    it("devrait convertir le symbole en majuscules", async () => {
      db.query.mockResolvedValue({ rows: [] });

      await alertRepository.findActiveBySymbol("eth");

      expect(db.query).toHaveBeenCalledWith(
        expect.any(String),
        ["ETH"]
      );
    });

    it("devrait retourner un tableau vide si aucune alerte active", async () => {
      db.query.mockResolvedValue({ rows: [] });

      const result = await alertRepository.findActiveBySymbol("XRP");

      expect(result).toEqual([]);
    });

    it("devrait propager l'erreur de base de données", async () => {
      const mockError = new Error("Query failed");
      db.query.mockRejectedValue(mockError);

      await expect(alertRepository.findActiveBySymbol("BTC")).rejects.toThrow("Query failed");
    });
  });

  describe("markTriggered", () => {
    it("devrait marquer une alerte comme déclenchée", async () => {
      const mockResult = { id: 1, triggered: true, triggered_at: new Date() };
      db.query.mockResolvedValue({ rows: [mockResult] });

      const result = await alertRepository.markTriggered(1);

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining("SET triggered = TRUE"),
        [1]
      );
      expect(result.triggered).toBe(true);
      expect(result.triggered_at).toBeDefined();
    });

    it("devrait retourner null si alerte non trouvée", async () => {
      db.query.mockResolvedValue({ rows: [] });

      const result = await alertRepository.markTriggered(999);

      expect(result).toBeNull();
    });

    it("devrait propager l'erreur de base de données", async () => {
      const mockError = new Error("Mark triggered failed");
      db.query.mockRejectedValue(mockError);

      await expect(alertRepository.markTriggered(1)).rejects.toThrow("Mark triggered failed");
    });
  });

  describe("resetTriggered", () => {
    it("devrait réinitialiser le statut triggered d'une alerte", async () => {
      const mockResult = { id: 1, triggered: false };
      db.query.mockResolvedValue({ rows: [mockResult] });

      const result = await alertRepository.resetTriggered(1);

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining("SET triggered = FALSE"),
        [1]
      );
      expect(result.triggered).toBe(false);
    });

    it("devrait retourner null si alerte non trouvée", async () => {
      db.query.mockResolvedValue({ rows: [] });

      const result = await alertRepository.resetTriggered(999);

      expect(result).toBeNull();
    });

    it("devrait propager l'erreur de base de données", async () => {
      const mockError = new Error("Reset failed");
      db.query.mockRejectedValue(mockError);

      await expect(alertRepository.resetTriggered(1)).rejects.toThrow("Reset failed");
    });
  });
});

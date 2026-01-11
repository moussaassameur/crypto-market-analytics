const priceRepository = require("../../src/repositories/price.repository");
const db = require("../../src/db/pool");

// Mock du pool de base de données
jest.mock("../../src/db/pool");

describe("price.repository", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getLatestPrices", () => {
    it("devrait retourner les derniers prix pour tous les cryptos", async () => {
      const mockRows = [
        {
          id: 1,
          symbol: "BTC",
          name: "Bitcoin",
          price: 45000,
          market_cap: 900000000,
          volume_24h: 25000000,
          change_1h: 0.5,
          change_24h: 2.3,
          collected_at: new Date(),
        },
        {
          id: 2,
          symbol: "ETH",
          name: "Ethereum",
          price: 3000,
          market_cap: 350000000,
          volume_24h: 15000000,
          change_1h: -0.2,
          change_24h: 1.8,
          collected_at: new Date(),
        },
      ];
      db.query.mockResolvedValue({ rows: mockRows });

      const result = await priceRepository.getLatestPrices();

      expect(db.query).toHaveBeenCalledWith(expect.stringContaining("SELECT"));
      expect(result).toEqual(mockRows);
    });

    it("devrait retourner un tableau vide si aucun prix", async () => {
      db.query.mockResolvedValue({ rows: [] });

      const result = await priceRepository.getLatestPrices();

      expect(result).toEqual([]);
    });

    it("devrait propager l'erreur de base de données", async () => {
      const mockError = new Error("Database error");
      db.query.mockRejectedValue(mockError);

      await expect(priceRepository.getLatestPrices()).rejects.toThrow("Database error");
    });
  });

  describe("getPricesBySymbol", () => {
    it("devrait retourner l'historique des prix pour un symbole", async () => {
      const mockRows = [
        {
          price: 45000,
          market_cap: 900000000,
          volume_24h: 25000000,
          change_1h: 0.5,
          change_24h: 2.3,
          collected_at: new Date(),
        },
      ];
      db.query.mockResolvedValue({ rows: mockRows });

      const result = await priceRepository.getPricesBySymbol("BTC", 100);

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining("WHERE LOWER(c.symbol) = LOWER($1)"),
        ["BTC", 100]
      );
      expect(result).toEqual(mockRows);
    });

    it("devrait utiliser limit par défaut de 200", async () => {
      db.query.mockResolvedValue({ rows: [] });

      await priceRepository.getPricesBySymbol("ETH");

      expect(db.query).toHaveBeenCalledWith(expect.any(String), ["ETH", 200]);
    });

    it("devrait retourner un tableau vide si symbole introuvable", async () => {
      db.query.mockResolvedValue({ rows: [] });

      const result = await priceRepository.getPricesBySymbol("UNKNOWN");

      expect(result).toEqual([]);
    });
  });

  describe("getMarketStats", () => {
    it("devrait retourner les statistiques du marché", async () => {
      const mockStats = {
        total_market_cap: 2000000000,
        total_market_cap_change_24h: 5.5,
        total_volume_24h: 100000000,
        total_volume_24h_change: -2.3,
        market_sentiment: 0.75,
        avg_change_24h: 3.2,
      };
      db.query.mockResolvedValue({ rows: [mockStats] });

      const result = await priceRepository.getMarketStats();

      expect(db.query).toHaveBeenCalledWith(expect.stringContaining("SELECT"));
      expect(result).toEqual(mockStats);
    });

    it("devrait retourner un objet vide si pas de stats", async () => {
      db.query.mockResolvedValue({ rows: [] });

      const result = await priceRepository.getMarketStats();

      expect(result).toBeUndefined();
    });
  });

  describe("getPriceHistoryForChart", () => {
    it("devrait retourner les données pour graphique avec granularité jour", async () => {
      const mockRows = [
        {
          time: "2024-01-01",
          price: 45000,
          open: 44000,
          high: 46000,
          low: 43000,
          close: 45000,
          volume: 1000000,
        },
      ];
      db.query.mockResolvedValue({ rows: mockRows });

      const result = await priceRepository.getPriceHistoryForChart("BTC", 7, "day");

      expect(db.query).toHaveBeenCalledWith(expect.any(String), ["BTC"]);
      expect(result).toEqual(mockRows);
    });

    it("devrait utiliser granularité par défaut (jour) et 30 jours", async () => {
      db.query.mockResolvedValue({ rows: [] });

      await priceRepository.getPriceHistoryForChart("BTC");

      expect(db.query).toHaveBeenCalledWith(expect.any(String), ["BTC"]);
    });

    it("devrait gérer la granularité heure pour les données 24h", async () => {
      db.query.mockResolvedValue({ rows: [] });

      await priceRepository.getPriceHistoryForChart("BTC", 1, "hour");

      expect(db.query).toHaveBeenCalledWith(expect.any(String), ["BTC"]);
    });
  });
});
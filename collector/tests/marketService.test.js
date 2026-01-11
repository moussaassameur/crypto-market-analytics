const marketService = require("../src/marketService");
const db = require("../src/db");
const axios = require("axios");
const alertService = require("../src/alertService");

// Mock des dépendances
jest.mock("../src/db");
jest.mock("axios");
jest.mock("../src/alertService");
jest.mock("../src/logger", () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
}));

describe("marketService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("fetchMarketData", () => {
    it("devrait récupérer et sauvegarder les données de marché", async () => {
      const mockCoinData = [
        {
          id: "bitcoin",
          symbol: "btc",
          name: "Bitcoin",
          current_price: 50000,
          market_cap: 1000000000,
          total_volume: 50000000,
          price_change_percentage_1h_in_currency: 0.5,
          price_change_percentage_24h: 2.5,
        },
        {
          id: "ethereum",
          symbol: "eth",
          name: "Ethereum",
          current_price: 3000,
          market_cap: 500000000,
          total_volume: 25000000,
          price_change_percentage_1h_in_currency: -0.3,
          price_change_percentage_24h: 1.2,
        },
      ];

      axios.get.mockResolvedValue({ data: mockCoinData });
      db.query.mockResolvedValue({});
      alertService.processAlerts.mockResolvedValue({ triggered: 0, errors: 0 });

      await marketService.fetchMarketData();

      expect(axios.get).toHaveBeenCalledWith(
        "https://api.coingecko.com/api/v3/coins/markets",
        expect.objectContaining({
          params: expect.objectContaining({
            vs_currency: "usd",
            ids: "bitcoin,ethereum,solana",
          }),
        })
      );

      // Vérifie que les données ont été insérées
      expect(db.query).toHaveBeenCalledTimes(2);
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO prices"),
        [1, 50000, 1000000000, 50000000, 0.5, 2.5]
      );
    });

    it("devrait gérer les erreurs API", async () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();
      axios.get.mockRejectedValue(new Error("API Error"));

      await marketService.fetchMarketData();

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("Erreur lors de la récupération"),
        "API Error"
      );
      consoleSpy.mockRestore();
    });

    it("devrait vérifier les alertes après la collecte", async () => {
      const mockData = [
        {
          id: "bitcoin",
          symbol: "btc",
          name: "Bitcoin",
          current_price: 60000,
          market_cap: 1000000000,
          total_volume: 50000000,
          price_change_percentage_1h_in_currency: 0.5,
          price_change_percentage_24h: 5.0,
        },
      ];

      axios.get.mockResolvedValue({ data: mockData });
      db.query.mockResolvedValue({});
      alertService.processAlerts.mockResolvedValue({ triggered: 2, errors: 0 });

      await marketService.fetchMarketData();

      expect(alertService.processAlerts).toHaveBeenCalledWith(mockData);
    });

    it("devrait ignorer les cryptos inconnues", async () => {
      const consoleSpy = jest.spyOn(console, "warn").mockImplementation();
      const mockData = [
        {
          id: "unknown-coin",
          symbol: "unk",
          name: "Unknown Coin",
          current_price: 100,
          market_cap: 1000,
          total_volume: 500,
          price_change_percentage_1h_in_currency: 0.1,
          price_change_percentage_24h: 0.2,
        },
      ];

      axios.get.mockResolvedValue({ data: mockData });
      alertService.processAlerts.mockResolvedValue({ triggered: 0, errors: 0 });

      await marketService.fetchMarketData();

      expect(db.query).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });
});

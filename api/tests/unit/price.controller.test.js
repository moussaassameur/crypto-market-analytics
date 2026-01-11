const { getLatest, getHistoryBySymbol, getMarketStats, getChartData } = require("../../src/controllers/price.controller");
const priceRepository = require("../../src/repositories/price.repository");

// Mock du repository
jest.mock("../../src/repositories/price.repository");

describe("price.controller", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      params: {},
      query: {},
    };
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe("getLatest", () => {
    it("devrait retourner les derniers prix", async () => {
      const mockPrices = [
        { symbol: "BTC", price: 45000 },
        { symbol: "ETH", price: 3000 },
      ];
      priceRepository.getLatestPrices.mockResolvedValue(mockPrices);

      await getLatest(req, res, next);

      expect(priceRepository.getLatestPrices).toHaveBeenCalledTimes(1);
      expect(res.json).toHaveBeenCalledWith(mockPrices);
      expect(next).not.toHaveBeenCalled();
    });

    it("devrait appeler next() en cas d'erreur", async () => {
      const mockError = new Error("Database error");
      priceRepository.getLatestPrices.mockRejectedValue(mockError);

      await getLatest(req, res, next);

      expect(next).toHaveBeenCalledWith(mockError);
    });
  });

  describe("getHistoryBySymbol", () => {
    it("devrait retourner l'historique des prix pour un symbole", async () => {
      req.params.symbol = "BTC";
      req.query.limit = "100";
      const mockPrices = [
        { price: 45000, timestamp: new Date() },
        { price: 44000, timestamp: new Date() },
      ];
      priceRepository.getPricesBySymbol.mockResolvedValue(mockPrices);

      await getHistoryBySymbol(req, res, next);

      expect(priceRepository.getPricesBySymbol).toHaveBeenCalledWith("BTC", 100);
      expect(res.json).toHaveBeenCalledWith({
        symbol: "btc",
        count: 2,
        prices: mockPrices,
      });
    });

    it("devrait utiliser limit par défaut de 200", async () => {
      req.params.symbol = "ETH";
      const mockPrices = [{ price: 3000, timestamp: new Date() }];
      priceRepository.getPricesBySymbol.mockResolvedValue(mockPrices);

      await getHistoryBySymbol(req, res, next);

      expect(priceRepository.getPricesBySymbol).toHaveBeenCalledWith("ETH", 200);
    });

    it("devrait retourner 404 si aucune donnée trouvée", async () => {
      req.params.symbol = "UNKNOWN";
      priceRepository.getPricesBySymbol.mockResolvedValue([]);

      await getHistoryBySymbol(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "Not Found",
        message: "Symbol inconnu ou pas de données",
        symbol: "UNKNOWN",
      });
    });

    it("devrait appeler next() en cas d'erreur", async () => {
      req.params.symbol = "BTC";
      const mockError = new Error("Database error");
      priceRepository.getPricesBySymbol.mockRejectedValue(mockError);

      await getHistoryBySymbol(req, res, next);

      expect(next).toHaveBeenCalledWith(mockError);
    });
  });

  describe("getMarketStats", () => {
    it("devrait retourner les statistiques de marché", async () => {
      const mockStats = {
        total_market_cap: 2000000000,
        total_market_cap_change_24h: 5.5,
        total_volume_24h: 100000000,
        total_volume_24h_change: -2.3,
        market_sentiment: 0.75,
        avg_change_24h: 3.2,
      };
      priceRepository.getMarketStats.mockResolvedValue(mockStats);

      await getMarketStats(req, res, next);

      expect(priceRepository.getMarketStats).toHaveBeenCalledTimes(1);
      expect(res.json).toHaveBeenCalledWith({
        totalMarketCap: 2000000000,
        totalMarketCapChange24h: 5.5,
        totalVolume24h: 100000000,
        totalVolume24hChange: -2.3,
        marketSentiment: 0.75,
        avgChange24h: 3.2,
      });
    });

    it("devrait retourner des valeurs par défaut si stats manquantes", async () => {
      const mockStats = {}; // Objet vide
      priceRepository.getMarketStats.mockResolvedValue(mockStats);

      await getMarketStats(req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        totalMarketCap: 0,
        totalMarketCapChange24h: 0,
        totalVolume24h: 0,
        totalVolume24hChange: 0,
        marketSentiment: 0,
        avgChange24h: 0,
      });
    });

    it("devrait appeler next() en cas d'erreur", async () => {
      const mockError = new Error("Database error");
      priceRepository.getMarketStats.mockRejectedValue(mockError);

      await getMarketStats(req, res, next);

      expect(next).toHaveBeenCalledWith(mockError);
    });
  });

  describe("getChartData", () => {
    beforeEach(() => {
      req.params.symbol = "BTC";
    });

    it("devrait retourner les données de graphique avec range par défaut", async () => {
      const mockData = [
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
      priceRepository.getPriceHistoryForChart.mockResolvedValue(mockData);

      await getChartData(req, res, next);

      expect(priceRepository.getPriceHistoryForChart).toHaveBeenCalledWith("BTC", 7, "day");
      expect(res.json).toHaveBeenCalledWith({
        symbol: "btc",
        range: "7j",
        count: 1,
        data: [
          {
            time: "2024-01-01",
            price: 45000,
            open: 44000,
            high: 46000,
            low: 43000,
            close: 45000,
            volume: 1000000,
          },
        ],
      });
    });

    it("devrait gérer le range 24h avec granularité heure", async () => {
      req.query.range = "24h";
      const mockData = [{ time: "2024-01-01T12:00:00Z", price: 45000 }];
      priceRepository.getPriceHistoryForChart.mockResolvedValue(mockData);

      await getChartData(req, res, next);

      expect(priceRepository.getPriceHistoryForChart).toHaveBeenCalledWith("BTC", 1, "hour");
    });

    it("devrait gérer différents ranges de temps", async () => {
      const testCases = [
        { range: "1 mois", expectedDays: 30 },
        { range: "3 mois", expectedDays: 90 },
        { range: "1 an", expectedDays: 365 },
      ];

      for (const testCase of testCases) {
        req.query.range = testCase.range;
        priceRepository.getPriceHistoryForChart.mockResolvedValue([]);

        await getChartData(req, res, next);

        expect(priceRepository.getPriceHistoryForChart).toHaveBeenCalledWith(
          "BTC",
          testCase.expectedDays,
          "day"
        );
      }
    });

    it("devrait retourner 404 si aucune donnée trouvée", async () => {
      priceRepository.getPriceHistoryForChart.mockResolvedValue([]);

      await getChartData(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "Not Found",
        message: "Aucune donnée trouvée pour ce symbole",
        symbol: "BTC",
      });
    });

    it("devrait appeler next() en cas d'erreur", async () => {
      const mockError = new Error("Database error");
      priceRepository.getPriceHistoryForChart.mockRejectedValue(mockError);

      await getChartData(req, res, next);

      expect(next).toHaveBeenCalledWith(mockError);
    });
  });
});
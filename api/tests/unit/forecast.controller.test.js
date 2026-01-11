const { getForecast, getIndicators } = require("../../src/controllers/forecast.controller");
const forecastRepository = require("../../src/repositories/forecast.repository");

// Mock du repository
jest.mock("../../src/repositories/forecast.repository");

describe("forecast.controller", () => {
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

  describe("getForecast", () => {
    beforeEach(() => {
      req.params.symbol = "BTC";
    });

    it("devrait générer une prévision avec des données suffisantes", async () => {
      // Mock des données historiques avec au moins 30 points
      const mockPrices = Array.from({ length: 50 }, (_, i) => ({ 
        date: `2024-01-${String(i + 1).padStart(2, '0')}`, 
        price: 40000 + i * 100 
      }));
      forecastRepository.getPriceHistoryForForecast.mockResolvedValue(mockPrices);

      await getForecast(req, res, next);

      expect(forecastRepository.getPriceHistoryForForecast).toHaveBeenCalledWith("BTC", 90);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          symbol: "btc",
          model: "combined",
          confidence: expect.any(String),
          forecast: expect.arrayContaining([
            expect.objectContaining({
              date: expect.any(String),
              price: expect.any(Number),
              confidence: expect.any(Number),
            }),
          ]),
          indicators: expect.objectContaining({
            sma7: expect.any(Number),
            sma14: expect.any(Number),
            ema7: expect.any(Number),
            ema14: expect.any(Number),
            trend: expect.any(String),
            volatility: expect.any(Number),
            rsi: expect.any(Number),
          }),
        })
      );
      expect(next).not.toHaveBeenCalled();
    });

    it("devrait retourner 400 si pas assez de données historiques", async () => {
      const mockPrices = [
        { date: "2024-01-01", price: 40000 }, 
        { date: "2024-01-02", price: 41000 }
      ]; // Seulement 2 points
      forecastRepository.getPriceHistoryForForecast.mockResolvedValue(mockPrices);

      await getForecast(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Insufficient Data",
        message: "Pas assez de données historiques pour générer une prévision fiable",
        dataPoints: 2,
        required: 30,
      });
    });

    it("devrait gérer différents modèles de prévision", async () => {
      const mockPrices = Array.from({ length: 50 }, (_, i) => ({ 
        date: `2024-01-${String(i + 1).padStart(2, '0')}`, 
        price: 40000 + i * 100 
      }));
      forecastRepository.getPriceHistoryForForecast.mockResolvedValue(mockPrices);

      const models = ["linear", "sma", "ema", "combined"];

      for (const model of models) {
        req.query.model = model;
        await getForecast(req, res, next);

        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            model: model,
          })
        );
      }
    });

    it("devrait gérer différentes durées de prévision", async () => {
      const mockPrices = Array.from({ length: 50 }, (_, i) => ({ 
        date: `2024-01-${String(i + 1).padStart(2, '0')}`, 
        price: 40000 + i * 100 
      }));
      forecastRepository.getPriceHistoryForForecast.mockResolvedValue(mockPrices);

      req.query.days = "14";
      await getForecast(req, res, next);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          forecast: expect.arrayContaining(
            Array.from({ length: 14 }, () =>
              expect.objectContaining({
                date: expect.any(String),
                price: expect.any(Number),
                confidence: expect.any(Number),
              })
            )
          ),
        })
      );
    });

    it("devrait limiter les jours de prévision à 30 maximum", async () => {
      const mockPrices = Array.from({ length: 50 }, (_, i) => ({ 
        date: `2024-01-${String(i + 1).padStart(2, '0')}`, 
        price: 40000 + i * 100 
      }));
      forecastRepository.getPriceHistoryForForecast.mockResolvedValue(mockPrices);

      req.query.days = "50"; // Plus que le maximum de 30
      await getForecast(req, res, next);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          forecast: expect.arrayContaining(
            Array.from({ length: 30 }, () =>
              expect.objectContaining({
                date: expect.any(String),
                price: expect.any(Number),
                confidence: expect.any(Number),
              })
            )
          ),
        })
      );
    });

    it("devrait appeler next() en cas d'erreur", async () => {
      const mockError = new Error("Database error");
      forecastRepository.getPriceHistoryForForecast.mockRejectedValue(mockError);

      await getForecast(req, res, next);

      expect(next).toHaveBeenCalledWith(mockError);
    });
  });

  describe("getIndicators", () => {
    beforeEach(() => {
      req.params.symbol = "BTC";
    });

    it("devrait retourner les indicateurs techniques", async () => {
      const mockPrices = Array.from({ length: 50 }, (_, i) => ({ 
        date: `2024-01-${String(i + 1).padStart(2, '0')}`, 
        price: 40000 + i * 100 
      }));
      forecastRepository.getPriceHistoryForForecast.mockResolvedValue(mockPrices);

      await getIndicators(req, res, next);

      expect(forecastRepository.getPriceHistoryForForecast).toHaveBeenCalledWith("BTC", 90);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          symbol: "btc",
          indicators: expect.objectContaining({
            sma7: expect.any(Number),
            sma14: expect.any(Number),
            ema7: expect.any(Number),
            ema14: expect.any(Number),
            rsi: expect.any(Number),
            trend: expect.any(String),
            volatility: expect.any(Number),
          }),
          lastPrice: expect.any(Number),
          timestamp: expect.any(String),
        })
      );
    });

    it("devrait retourner 400 si pas assez de données", async () => {
      const mockPrices = [{ date: "2024-01-01", price: 40000 }]; // Seulement 1 point
      forecastRepository.getPriceHistoryForForecast.mockResolvedValue(mockPrices);

      await getIndicators(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Insufficient Data",
        message: "Pas assez de données pour calculer les indicateurs",
        dataPoints: 1,
        required: 14,
      });
    });

    it("devrait appeler next() en cas d'erreur", async () => {
      const mockError = new Error("Database error");
      forecastRepository.getPriceHistoryForForecast.mockRejectedValue(mockError);

      await getIndicators(req, res, next);

      expect(next).toHaveBeenCalledWith(mockError);
    });
  });
});
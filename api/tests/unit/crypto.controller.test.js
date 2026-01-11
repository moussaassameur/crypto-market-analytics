const { getCryptos, getLatest } = require("../../src/controllers/crypto.controller");
const cryptoRepository = require("../../src/repositories/crypto.repository");

// Mock du repository
jest.mock("../../src/repositories/crypto.repository");

describe("crypto.controller", () => {
  let req, res, next;

  beforeEach(() => {
    req = {};
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe("getCryptos", () => {
    it("devrait retourner la liste des cryptos", async () => {
      const mockCryptos = [
        { id: 1, symbol: "BTC", name: "Bitcoin" },
        { id: 2, symbol: "ETH", name: "Ethereum" },
      ];
      cryptoRepository.getAllCryptos.mockResolvedValue(mockCryptos);

      await getCryptos(req, res, next);

      expect(cryptoRepository.getAllCryptos).toHaveBeenCalledTimes(1);
      expect(res.json).toHaveBeenCalledWith(mockCryptos);
      expect(next).not.toHaveBeenCalled();
    });

    it("devrait appeler next() en cas d'erreur", async () => {
      const mockError = new Error("Database error");
      cryptoRepository.getAllCryptos.mockRejectedValue(mockError);

      await getCryptos(req, res, next);

      expect(cryptoRepository.getAllCryptos).toHaveBeenCalledTimes(1);
      expect(res.json).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(mockError);
    });
  });

  describe("getLatest", () => {
    it("devrait retourner la liste des cryptos", async () => {
      const mockCryptos = [
        { id: 1, symbol: "BTC", name: "Bitcoin" },
        { id: 2, symbol: "ETH", name: "Ethereum" },
      ];
      cryptoRepository.getAllCryptos.mockResolvedValue(mockCryptos);

      await getLatest(req, res, next);

      expect(cryptoRepository.getAllCryptos).toHaveBeenCalledTimes(1);
      expect(res.json).toHaveBeenCalledWith(mockCryptos);
      expect(next).not.toHaveBeenCalled();
    });

    it("devrait appeler next() en cas d'erreur", async () => {
      const mockError = new Error("Database error");
      cryptoRepository.getAllCryptos.mockRejectedValue(mockError);

      await getLatest(req, res, next);

      expect(cryptoRepository.getAllCryptos).toHaveBeenCalledTimes(1);
      expect(res.json).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(mockError);
    });
  });
});
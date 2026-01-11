const cryptoRepository = require("../../src/repositories/crypto.repository");
const db = require("../../src/db/pool");

// Mock du pool de base de données
jest.mock("../../src/db/pool");

describe("crypto.repository", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getAllCryptos", () => {
    it("devrait retourner tous les cryptos triés par nom", async () => {
      const mockRows = [
        { id: 1, symbol: "BTC", name: "Bitcoin" },
        { id: 2, symbol: "ETH", name: "Ethereum" },
      ];
      db.query.mockResolvedValue({ rows: mockRows });

      const result = await cryptoRepository.getAllCryptos();

      expect(db.query).toHaveBeenCalledWith(`
    SELECT id, symbol, name
    FROM cryptos
    ORDER BY name ASC;
  `);
      expect(result).toEqual(mockRows);
    });

    it("devrait retourner un tableau vide si aucun crypto", async () => {
      db.query.mockResolvedValue({ rows: [] });

      const result = await cryptoRepository.getAllCryptos();

      expect(result).toEqual([]);
    });

    it("devrait propager l'erreur de base de données", async () => {
      const mockError = new Error("Database connection failed");
      db.query.mockRejectedValue(mockError);

      await expect(cryptoRepository.getAllCryptos()).rejects.toThrow("Database connection failed");
    });
  });
});
const priceRepository = require("../repositories/price.repository");

const getLatest = async (req, res, next) => {
  try {
    const data = await priceRepository.getLatestPrices();
    res.json(data);
  } catch (e) {
    next(e);
  }
};

const getHistoryBySymbol = async (req, res, next) => {
  try {
    const { symbol } = req.params;
    const limit = Number(req.query.limit || 200);

    const rows = await priceRepository.getPricesBySymbol(symbol, limit);

    if (!rows.length) {
      return res.status(404).json({
        error: "Not Found",
        message: "Symbol inconnu ou pas de données",
        symbol,
      });
    }

    res.json({ symbol: symbol.toLowerCase(), count: rows.length, prices: rows });
  } catch (e) {
    next(e);
  }
};

module.exports = { getLatest, getHistoryBySymbol };

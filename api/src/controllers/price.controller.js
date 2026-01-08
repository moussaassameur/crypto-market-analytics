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

const getMarketStats = async (req, res, next) => {
  try {
    const stats = await priceRepository.getMarketStats();
    
    res.json({
      totalMarketCap: stats.total_market_cap || 0,
      totalMarketCapChange24h: stats.total_market_cap_change_24h || 0,
      totalVolume24h: stats.total_volume_24h || 0,
      totalVolume24hChange: stats.total_volume_24h_change || 0,
      marketSentiment: stats.market_sentiment || 0,
      avgChange24h: stats.avg_change_24h || 0,
    });
  } catch (e) {
    next(e);
  }
};

const getChartData = async (req, res, next) => {
  try {
    const { symbol } = req.params;
    const { range = '7j' } = req.query;

    // Convert time range to days
    const daysMap = {
      '24h': 1,
      '7j': 7,
      '1 mois': 30,
      '3 mois': 90,
      '1 an': 365,
    };

    const days = daysMap[range] || 30;
    const data = await priceRepository.getPriceHistoryForChart(symbol, days);

    if (!data.length) {
      return res.status(404).json({
        error: "Not Found",
        message: "Aucune donnée trouvée pour ce symbole",
        symbol,
      });
    }

    // Format data for all chart types
    const formattedData = data.map(row => ({
      time: row.time,
      // For line chart
      price: parseFloat(row.price),
      // For candlestick chart
      open: parseFloat(row.open),
      high: parseFloat(row.high),
      low: parseFloat(row.low),
      close: parseFloat(row.close),
      // For volume chart
      volume: parseFloat(row.volume || 0),
    }));

    res.json({
      symbol: symbol.toLowerCase(),
      range,
      count: formattedData.length,
      data: formattedData,
    });
  } catch (e) {
    next(e);
  }
};

module.exports = { getLatest, getHistoryBySymbol, getMarketStats, getChartData };

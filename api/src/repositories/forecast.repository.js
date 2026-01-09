const db = require("../db/pool");

/**
 * Récupère l'historique des prix pour les calculs de prévision
 * @param {string} symbol - Symbole de la crypto (BTC, ETH, SOL)
 * @param {number} days - Nombre de jours d'historique à récupérer
 */
const getPriceHistoryForForecast = async (symbol, days = 90) => {
  const query = `
    SELECT
      DATE(p.collected_at) as date,
      AVG(p.price) as price,
      MAX(p.price) as high,
      MIN(p.price) as low,
      (array_agg(p.price ORDER BY p.collected_at ASC))[1] as open,
      (array_agg(p.price ORDER BY p.collected_at DESC))[1] as close
    FROM prices p
    JOIN cryptos c ON c.id = p.crypto_id
    WHERE LOWER(c.symbol) = LOWER($1)
      AND p.collected_at >= NOW() - INTERVAL '${days} days'
    GROUP BY DATE(p.collected_at)
    ORDER BY DATE(p.collected_at) ASC;
  `;
  const { rows } = await db.query(query, [symbol]);
  return rows;
};

/**
 * Récupère le prix actuel d'une crypto
 */
const getCurrentPrice = async (symbol) => {
  const query = `
    SELECT 
      p.price,
      p.change_24h,
      p.collected_at
    FROM prices p
    JOIN cryptos c ON c.id = p.crypto_id
    WHERE LOWER(c.symbol) = LOWER($1)
    ORDER BY p.collected_at DESC
    LIMIT 1;
  `;
  const { rows } = await db.query(query, [symbol]);
  return rows[0] || null;
};

module.exports = {
  getPriceHistoryForForecast,
  getCurrentPrice,
};

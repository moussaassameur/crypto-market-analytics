const db = require("../db/pool");

const getLatestPrices = async () => {
  const query = `
    SELECT 
      c.id, 
      c.symbol, 
      c.name, 
      p.price, 
      p.market_cap,
      p.volume_24h,
      p.change_1h,
      p.change_24h,
      p.collected_at
    FROM cryptos c
    JOIN LATERAL (
      SELECT price, market_cap, volume_24h, change_1h, change_24h, collected_at
      FROM prices
      WHERE crypto_id = c.id
      ORDER BY collected_at DESC
      LIMIT 1
    ) p ON true
    ORDER BY c.name ASC;
  `;
  const { rows } = await db.query(query);
  return rows;
};

module.exports = { getLatestPrices };

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

const getPricesBySymbol = async (symbol, limit = 200) => {
  const query = `
    SELECT
      p.price,
      p.market_cap,
      p.volume_24h,
      p.change_1h,
      p.change_24h,
      p.collected_at
    FROM prices p
    JOIN cryptos c ON c.id = p.crypto_id
    WHERE LOWER(c.symbol) = LOWER($1)
    ORDER BY p.collected_at DESC
    LIMIT $2;
  `;
  const { rows } = await db.query(query, [symbol, limit]);
  return rows;
};

const getPriceHistoryForChart = async (symbol, days = 30) => {
  const query = `
    SELECT
      TO_CHAR(DATE(p.collected_at), 'YYYY-MM-DD') as time,
      (array_agg(p.price ORDER BY p.collected_at ASC))[1] as open,
      MAX(p.price) as high,
      MIN(p.price) as low,
      (array_agg(p.price ORDER BY p.collected_at DESC))[1] as close,
      AVG(p.volume_24h) as volume,
      AVG(p.price) as price
    FROM prices p
    JOIN cryptos c ON c.id = p.crypto_id
    WHERE LOWER(c.symbol) = LOWER($1)
    GROUP BY DATE(p.collected_at)
    ORDER BY DATE(p.collected_at) DESC
    LIMIT $2;
  `;
  const { rows } = await db.query(query, [symbol, days]);
  return rows.reverse(); // Reverse to get oldest first
};

const getMarketStats = async () => {
  const query = `
    WITH latest_prices AS (
      SELECT DISTINCT ON (c.id)
        c.id,
        c.symbol,
        p.market_cap,
        p.volume_24h,
        p.change_24h,
        p.collected_at
      FROM cryptos c
      JOIN prices p ON p.crypto_id = c.id
      ORDER BY c.id, p.collected_at DESC
    ),
    previous_prices AS (
      SELECT DISTINCT ON (c.id)
        c.id,
        p.market_cap as prev_market_cap,
        p.volume_24h as prev_volume_24h
      FROM cryptos c
      JOIN prices p ON p.crypto_id = c.id
      WHERE p.collected_at < NOW() - INTERVAL '24 hours'
      ORDER BY c.id, p.collected_at DESC
    )
    SELECT
      COALESCE(SUM(lp.market_cap), 0) as total_market_cap,
      COALESCE(
        (SUM(lp.market_cap) - SUM(pp.prev_market_cap)) / NULLIF(SUM(pp.prev_market_cap), 0) * 100,
        0
      ) as total_market_cap_change_24h,
      COALESCE(SUM(lp.volume_24h), 0) as total_volume_24h,
      COALESCE(
        (SUM(lp.volume_24h) - SUM(pp.prev_volume_24h)) / NULLIF(SUM(pp.prev_volume_24h), 0) * 100,
        0
      ) as total_volume_24h_change,
      COALESCE(
        (COUNT(*) FILTER (WHERE lp.change_24h > 0)::FLOAT / NULLIF(COUNT(*), 0) * 100),
        0
      ) as market_sentiment,
      COALESCE(AVG(lp.change_24h), 0) as avg_change_24h
    FROM latest_prices lp
    LEFT JOIN previous_prices pp ON pp.id = lp.id;
  `;
  const { rows } = await db.query(query);
  return rows[0];
};

module.exports = { getLatestPrices, getPricesBySymbol, getMarketStats, getPriceHistoryForChart };

const axios = require("axios");
const db = require("./db");

const COINS = ["bitcoin", "ethereum", "solana"];
const VS_CURRENCY = "usd";

const CRYPTO_IDS = {
  bitcoin: 1,
  ethereum: 2,
  solana: 3,
};

// Sauvegarde une ligne dans prices
async function saveMarketData(coin) {
  const cryptoId = CRYPTO_IDS[coin.id];

  if (!cryptoId) {
    console.warn(` Crypto inconnue côté mapping : ${coin.id}, données non enregistrées.`);
    return;
  }

  const query = `
    INSERT INTO prices
      (crypto_id, price, market_cap, volume_24h, change_1h, change_24h, collected_at)
    VALUES
      ($1, $2, $3, $4, $5, $6, NOW());
  `;

  const values = [
    cryptoId,
    coin.current_price,
    coin.market_cap,
    coin.total_volume,
    coin.price_change_percentage_1h_in_currency,
    coin.price_change_percentage_24h,
  ];

  try {
    await db.query(query, values);
    console.log(` Données enregistrées dans prices pour ${coin.id}`);
  } catch (err) {
    console.error(` Erreur DB pour ${coin.id} :`, err.message);
  }
}

// Récupère et sauvegarde les données de marché
async function fetchMarketData() {
  const url = "https://api.coingecko.com/api/v3/coins/markets";

  try {
    const response = await axios.get(url, {
      params: {
        vs_currency: VS_CURRENCY,
        ids: COINS.join(","),
        order: "market_cap_desc",
        per_page: 100,
        page: 1,
        sparkline: false,
        price_change_percentage: "1h,24h",
      },
    });

    console.log("\n=== Données de marché ===");

    for (const coin of response.data) {
      console.log(`\n🔹 ${coin.id.toUpperCase()}`);
      console.log(`Prix            : ${coin.current_price} ${VS_CURRENCY}`);
      console.log(`Market Cap      : ${coin.market_cap}`);
      console.log(`Volume (24h)    : ${coin.total_volume}`);
      console.log(`Variation 1h    : ${coin.price_change_percentage_1h_in_currency}%`);
      console.log(`Variation 24h   : ${coin.price_change_percentage_24h}%`);

      await saveMarketData(coin);
    }
  } catch (err) {
    console.error("Erreur lors de la récupération des données du marché :", err.message);
  }
}

module.exports = {
  fetchMarketData,
};

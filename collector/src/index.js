const axios = require("axios");
const db = require("./db");  // <-- IMPORT DE LA DB

const COINS = ["bitcoin", "ethereum", "solana"];
const VS_CURRENCY = "usd";

// === US1 : Récupération des prix simples ===
async function fetchPrices() {
  const url = "https://api.coingecko.com/api/v3/simple/price";

  try {
    const response = await axios.get(url, {
      params: {
        ids: COINS.join(","),
        vs_currencies: VS_CURRENCY,
      },
    });

    console.log("=== Prix actuels ===");
    for (const coin of COINS) {
      const price = response.data[coin][VS_CURRENCY];
      console.log(`${coin} : ${price} ${VS_CURRENCY}`);
    }
  } catch (err) {
    console.error("Erreur:", err.message);
  }
}

// === US3 : Sauvegarde en base ===
async function saveMarketData(coin) {
  const query = `
    INSERT INTO market_data
      (coin_id, symbol, price, market_cap, volume_24h, change_1h, change_24h, collected_at)
    VALUES
      ($1, $2, $3, $4, $5, $6, $7, NOW());
  `;

  const values = [
    coin.id,
    coin.symbol,
    coin.current_price,
    coin.market_cap,
    coin.total_volume,
    coin.price_change_percentage_1h_in_currency,
    coin.price_change_percentage_24h,
  ];

  try {
    await db.query(query, values);
    console.log(`✔ Données enregistrées pour ${coin.id}`);
  } catch (err) {
    console.error(`❌ Erreur DB pour ${coin.id} :`, err.message);
  }
}

// === US2 : Récupération du volume, market cap et variations ===
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

      await saveMarketData(coin); //  Sauvegarde en DB
    }
  } catch (err) {
    console.error(
      "Erreur lors de la récupération des données du marché :",
      err.message
    );
  }
}


// fetchPrices();
fetchMarketData();

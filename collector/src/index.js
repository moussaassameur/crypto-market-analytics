const axios = require("axios");

const COINS = ["bitcoin", "ethereum", "solana"];
const VS_CURRENCY = "usd";

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

fetchPrices();

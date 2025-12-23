const db = require("../db/pool");

const getAllCryptos = async () => {
  const query = `
    SELECT id, symbol, name
    FROM cryptos
    ORDER BY name ASC;
  `;
  const { rows } = await db.query(query);
  return rows;
};

module.exports = {
  getAllCryptos,
};

const db = require("../db/pool");

// Créer la table si elle n'existe pas (appelé au démarrage)
const initTable = async () => {
  await db.query(`
    CREATE TABLE IF NOT EXISTS portfolio_transactions (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      type VARCHAR(10) NOT NULL CHECK (type IN ('BUY', 'SELL')),
      symbol VARCHAR(20) NOT NULL,
      quantity NUMERIC(20, 8) NOT NULL,
      unit_price NUMERIC(20, 2) NOT NULL,
      total NUMERIC(20, 2) NOT NULL,
      date DATE NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);
};

// Créer une transaction
const createTransaction = async (userId, { type, symbol, quantity, unit_price, date }) => {
  const total = quantity * unit_price;
  const r = await db.query(
    `INSERT INTO portfolio_transactions (user_id, type, symbol, quantity, unit_price, total, date)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [userId, type.toUpperCase(), symbol.toUpperCase(), quantity, unit_price, total, date]
  );
  return r.rows[0];
};

// Récupérer toutes les transactions d'un utilisateur
const getTransactionsByUser = async (userId) => {
  const r = await db.query(
    `SELECT * FROM portfolio_transactions 
     WHERE user_id = $1 
     ORDER BY date DESC, created_at DESC`,
    [userId]
  );
  return r.rows;
};

// Récupérer une transaction par ID
const getTransactionById = async (id) => {
  const r = await db.query(
    `SELECT * FROM portfolio_transactions WHERE id = $1`,
    [id]
  );
  return r.rows[0] || null;
};

// Supprimer une transaction
const deleteTransaction = async (id) => {
  const r = await db.query(
    `DELETE FROM portfolio_transactions WHERE id = $1 RETURNING *`,
    [id]
  );
  return r.rows[0] || null;
};

// Récupérer les stats du portefeuille
const getPortfolioStats = async (userId) => {
  // Récupérer toutes les transactions
  const transactions = await getTransactionsByUser(userId);
  
  if (transactions.length === 0) {
    return {
      totalValue: 0,
      gainLoss: 0,
      roiPercent: 0,
      bestCrypto: null,
      diversification: 0
    };
  }

  // Calculer les holdings par crypto
  const holdings = {};
  let totalInvested = 0;

  for (const tx of transactions) {
    const symbol = tx.symbol;
    if (!holdings[symbol]) {
      holdings[symbol] = { quantity: 0, invested: 0 };
    }

    if (tx.type === 'BUY') {
      holdings[symbol].quantity += parseFloat(tx.quantity);
      holdings[symbol].invested += parseFloat(tx.total);
      totalInvested += parseFloat(tx.total);
    } else {
      holdings[symbol].quantity -= parseFloat(tx.quantity);
      holdings[symbol].invested -= parseFloat(tx.total);
      totalInvested -= parseFloat(tx.total);
    }
  }

  // Récupérer les prix actuels depuis la table prices
  let totalValue = 0;
  let bestCrypto = null;
  let bestGain = -Infinity;

  for (const [symbol, data] of Object.entries(holdings)) {
    if (data.quantity <= 0) continue;

    // Chercher le dernier prix (jointure avec cryptos pour le symbol)
    const priceResult = await db.query(
      `SELECT p.price FROM prices p
       JOIN cryptos c ON c.id = p.crypto_id
       WHERE UPPER(c.symbol) = $1 
       ORDER BY p.collected_at DESC 
       LIMIT 1`,
      [symbol.toUpperCase()]
    );

    let currentPrice = priceResult.rows[0]?.price;
    
    // Si pas de prix, utiliser le dernier prix d'achat
    if (!currentPrice) {
      const lastBuy = transactions.find(t => t.symbol === symbol && t.type === 'BUY');
      currentPrice = lastBuy ? parseFloat(lastBuy.unit_price) : 0;
    }

    const value = data.quantity * parseFloat(currentPrice);
    totalValue += value;

    const gain = value - data.invested;
    if (gain > bestGain && data.quantity > 0) {
      bestGain = gain;
      bestCrypto = symbol;
    }
  }

  const gainLoss = totalValue - totalInvested;
  const roiPercent = totalInvested > 0 ? (gainLoss / totalInvested) * 100 : 0;
  const diversification = Object.values(holdings).filter(h => h.quantity > 0).length;

  return {
    totalValue: Math.round(totalValue * 100) / 100,
    gainLoss: Math.round(gainLoss * 100) / 100,
    roiPercent: Math.round(roiPercent * 100) / 100,
    bestCrypto,
    diversification
  };
};

module.exports = {
  initTable,
  createTransaction,
  getTransactionsByUser,
  getTransactionById,
  deleteTransaction,
  getPortfolioStats
};

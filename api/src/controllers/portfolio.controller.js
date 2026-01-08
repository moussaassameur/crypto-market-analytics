const portfolioRepo = require("../repositories/portfolio.repository");

const formatTransactionForFrontend = (tx) => {
  return {
    id: tx.id.toString(),
    type: tx.type === 'BUY' ? 'achat' : 'vente',
    crypto: tx.symbol,
    amount: parseFloat(tx.quantity),
    price: parseFloat(tx.unit_price),
    total: parseFloat(tx.total),
    date: tx.date instanceof Date 
      ? tx.date.toISOString().split('T')[0] 
      : tx.date.split('T')[0]
  };
};

const parseTransactionFromFrontend = (body) => {
  return {
    type: body.type === 'achat' ? 'BUY' : body.type === 'vente' ? 'SELL' : body.type?.toUpperCase(),
    symbol: (body.crypto || body.symbol)?.toUpperCase(),
    quantity: body.amount || body.quantity,
    unit_price: body.price || body.unit_price,
    date: body.date
  };
};

// POST /api/portfolio/transaction
const addTransaction = async (req, res) => {
  try {
    const parsed = parseTransactionFromFrontend(req.body);
    const { type, symbol, quantity, unit_price, date } = parsed;

    // Validation basique
    if (!type || !symbol || !quantity || !unit_price || !date) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Champs requis: type/crypto/amount/price/date"
      });
    }

    if (!['BUY', 'SELL'].includes(type)) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Type doit être 'achat', 'vente', 'BUY' ou 'SELL'"
      });
    }

    if (quantity <= 0 || unit_price <= 0) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Quantité et prix doivent être positifs"
      });
    }

    const userId = req.user.sub || req.user.id;
    const transaction = await portfolioRepo.createTransaction(userId, {
      type,
      symbol,
      quantity,
      unit_price,
      date
    });

    // Retourner au format frontend
    res.status(201).json(formatTransactionForFrontend(transaction));
  } catch (error) {
    console.error("Erreur addTransaction:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Erreur lors de l'ajout de la transaction"
    });
  }
};

// GET /api/portfolio/transactions
const getTransactions = async (req, res) => {
  try {
    const userId = req.user.sub || req.user.id;
    const transactions = await portfolioRepo.getTransactionsByUser(userId);
    
    // Convertir au format frontend
    const formatted = transactions.map(formatTransactionForFrontend);
    res.json(formatted);
  } catch (error) {
    console.error("Erreur getTransactions:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Erreur lors de la récupération des transactions"
    });
  }
};

// DELETE /api/portfolio/transaction/:id
const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier que la transaction existe et appartient à l'utilisateur
    const transaction = await portfolioRepo.getTransactionById(id);

    if (!transaction) {
      return res.status(404).json({
        error: "Not Found",
        message: "Transaction non trouvée"
      });
    }

    const userId = req.user.sub || req.user.id;
    if (transaction.user_id !== userId) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Cette transaction ne vous appartient pas"
      });
    }

    await portfolioRepo.deleteTransaction(id);
    res.json({ message: "Transaction supprimée", id: id.toString() });
  } catch (error) {
    console.error("Erreur deleteTransaction:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Erreur lors de la suppression"
    });
  }
};

// GET /api/portfolio/stats
const getStats = async (req, res) => {
  try {
    const userId = req.user.sub || req.user.id;
    const stats = await portfolioRepo.getPortfolioStats(userId);
    res.json(stats);
  } catch (error) {
    console.error("Erreur getStats:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Erreur lors du calcul des stats"
    });
  }
};

module.exports = {
  addTransaction,
  getTransactions,
  deleteTransaction,
  getStats
};

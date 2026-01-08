const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/verifyToken");
const portfolioController = require("../controllers/portfolio.controller");

// Toutes les routes sont protégées par JWT
router.use(verifyToken);

// POST /api/portfolio/transaction - Ajouter une transaction
router.post("/portfolio/transaction", portfolioController.addTransaction);

// GET /api/portfolio/transactions - Liste des transactions
router.get("/portfolio/transactions", portfolioController.getTransactions);

// DELETE /api/portfolio/transaction/:id - Supprimer une transaction
router.delete("/portfolio/transaction/:id", portfolioController.deleteTransaction);

// GET /api/portfolio/stats - Statistiques du portefeuille
router.get("/portfolio/stats", portfolioController.getStats);

module.exports = router;

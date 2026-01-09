const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/verifyToken");
const alertController = require("../controllers/alert.controller");

// POST /api/alerts/check - Vérifier et déclencher les alertes (protégé)
// Doit être avant les routes avec :id pour éviter conflit
router.post("/alerts/check", verifyToken, alertController.checkAlerts);

// Toutes les autres routes sont protégées par JWT
router.use(verifyToken);

// POST /api/alerts - Créer une nouvelle alerte
router.post("/alerts", alertController.createAlert);

// GET /api/alerts - Récupérer toutes les alertes de l'utilisateur
router.get("/alerts", alertController.getAlerts);

// GET /api/alerts/:id - Récupérer une alerte par ID
router.get("/alerts/:id", alertController.getAlert);

// PUT /api/alerts/:id - Modifier une alerte
router.put("/alerts/:id", alertController.updateAlert);

// PATCH /api/alerts/:id/toggle - Activer/désactiver une alerte
router.patch("/alerts/:id/toggle", alertController.toggleAlert);

// PATCH /api/alerts/:id/reset - Réinitialiser le statut triggered
router.patch("/alerts/:id/reset", alertController.resetAlert);

// DELETE /api/alerts/:id - Supprimer une alerte
router.delete("/alerts/:id", alertController.deleteAlert);

module.exports = router;

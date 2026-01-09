const alertRepository = require("../repositories/alert.repository");

// POST /api/alerts - Créer une nouvelle alerte
const createAlert = async (req, res, next) => {
  try {
    const userId = req.user.sub;
    const { crypto, condition, threshold } = req.body;

    // Validation
    if (!crypto || !condition || threshold === undefined) {
      return res.status(400).json({ 
        message: "Les champs crypto, condition et threshold sont requis" 
      });
    }

    if (!['>', '<'].includes(condition)) {
      return res.status(400).json({ 
        message: "La condition doit être '>' ou '<'" 
      });
    }

    if (typeof threshold !== 'number' || threshold <= 0) {
      return res.status(400).json({ 
        message: "Le threshold doit être un nombre positif" 
      });
    }

    const alert = await alertRepository.create(userId, crypto, condition, threshold);

    res.status(201).json({
      message: "Alerte créée avec succès",
      alert: formatAlert(alert),
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/alerts - Récupérer toutes les alertes de l'utilisateur
const getAlerts = async (req, res, next) => {
  try {
    const userId = req.user.sub;
    const alerts = await alertRepository.findByUserId(userId);

    res.json(alerts.map(formatAlert));
  } catch (err) {
    next(err);
  }
};

// GET /api/alerts/:id - Récupérer une alerte par ID
const getAlert = async (req, res, next) => {
  try {
    const userId = req.user.sub;
    const alertId = parseInt(req.params.id);

    const alert = await alertRepository.findById(alertId);

    if (!alert) {
      return res.status(404).json({ message: "Alerte non trouvée" });
    }

    if (alert.user_id !== userId) {
      return res.status(403).json({ message: "Accès non autorisé" });
    }

    res.json(formatAlert(alert));
  } catch (err) {
    next(err);
  }
};

// PUT /api/alerts/:id - Modifier une alerte
const updateAlert = async (req, res, next) => {
  try {
    const userId = req.user.sub;
    const alertId = parseInt(req.params.id);
    const { crypto, condition, threshold, active } = req.body;

    // Vérifier que l'alerte existe et appartient à l'utilisateur
    const existingAlert = await alertRepository.findById(alertId);

    if (!existingAlert) {
      return res.status(404).json({ message: "Alerte non trouvée" });
    }

    if (existingAlert.user_id !== userId) {
      return res.status(403).json({ message: "Accès non autorisé" });
    }

    // Validation
    if (condition && !['>', '<'].includes(condition)) {
      return res.status(400).json({ 
        message: "La condition doit être '>' ou '<'" 
      });
    }

    if (threshold !== undefined && (typeof threshold !== 'number' || threshold <= 0)) {
      return res.status(400).json({ 
        message: "Le threshold doit être un nombre positif" 
      });
    }

    const updatedAlert = await alertRepository.update(
      alertId,
      crypto || existingAlert.crypto_symbol,
      condition || existingAlert.condition,
      threshold !== undefined ? threshold : existingAlert.threshold,
      active !== undefined ? active : existingAlert.active
    );

    res.json({
      message: "Alerte modifiée avec succès",
      alert: formatAlert(updatedAlert),
    });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/alerts/:id/toggle - Activer/désactiver une alerte
const toggleAlert = async (req, res, next) => {
  try {
    const userId = req.user.sub;
    const alertId = parseInt(req.params.id);

    const existingAlert = await alertRepository.findById(alertId);

    if (!existingAlert) {
      return res.status(404).json({ message: "Alerte non trouvée" });
    }

    if (existingAlert.user_id !== userId) {
      return res.status(403).json({ message: "Accès non autorisé" });
    }

    const updatedAlert = await alertRepository.toggleActive(alertId, !existingAlert.active);

    res.json({
      message: `Alerte ${updatedAlert.active ? 'activée' : 'désactivée'}`,
      alert: formatAlert(updatedAlert),
    });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/alerts/:id - Supprimer une alerte
const deleteAlert = async (req, res, next) => {
  try {
    const userId = req.user.sub;
    const alertId = parseInt(req.params.id);

    const existingAlert = await alertRepository.findById(alertId);

    if (!existingAlert) {
      return res.status(404).json({ message: "Alerte non trouvée" });
    }

    if (existingAlert.user_id !== userId) {
      return res.status(403).json({ message: "Accès non autorisé" });
    }

    await alertRepository.remove(alertId);

    res.json({ message: "Alerte supprimée avec succès" });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/alerts/:id/reset - Réinitialiser le statut triggered
const resetAlert = async (req, res, next) => {
  try {
    const userId = req.user.sub;
    const alertId = parseInt(req.params.id);

    const existingAlert = await alertRepository.findById(alertId);

    if (!existingAlert) {
      return res.status(404).json({ message: "Alerte non trouvée" });
    }

    if (existingAlert.user_id !== userId) {
      return res.status(403).json({ message: "Accès non autorisé" });
    }

    const updatedAlert = await alertRepository.resetTriggered(alertId);

    res.json({
      message: "Alerte réinitialisée",
      alert: formatAlert(updatedAlert),
    });
  } catch (err) {
    next(err);
  }
};

// Formater une alerte pour la réponse API
const formatAlert = (alert) => ({
  id: alert.id.toString(),
  crypto: alert.crypto_symbol,
  condition: alert.condition,
  threshold: parseFloat(alert.threshold),
  active: alert.active,
  triggered: alert.triggered,
  triggeredAt: alert.triggered_at,
  createdAt: alert.created_at ? new Date(alert.created_at).toISOString().split('T')[0] : null,
});

module.exports = {
  createAlert,
  getAlerts,
  getAlert,
  updateAlert,
  toggleAlert,
  deleteAlert,
  resetAlert,
};

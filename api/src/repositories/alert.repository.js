const db = require("../db/pool");

// Créer une nouvelle alerte
const create = async (userId, cryptoSymbol, condition, threshold) => {
  const r = await db.query(
    `INSERT INTO alerts (user_id, crypto_symbol, condition, threshold) 
     VALUES ($1, $2, $3, $4) 
     RETURNING id, user_id, crypto_symbol, condition, threshold, active, triggered, created_at`,
    [userId, cryptoSymbol.toUpperCase(), condition, threshold]
  );
  return r.rows[0];
};

// Récupérer toutes les alertes d'un utilisateur
const findByUserId = async (userId) => {
  const r = await db.query(
    `SELECT id, crypto_symbol, condition, threshold, active, triggered, triggered_at, created_at 
     FROM alerts 
     WHERE user_id = $1 
     ORDER BY created_at DESC`,
    [userId]
  );
  return r.rows;
};

// Récupérer une alerte par ID
const findById = async (id) => {
  const r = await db.query(
    `SELECT id, user_id, crypto_symbol, condition, threshold, active, triggered, triggered_at, created_at 
     FROM alerts 
     WHERE id = $1`,
    [id]
  );
  return r.rows[0] || null;
};

// Mettre à jour une alerte
const update = async (id, cryptoSymbol, condition, threshold, active) => {
  const r = await db.query(
    `UPDATE alerts 
     SET crypto_symbol = $2, condition = $3, threshold = $4, active = $5, updated_at = NOW()
     WHERE id = $1
     RETURNING id, crypto_symbol, condition, threshold, active, triggered, created_at`,
    [id, cryptoSymbol.toUpperCase(), condition, threshold, active]
  );
  return r.rows[0] || null;
};

// Activer/désactiver une alerte
const toggleActive = async (id, active) => {
  const r = await db.query(
    `UPDATE alerts 
     SET active = $2, updated_at = NOW()
     WHERE id = $1
     RETURNING id, crypto_symbol, condition, threshold, active, triggered`,
    [id, active]
  );
  return r.rows[0] || null;
};

// Supprimer une alerte
const remove = async (id) => {
  const r = await db.query(
    `DELETE FROM alerts WHERE id = $1 RETURNING id`,
    [id]
  );
  return r.rowCount > 0;
};

// Récupérer toutes les alertes actives pour une crypto donnée
// Utilisé par le collector pour vérifier les déclenchements
const findActiveBySymbol = async (cryptoSymbol) => {
  const r = await db.query(
    `SELECT a.id, a.user_id, a.crypto_symbol, a.condition, a.threshold, 
            u.email, u.name
     FROM alerts a
     JOIN users u ON a.user_id = u.id
     WHERE a.crypto_symbol = $1 AND a.active = TRUE`,
    [cryptoSymbol.toUpperCase()]
  );
  return r.rows;
};

// Marquer une alerte comme déclenchée
const markTriggered = async (id) => {
  const r = await db.query(
    `UPDATE alerts 
     SET triggered = TRUE, triggered_at = NOW(), updated_at = NOW()
     WHERE id = $1
     RETURNING id, triggered, triggered_at`,
    [id]
  );
  return r.rows[0] || null;
};

// Réinitialiser le statut triggered (pour permettre un nouveau déclenchement)
const resetTriggered = async (id) => {
  const r = await db.query(
    `UPDATE alerts 
     SET triggered = FALSE, triggered_at = NULL, updated_at = NOW()
     WHERE id = $1
     RETURNING id, triggered`,
    [id]
  );
  return r.rows[0] || null;
};

module.exports = {
  create,
  findByUserId,
  findById,
  update,
  toggleActive,
  remove,
  findActiveBySymbol,
  markTriggered,
  resetTriggered,
};

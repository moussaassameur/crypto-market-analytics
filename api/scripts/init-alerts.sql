-- Script de création de la table alerts
-- À exécuter dans PostgreSQL Docker

CREATE TABLE IF NOT EXISTS alerts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    crypto_symbol VARCHAR(20) NOT NULL,
    condition VARCHAR(2) NOT NULL CHECK (condition IN ('>', '<')),
    threshold NUMERIC(20, 2) NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    triggered BOOLEAN DEFAULT FALSE,
    triggered_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_alerts_user_id ON alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_alerts_crypto_symbol ON alerts(crypto_symbol);
CREATE INDEX IF NOT EXISTS idx_alerts_active ON alerts(active);

-- Index composé pour la recherche d'alertes actives par crypto
CREATE INDEX IF NOT EXISTS idx_alerts_active_crypto ON alerts(crypto_symbol, active) WHERE active = TRUE;

COMMENT ON TABLE alerts IS 'Table des alertes de prix configurées par les utilisateurs';
COMMENT ON COLUMN alerts.condition IS 'Condition de déclenchement: > (supérieur) ou < (inférieur)';
COMMENT ON COLUMN alerts.threshold IS 'Prix seuil en USD';
COMMENT ON COLUMN alerts.triggered IS 'Indique si l''alerte a déjà été déclenchée';
COMMENT ON COLUMN alerts.triggered_at IS 'Date/heure du dernier déclenchement';

-- Script de création de la table portfolio_transactions
-- À exécuter dans PostgreSQL Docker

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
);

-- Index pour optimiser les requêtes par utilisateur
CREATE INDEX IF NOT EXISTS idx_portfolio_user_id ON portfolio_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_symbol ON portfolio_transactions(symbol);

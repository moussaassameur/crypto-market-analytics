-- Script de création complète de la base de données
-- À exécuter dans PostgreSQL pour les tests CI/CD

-- Création de la table users (référencée par les autres tables)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Index pour optimiser les requêtes par email
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Création de la table alerts
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

-- Index pour optimiser les requêtes alerts
CREATE INDEX IF NOT EXISTS idx_alerts_user_id ON alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_alerts_crypto_symbol ON alerts(crypto_symbol);
CREATE INDEX IF NOT EXISTS idx_alerts_active ON alerts(active);
CREATE INDEX IF NOT EXISTS idx_alerts_active_crypto ON alerts(crypto_symbol, active) WHERE active = TRUE;

-- Création de la table portfolio_transactions
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

-- Index pour optimiser les requêtes portfolio
CREATE INDEX IF NOT EXISTS idx_portfolio_user_id ON portfolio_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_symbol ON portfolio_transactions(symbol);

-- Commentaires pour la documentation
COMMENT ON TABLE users IS 'Table des utilisateurs de la plateforme';
COMMENT ON TABLE alerts IS 'Table des alertes de prix configurées par les utilisateurs';
COMMENT ON TABLE portfolio_transactions IS 'Table des transactions de portefeuille des utilisateurs';

-- Messages de confirmation
SELECT 'Database tables created successfully!' as status;
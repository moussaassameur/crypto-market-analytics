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

-- Création de la table cryptos (pour les symboles de cryptomonnaies)
CREATE TABLE IF NOT EXISTS cryptos (
    id SERIAL PRIMARY KEY,
    symbol VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Index pour optimiser les requêtes par symbol
CREATE INDEX IF NOT EXISTS idx_cryptos_symbol ON cryptos(symbol);

-- Création de la table prices (prix historiques des cryptomonnaies)
CREATE TABLE IF NOT EXISTS prices (
    id SERIAL PRIMARY KEY,
    crypto_id INTEGER NOT NULL REFERENCES cryptos(id) ON DELETE CASCADE,
    price NUMERIC(20, 8) NOT NULL,
    collected_at TIMESTAMP DEFAULT NOW()
);

-- Index pour optimiser les requêtes prices
CREATE INDEX IF NOT EXISTS idx_prices_crypto_id ON prices(crypto_id);
CREATE INDEX IF NOT EXISTS idx_prices_collected_at ON prices(collected_at);
CREATE INDEX IF NOT EXISTS idx_prices_crypto_collected ON prices(crypto_id, collected_at DESC);

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

-- Insertion de quelques cryptos de test pour les tests
INSERT INTO cryptos (symbol, name) VALUES 
('BTC', 'Bitcoin'),
('ETH', 'Ethereum'),
('ADA', 'Cardano'),
('DOT', 'Polkadot'),
('SOL', 'Solana')
ON CONFLICT (symbol) DO NOTHING;

-- Insertion de prix de test (optionnel pour les tests)
INSERT INTO prices (crypto_id, price, collected_at) 
SELECT c.id, 50000.00, NOW() - INTERVAL '1 hour' FROM cryptos c WHERE c.symbol = 'BTC'
UNION ALL
SELECT c.id, 3000.00, NOW() - INTERVAL '1 hour' FROM cryptos c WHERE c.symbol = 'ETH'
UNION ALL  
SELECT c.id, 1.50, NOW() - INTERVAL '1 hour' FROM cryptos c WHERE c.symbol = 'ADA'
ON CONFLICT DO NOTHING;

-- Commentaires pour la documentation
COMMENT ON TABLE users IS 'Table des utilisateurs de la plateforme';
COMMENT ON TABLE cryptos IS 'Table des cryptomonnaies disponibles';
COMMENT ON TABLE prices IS 'Table des prix historiques des cryptomonnaies';
COMMENT ON TABLE alerts IS 'Table des alertes de prix configurées par les utilisateurs';
COMMENT ON TABLE portfolio_transactions IS 'Table des transactions de portefeuille des utilisateurs';

-- Messages de confirmation
SELECT 'Database tables created successfully!' as status;
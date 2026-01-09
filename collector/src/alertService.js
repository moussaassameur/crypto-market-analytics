const db = require("./db");
const emailService = require("./emailService");
const logger = require("./logger");

// Mapping entre les symboles et les IDs CoinGecko
const SYMBOL_MAP = {
  bitcoin: "BTC",
  ethereum: "ETH",
  solana: "SOL",
};

// Mapping inverse (symbole -> nom complet)
const CRYPTO_NAMES = {
  BTC: "Bitcoin",
  ETH: "Ethereum",
  SOL: "Solana",
};

/**
 * Récupère toutes les alertes actives pour un symbole donné
 */
const getActiveAlertsBySymbol = async (symbol) => {
  const query = `
    SELECT a.id, a.user_id, a.crypto_symbol, a.condition, a.threshold, a.triggered,
           u.email, u.name
    FROM alerts a
    JOIN users u ON a.user_id = u.id
    WHERE a.crypto_symbol = $1 AND a.active = TRUE
  `;

  try {
    const result = await db.query(query, [symbol.toUpperCase()]);
    return result.rows;
  } catch (err) {
    logger.error(`Erreur lors de la récupération des alertes pour ${symbol} : ${err.message}`);
    return [];
  }
};

/**
 * Marque une alerte comme déclenchée
 */
const markAlertTriggered = async (alertId) => {
  const query = `
    UPDATE alerts 
    SET triggered = TRUE, triggered_at = NOW(), updated_at = NOW()
    WHERE id = $1
  `;

  try {
    await db.query(query, [alertId]);
    logger.info(`Alerte ${alertId} marquée comme déclenchée`);
  } catch (err) {
    logger.error(`Erreur lors de la mise à jour de l'alerte ${alertId} : ${err.message}`);
  }
};

/**
 * Vérifie si une condition d'alerte est remplie
 */
const checkAlertCondition = (alert, currentPrice) => {
  const threshold = parseFloat(alert.threshold);

  if (alert.condition === ">") {
    return currentPrice > threshold;
  } else if (alert.condition === "<") {
    return currentPrice < threshold;
  }

  return false;
};

/**
 * Vérifie et déclenche les alertes pour une crypto donnée
 * @param {string} coinId - ID CoinGecko (bitcoin, ethereum, etc.)
 * @param {number} currentPrice - Prix actuel en USD
 */
const checkAndTriggerAlerts = async (coinId, currentPrice) => {
  const symbol = SYMBOL_MAP[coinId.toLowerCase()];

  if (!symbol) {
    logger.warn(`Symbole non trouvé pour ${coinId}`);
    return { triggered: 0, errors: 0 };
  }

  console.log(`  → Recherche des alertes pour ${symbol}...`);
  const alerts = await getActiveAlertsBySymbol(symbol);
  console.log(`  → ${alerts.length} alerte(s) active(s) trouvée(s)`);

  if (alerts.length === 0) {
    return { triggered: 0, errors: 0 };
  }

  logger.info(`Vérification de ${alerts.length} alerte(s) pour ${symbol} (prix: $${currentPrice})`);

  let triggeredCount = 0;
  let errorCount = 0;

  for (const alert of alerts) {
    console.log(`    ✓ Alerte #${alert.id}: ${symbol} ${alert.condition} $${alert.threshold} (triggered: ${alert.triggered})`);
    
    // Vérifier si la condition est remplie
    const conditionMet = checkAlertCondition(alert, currentPrice);
    console.log(`      Condition remplie: ${conditionMet}`);
    
    if (!conditionMet) {
      continue;
    }

    // Si l'alerte a déjà été déclenchée, on ne renvoie pas d'email
    // (l'utilisateur doit la réinitialiser manuellement)
    if (alert.triggered) {
      logger.info(`Alerte ${alert.id} déjà déclenchée, skipping...`);
      continue;
    }

    logger.info(
      `🔔 Alerte ${alert.id} déclenchée : ${symbol} ${alert.condition} $${alert.threshold} (actuel: $${currentPrice})`
    );

    // Envoyer l'email
    console.log(`      📧 Envoi de l'email à ${alert.email}...`);
    const result = await emailService.sendPriceAlert(alert.email, {
      userName: alert.name,
      cryptoSymbol: symbol,
      cryptoName: CRYPTO_NAMES[symbol],
      condition: alert.condition,
      threshold: parseFloat(alert.threshold),
      currentPrice,
    });

    if (result.success) {
      console.log(`      ✅ Email envoyé avec succès!`);
      // Marquer l'alerte comme déclenchée
      await markAlertTriggered(alert.id);
      triggeredCount++;
    } else {
      console.error(`      ❌ Erreur envoi email: ${result.error}`);
      errorCount++;
    }
  }

  if (triggeredCount > 0) {
    logger.info(`✅ ${triggeredCount} alerte(s) déclenchée(s) pour ${symbol}`);
  }

  return { triggered: triggeredCount, errors: errorCount };
};

/**
 * Vérifie les alertes pour toutes les cryptos collectées
 * @param {Array} coins - Tableau des données de marché des cryptos
 */
const processAlerts = async (coins) => {
  console.log(`\n🔍 Traitement des alertes pour ${coins.length} cryptos...`);
  
  let totalTriggered = 0;
  let totalErrors = 0;

  for (const coin of coins) {
    console.log(`\n📊 ${coin.id.toUpperCase()} - Prix: $${coin.current_price}`);
    const { triggered, errors } = await checkAndTriggerAlerts(coin.id, coin.current_price);
    totalTriggered += triggered;
    totalErrors += errors;
  }

  if (totalTriggered > 0 || totalErrors > 0) {
    logger.info(`📊 Résumé alertes : ${totalTriggered} déclenchées, ${totalErrors} erreurs`);
  } else {
    console.log("ℹ️  Aucune alerte déclenchée");
  }

  return { triggered: totalTriggered, errors: totalErrors };
};

module.exports = {
  checkAndTriggerAlerts,
  processAlerts,
  getActiveAlertsBySymbol,
};

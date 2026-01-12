const forecastRepository = require("../repositories/forecast.repository");

// Fait la moyenne des prix 
function calculateSMA(prices, period) {
  if (prices.length < period) return null;
  const slice = prices.slice(-period);
  return slice.reduce((sum, p) => sum + p, 0) / period;
}

// Crée les prévisions futures avec le modèle SMA
function generateForecasts(historicalPrices, forecastDays, modelType) {
  const prices = historicalPrices.map(h => parseFloat(h.price));
  const lastPrice = prices[prices.length - 1];
  const forecasts = [];
  
  // Moyennes mobiles: 7j, 14j, 30j
  const sma7 = calculateSMA(prices, 7);
  const sma14 = calculateSMA(prices, 14);
  const sma30 = calculateSMA(prices, 30);
  
  // Boucle pour chaque jour à prévoir
  for (let i = 1; i <= forecastDays; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    
    // Le prix va vers la moyenne (SMA14 en priorité)
    const targetSMA = sma14 || sma7 || lastPrice;
    const drift = (targetSMA - lastPrice) / forecastDays;
    let predictedPrice = lastPrice + drift * i;
    let confidence = Math.max(40, 85 - i * 2);
    
    // Éviter les prédictions extrêmes (-50% max, +100% max)
    predictedPrice = Math.max(predictedPrice, lastPrice * 0.5);
    predictedPrice = Math.min(predictedPrice, lastPrice * 2);
    
    forecasts.push({
      date: date.toISOString().split('T')[0],
      price: Math.round(predictedPrice * 100) / 100,
      confidence: Math.round(confidence),
    });
  }
  
  return {
    forecasts,
    indicators: {
      sma7: sma7 ? Math.round(sma7 * 100) / 100 : null,
      sma14: sma14 ? Math.round(sma14 * 100) / 100 : null,
      sma30: sma30 ? Math.round(sma30 * 100) / 100 : null,
    },
  };
}

/**
 * GET /api/forecast/:symbol
 * Génère des prévisions de prix pour une crypto
 */
const getForecast = async (req, res, next) => {
  try {
    const { symbol } = req.params;
    const { days = 7 } = req.query;
    
    const forecastDays = Math.min(Math.max(parseInt(days) || 7, 1), 30);
    const modelType = 'sma';
    
    // Chercher l'historique des 90 derniers jours
    const historicalData = await forecastRepository.getPriceHistoryForForecast(symbol, 90);
    
    if (!historicalData || historicalData.length < 7) {
      return res.status(404).json({
        error: "Not Found",
        message: "Pas assez de données historiques pour générer une prévision",
        symbol,
        dataPoints: historicalData?.length || 0,
      });
    }
    
    // Prix actuel de la crypto
    const currentPriceData = await forecastRepository.getCurrentPrice(symbol);
    
    // Lancer le calcul des prévisions
    const { forecasts, indicators } = generateForecasts(historicalData, forecastDays, modelType);
    
    // Variation en pourcentage (actuel vs prévu)
    const lastPrice = currentPriceData?.price || parseFloat(historicalData[historicalData.length - 1].price);
    const forecastedPrice = forecasts[forecasts.length - 1].price;
    const predictedChange = ((forecastedPrice - lastPrice) / lastPrice) * 100;
    
    res.json({
      symbol: symbol.toUpperCase(),
      model: modelType,
      forecastDays,
      currentPrice: parseFloat(lastPrice),
      forecastedPrice,
      predictedChange: Math.round(predictedChange * 100) / 100,
      averageConfidence: Math.round(
        forecasts.reduce((sum, f) => sum + f.confidence, 0) / forecasts.length
      ),
      indicators,
      historical: historicalData.slice(-14).map(h => ({
        date: h.date,
        price: parseFloat(h.price),
      })),
      forecasts,
      generatedAt: new Date().toISOString(),
    });
  } catch (e) {
    next(e);
  }
};

/**
 * GET /api/forecast/:symbol/indicators
 * Retourne uniquement les indicateurs techniques
 */
const getIndicators = async (req, res, next) => {
  try {
    const { symbol } = req.params;
    
    const historicalData = await forecastRepository.getPriceHistoryForForecast(symbol, 90);
    
    if (!historicalData || historicalData.length < 7) {
      return res.status(404).json({
        error: "Not Found",
        message: "Pas assez de données historiques",
        symbol,
      });
    }
    
    const prices = historicalData.map(h => parseFloat(h.price));
    const lastPrice = prices[prices.length - 1];
    
    // Moyennes mobiles sur 7, 14, 30, 50 jours
    const sma7 = calculateSMA(prices, 7);
    const sma14 = calculateSMA(prices, 14);
    const sma30 = calculateSMA(prices, 30);
    const sma50 = calculateSMA(prices, 50);
    
    // Signal: acheter, vendre ou attendre?
    let signal = 'NEUTRAL';
    let signalStrength = 50;
    
    if (sma7 && sma14) {
      if (sma7 > sma14 && lastPrice > sma7) {
        signal = 'BUY';
        signalStrength = Math.min(80, 60 + (sma7 - sma14) / sma14 * 100);
      } else if (sma7 < sma14 && lastPrice < sma7) {
        signal = 'SELL';
        signalStrength = Math.min(80, 60 + (sma14 - sma7) / sma14 * 100);
      }
    }
    
    res.json({
      symbol: symbol.toUpperCase(),
      currentPrice: lastPrice,
      movingAverages: {
        sma7, sma14, sma30, sma50,
      },
      signal: {
        recommendation: signal,
        strength: Math.round(signalStrength),
      },
      dataPoints: historicalData.length,
    });
  } catch (e) {
    next(e);
  }
};

module.exports = {
  getForecast,
  getIndicators,
};

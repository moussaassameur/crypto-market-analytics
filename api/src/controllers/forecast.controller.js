const forecastRepository = require("../repositories/forecast.repository");

/**
 * Calcule la moyenne mobile simple (SMA)
 */
function calculateSMA(prices, period) {
  if (prices.length < period) return null;
  const slice = prices.slice(-period);
  return slice.reduce((sum, p) => sum + p, 0) / period;
}

/**
 * Calcule la moyenne mobile exponentielle (EMA)
 */
function calculateEMA(prices, period) {
  if (prices.length < period) return null;
  
  const multiplier = 2 / (period + 1);
  let ema = prices.slice(0, period).reduce((sum, p) => sum + p, 0) / period;
  
  for (let i = period; i < prices.length; i++) {
    ema = (prices[i] - ema) * multiplier + ema;
  }
  
  return ema;
}

/**
 * Régression linéaire simple
 * Retourne les coefficients a (pente) et b (ordonnée à l'origine)
 */
function linearRegression(data) {
  const n = data.length;
  if (n < 2) return { slope: 0, intercept: data[0] || 0, r2: 0 };
  
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;
  
  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += data[i];
    sumXY += i * data[i];
    sumX2 += i * i;
    sumY2 += data[i] * data[i];
  }
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  
  // Coefficient de détermination R²
  const yMean = sumY / n;
  let ssTotal = 0, ssResidual = 0;
  
  for (let i = 0; i < n; i++) {
    const predicted = slope * i + intercept;
    ssTotal += Math.pow(data[i] - yMean, 2);
    ssResidual += Math.pow(data[i] - predicted, 2);
  }
  
  const r2 = ssTotal > 0 ? 1 - (ssResidual / ssTotal) : 0;
  
  return { slope, intercept, r2 };
}

/**
 * Génère les prévisions avec différents modèles
 */
function generateForecasts(historicalPrices, forecastDays, modelType) {
  const prices = historicalPrices.map(h => parseFloat(h.price));
  const lastPrice = prices[prices.length - 1];
  const forecasts = [];
  
  // Calculer les indicateurs
  const sma7 = calculateSMA(prices, 7);
  const sma14 = calculateSMA(prices, 14);
  const sma30 = calculateSMA(prices, 30);
  const ema7 = calculateEMA(prices, 7);
  const ema14 = calculateEMA(prices, 14);
  
  // Régression linéaire sur les 30 derniers jours
  const recentPrices = prices.slice(-30);
  const { slope, intercept, r2 } = linearRegression(recentPrices);
  
  // Volatilité (écart-type des variations quotidiennes)
  const returns = [];
  for (let i = 1; i < prices.length; i++) {
    returns.push((prices[i] - prices[i-1]) / prices[i-1]);
  }
  const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
  const volatility = Math.sqrt(
    returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length
  );
  
  // Génération des prévisions selon le modèle
  for (let i = 1; i <= forecastDays; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    
    let predictedPrice;
    let confidence;
    
    switch (modelType) {
      case 'linear':
        // Régression linéaire
        const x = recentPrices.length - 1 + i;
        predictedPrice = slope * x + intercept;
        // Confiance basée sur R² et distance de prédiction
        confidence = Math.max(30, Math.min(95, r2 * 100 - i * 2));
        break;
        
      case 'sma':
        // Moyenne mobile simple - tendance vers la moyenne
        const targetSMA = sma14 || sma7 || lastPrice;
        const drift = (targetSMA - lastPrice) / forecastDays;
        predictedPrice = lastPrice + drift * i;
        confidence = Math.max(40, 85 - i * 2);
        break;
        
      case 'ema':
        // Moyenne mobile exponentielle
        const targetEMA = ema7 || lastPrice;
        const emaDrift = (targetEMA - lastPrice) / forecastDays;
        // Ajouter une tendance basée sur la pente récente
        const trend = slope > 0 ? slope * 0.3 : slope * 0.3;
        predictedPrice = lastPrice + emaDrift * i + trend * i;
        confidence = Math.max(45, 88 - i * 1.8);
        break;
        
      case 'combined':
      default:
        // Modèle combiné (moyenne pondérée)
        const linearPred = slope * (recentPrices.length - 1 + i) + intercept;
        const smaPred = lastPrice + ((sma7 || lastPrice) - lastPrice) / forecastDays * i;
        const emaPred = lastPrice + ((ema7 || lastPrice) - lastPrice) / forecastDays * i + slope * 0.3 * i;
        
        // Pondération: 40% linéaire, 30% SMA, 30% EMA
        predictedPrice = linearPred * 0.4 + smaPred * 0.3 + emaPred * 0.3;
        confidence = Math.max(50, 90 - i * 1.5);
        break;
    }
    
    // S'assurer que le prix est positif et raisonnable
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
      ema7: ema7 ? Math.round(ema7 * 100) / 100 : null,
      ema14: ema14 ? Math.round(ema14 * 100) / 100 : null,
      linearSlope: Math.round(slope * 100) / 100,
      r2: Math.round(r2 * 1000) / 1000,
      volatility: Math.round(volatility * 10000) / 100, // en pourcentage
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
    const { days = 7, model = 'combined' } = req.query;
    
    const forecastDays = Math.min(Math.max(parseInt(days) || 7, 1), 30);
    const validModels = ['linear', 'sma', 'ema', 'combined'];
    const modelType = validModels.includes(model) ? model : 'combined';
    
    // Récupérer l'historique des prix (90 jours pour avoir assez de données)
    const historicalData = await forecastRepository.getPriceHistoryForForecast(symbol, 90);
    
    if (!historicalData || historicalData.length < 7) {
      return res.status(404).json({
        error: "Not Found",
        message: "Pas assez de données historiques pour générer une prévision",
        symbol,
        dataPoints: historicalData?.length || 0,
      });
    }
    
    // Récupérer le prix actuel
    const currentPriceData = await forecastRepository.getCurrentPrice(symbol);
    
    // Générer les prévisions
    const { forecasts, indicators } = generateForecasts(historicalData, forecastDays, modelType);
    
    // Calculer le changement prévu
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
    
    // Calculer tous les indicateurs
    const sma7 = calculateSMA(prices, 7);
    const sma14 = calculateSMA(prices, 14);
    const sma30 = calculateSMA(prices, 30);
    const sma50 = calculateSMA(prices, 50);
    const ema7 = calculateEMA(prices, 7);
    const ema14 = calculateEMA(prices, 14);
    const ema30 = calculateEMA(prices, 30);
    
    const { slope, r2 } = linearRegression(prices.slice(-30));
    
    // Signal de trading basé sur les indicateurs
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
        ema7, ema14, ema30,
      },
      trend: {
        direction: slope > 0 ? 'UP' : slope < 0 ? 'DOWN' : 'FLAT',
        slope: Math.round(slope * 100) / 100,
        r2: Math.round(r2 * 1000) / 1000,
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

import React, { useState } from 'react';
import { TrendingUp, Brain, AlertCircle, Calendar } from 'lucide-react';
import { cryptoList, generatePriceHistory } from '../../data/mockData';
import { ForecastChart } from './ForecastChart';
import { PredictionModel } from './PredictionModel';

export function ForecastPage() {
  const [selectedCrypto, setSelectedCrypto] = useState('bitcoin');
  const [forecastDays, setForecastDays] = useState<7 | 14 | 30>(7);
  const [modelType, setModelType] = useState<'linear' | 'ma' | 'momentum'>('linear');

  const crypto = cryptoList.find(c => c.id === selectedCrypto) || cryptoList[0];
  const historicalData = generatePriceHistory(crypto.price, 30);

  // Generate forecast based on selected model
  const generateForecast = () => {
    const forecast = [];
    const lastPrice = historicalData[historicalData.length - 1].price;
    
    for (let i = 1; i <= forecastDays; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      
      let predictedPrice;
      
      switch (modelType) {
        case 'linear':
          // Simple linear trend
          const trend = crypto.change24h / 100;
          predictedPrice = lastPrice * Math.pow(1 + trend, i);
          break;
          
        case 'ma':
          // Moving average based
          const avgChange = historicalData.slice(-7).reduce((sum, d, idx, arr) => {
            if (idx === 0) return 0;
            return sum + (d.price - arr[idx - 1].price);
          }, 0) / 6;
          predictedPrice = lastPrice + (avgChange * i);
          break;
          
        case 'momentum':
          // Momentum based with randomness
          const momentum = crypto.change24h / 100;
          const randomFactor = (Math.random() - 0.5) * 0.02;
          predictedPrice = lastPrice * Math.pow(1 + momentum + randomFactor, i);
          break;
          
        default:
          predictedPrice = lastPrice;
      }
      
      forecast.push({
        time: date.toISOString().split('T')[0],
        predicted: Math.max(predictedPrice, crypto.price * 0.5),
        confidence: Math.max(100 - (i * 3), 50), // Confidence decreases over time
      });
    }
    
    return forecast;
  };

  const forecastData = generateForecast();
  const lastHistoricalPrice = historicalData[historicalData.length - 1].price;
  const lastForecastPrice = forecastData[forecastData.length - 1].predicted;
  const forecastChange = ((lastForecastPrice - lastHistoricalPrice) / lastHistoricalPrice) * 100;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-white text-2xl mb-2">Prévisions de prix</h2>
        <p className="text-slate-400">Modèles prédictifs basés sur l'analyse historique</p>
      </div>

      {/* Warning Banner */}
      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 mb-6 flex items-start gap-3">
        <AlertCircle className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-0.5" />
        <div className="text-yellow-400">
          <p className="mb-1">Avertissement important</p>
          <p className="text-sm opacity-90">
            Ces prévisions sont basées sur des modèles simplifiés et ne constituent pas des conseils
            financiers. Les cryptomonnaies sont volatiles et les prix peuvent varier considérablement.
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-slate-300 mb-2">Cryptomonnaie</label>
            <select
              value={selectedCrypto}
              onChange={(e) => setSelectedCrypto(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {cryptoList.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.symbol})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-300 mb-2">Horizon de prévision</label>
            <div className="flex gap-2">
              {([7, 14, 30] as const).map((days) => (
                <button
                  key={days}
                  onClick={() => setForecastDays(days)}
                  className={`flex-1 px-4 py-3 rounded-lg transition-colors ${
                    forecastDays === days
                      ? 'bg-blue-500 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {days}j
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-slate-300 mb-2">Modèle</label>
            <select
              value={modelType}
              onChange={(e) => setModelType(e.target.value as any)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="linear">Tendance linéaire</option>
              <option value="ma">Moyenne mobile</option>
              <option value="momentum">Momentum</option>
            </select>
          </div>
        </div>
      </div>

      {/* Forecast Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400">Prix actuel</span>
            <Brain className="w-5 h-5 text-blue-400" />
          </div>
          <p className="text-white text-2xl">${lastHistoricalPrice.toFixed(0)}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400">Prévision {forecastDays}j</span>
            <Calendar className="w-5 h-5 text-purple-400" />
          </div>
          <p className="text-white text-2xl">${lastForecastPrice.toFixed(0)}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400">Variation prévue</span>
            {forecastChange >= 0 ? (
              <TrendingUp className="w-5 h-5 text-green-400" />
            ) : (
              <TrendingUp className="w-5 h-5 text-red-400 rotate-180" />
            )}
          </div>
          <p className={`text-2xl ${forecastChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {forecastChange >= 0 ? '+' : ''}{forecastChange.toFixed(2)}%
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400">Confiance</span>
            <AlertCircle className="w-5 h-5 text-yellow-400" />
          </div>
          <p className="text-white text-2xl">{forecastData[forecastData.length - 1].confidence}%</p>
        </div>
      </div>

      {/* Forecast Chart */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-6">
        <h3 className="text-white text-xl mb-4">Graphique: Réel vs Prédit</h3>
        <ForecastChart
          historicalData={historicalData}
          forecastData={forecastData}
        />
      </div>

      {/* Model Information */}
      <PredictionModel modelType={modelType} />
    </div>
  );
}

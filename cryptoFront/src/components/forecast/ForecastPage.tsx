import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Brain, AlertCircle, Calendar, Activity, RefreshCw, BarChart2 } from 'lucide-react';
import { forecastService, ForecastResponse, ModelType } from '../../services/forecastService';
import { ForecastChart } from './ForecastChart';

const CRYPTOS = [
  { id: 'btc', name: 'Bitcoin', symbol: 'BTC' },
  { id: 'eth', name: 'Ethereum', symbol: 'ETH' },
  { id: 'sol', name: 'Solana', symbol: 'SOL' },
];

const MODELS: { value: ModelType; label: string; description: string }[] = [
  { value: 'sma', label: 'Moyenne mobile (SMA)', description: 'Basé sur la moyenne simple' },
];

export function ForecastPage() {
  const [selectedCrypto, setSelectedCrypto] = useState('btc');
  const [forecastDays, setForecastDays] = useState<7 | 14 | 30>(7);
  const [modelType, setModelType] = useState<ModelType>('sma');
  const [forecastData, setForecastData] = useState<ForecastResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadForecast = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await forecastService.getForecast(selectedCrypto, forecastDays, modelType);
      setForecastData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des prévisions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadForecast();
  }, [selectedCrypto, forecastDays, modelType]);

  const cryptoInfo = CRYPTOS.find(c => c.id === selectedCrypto) || CRYPTOS[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-white text-2xl mb-2">Prévisions de prix</h2>
          <p className="text-slate-400">Modèles prédictifs basés sur l'analyse historique</p>
        </div>
        <button
          onClick={loadForecast}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Actualiser
        </button>
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
              {CRYPTOS.map((c) => (
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
            <label className="block text-slate-300 mb-2">Modèle de prévision</label>
            <select
              value={modelType}
              onChange={(e) => setModelType(e.target.value as ModelType)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {MODELS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6 flex items-center gap-3">
          <AlertCircle className="w-6 h-6 text-red-400" />
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-8 h-8 text-blue-400 animate-spin" />
        </div>
      )}

      {/* Forecast Data */}
      {!loading && forecastData && (
        <>
          {/* Forecast Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-400">Prix actuel</span>
                <Brain className="w-5 h-5 text-blue-400" />
              </div>
              <p className="text-white text-2xl">${forecastData.currentPrice.toLocaleString()}</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-400">Prévision {forecastDays}j</span>
                <Calendar className="w-5 h-5 text-purple-400" />
              </div>
              <p className="text-white text-2xl">${forecastData.forecastedPrice.toLocaleString()}</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-400">Variation prévue</span>
                {forecastData.predictedChange >= 0 ? (
                  <TrendingUp className="w-5 h-5 text-green-400" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-red-400" />
                )}
              </div>
              <p className={`text-2xl ${forecastData.predictedChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {forecastData.predictedChange >= 0 ? '+' : ''}{forecastData.predictedChange.toFixed(2)}%
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-400">Confiance moyenne</span>
                <Activity className="w-5 h-5 text-yellow-400" />
              </div>
              <p className="text-white text-2xl">{forecastData.averageConfidence}%</p>
            </div>
          </div>

          {/* Forecast Chart */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-6">
            <h3 className="text-white text-xl mb-4">Graphique: Historique vs Prévision</h3>
            <ForecastChart
              historicalData={forecastData.historical.map(h => ({ time: h.date, price: h.price }))}
              forecastData={forecastData.forecasts.map(f => ({ time: f.date, predicted: f.price, confidence: f.confidence }))}
            />
          </div>

          
        </>
      )}
    </div>
  );
}

import React, { useState } from 'react';
import { TrendingUp, Activity, BarChart3, AlertTriangle } from 'lucide-react';
import { cryptoList, generatePriceHistory } from '../../data/mockData';
import { AnalysisChart } from './AnalysisChart';
import { Indicators } from './Indicators';

export function AnalysisPage() {
  const [selectedCrypto, setSelectedCrypto] = useState('bitcoin');
  const [timeRange, setTimeRange] = useState<'7j' | '1 mois' | '3 mois'>('1 mois');
  const [showRSI, setShowRSI] = useState(true);
  const [showMACD, setShowMACD] = useState(false);
  const [showBollinger, setShowBollinger] = useState(false);

  const crypto = cryptoList.find(c => c.id === selectedCrypto) || cryptoList[0];
  
  const getDays = (range: string) => {
    switch (range) {
      case '7j': return 7;
      case '1 mois': return 30;
      case '3 mois': return 90;
      default: return 30;
    }
  };

  const priceData = generatePriceHistory(crypto.price, getDays(timeRange));

  // Calculate simple indicators
  const calculateRSI = () => {
    // Simplified RSI calculation
    const gains = [];
    const losses = [];
    
    for (let i = 1; i < priceData.length; i++) {
      const change = priceData[i].price - priceData[i - 1].price;
      if (change > 0) gains.push(change);
      else losses.push(Math.abs(change));
    }
    
    const avgGain = gains.reduce((a, b) => a + b, 0) / gains.length;
    const avgLoss = losses.reduce((a, b) => a + b, 0) / losses.length;
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  };

  const rsi = calculateRSI();
  const avgPrice = priceData.reduce((sum, d) => sum + d.price, 0) / priceData.length;
  const volatility = Math.sqrt(
    priceData.reduce((sum, d) => sum + Math.pow(d.price - avgPrice, 2), 0) / priceData.length
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-white text-2xl mb-2">Analyse technique</h2>
        <p className="text-slate-400">Indicateurs et signaux de trading</p>
      </div>

      {/* Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
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
            <label className="block text-slate-300 mb-2">Période</label>
            <div className="flex gap-2">
              {(['7j', '1 mois', '3 mois'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`flex-1 px-4 py-3 rounded-lg transition-colors ${
                    timeRange === range
                      ? 'bg-blue-500 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Indicators Toggle */}
        <div>
          <label className="block text-slate-300 mb-2">Indicateurs</label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setShowRSI(!showRSI)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                showRSI
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              RSI
            </button>
            <button
              onClick={() => setShowMACD(!showMACD)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                showMACD
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              MACD
            </button>
            <button
              onClick={() => setShowBollinger(!showBollinger)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                showBollinger
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Bandes de Bollinger
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400">RSI (14)</span>
            <Activity className="w-5 h-5 text-blue-400" />
          </div>
          <p className="text-white text-2xl">{rsi.toFixed(1)}</p>
          <p className={`text-sm mt-1 ${
            rsi > 70 ? 'text-red-400' : rsi < 30 ? 'text-green-400' : 'text-slate-400'
          }`}>
            {rsi > 70 ? 'Suracheté' : rsi < 30 ? 'Survendu' : 'Neutre'}
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400">Prix moyen</span>
            <BarChart3 className="w-5 h-5 text-purple-400" />
          </div>
          <p className="text-white text-2xl">${avgPrice.toFixed(0)}</p>
          <p className="text-slate-400 text-sm mt-1">Sur {timeRange}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400">Volatilité</span>
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
          </div>
          <p className="text-white text-2xl">${volatility.toFixed(0)}</p>
          <p className="text-slate-400 text-sm mt-1">Écart type</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400">Tendance</span>
            <TrendingUp className="w-5 h-5 text-green-400" />
          </div>
          <p className="text-white text-2xl">
            {crypto.change24h >= 0 ? 'Haussière' : 'Baissière'}
          </p>
          <p className={`text-sm mt-1 ${crypto.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {crypto.change24h >= 0 ? '+' : ''}{crypto.change24h}%
          </p>
        </div>
      </div>

      {/* Chart with Overlays */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-6">
        <h3 className="text-white text-xl mb-4">Graphique avec indicateurs</h3>
        <AnalysisChart
          data={priceData}
          showRSI={showRSI}
          showMACD={showMACD}
          showBollinger={showBollinger}
        />
      </div>

      {/* Detailed Indicators */}
      <Indicators
        rsi={rsi}
        avgPrice={avgPrice}
        currentPrice={crypto.price}
        volatility={volatility}
      />
    </div>
  );
}

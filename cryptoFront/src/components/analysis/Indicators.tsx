import React from 'react';
import { TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';

interface IndicatorsProps {
  rsi: number;
  avgPrice: number;
  currentPrice: number;
  volatility: number;
}

export function Indicators({ rsi, avgPrice, currentPrice, volatility }: IndicatorsProps) {
  // Generate signals based on indicators
  const signals = [];

  if (rsi > 70) {
    signals.push({
      type: 'warning',
      title: 'RSI en zone de surachat',
      description: 'Le RSI est au-dessus de 70, indiquant une possible correction à venir.',
      icon: TrendingDown,
      color: 'red',
    });
  } else if (rsi < 30) {
    signals.push({
      type: 'success',
      title: 'RSI en zone de survente',
      description: 'Le RSI est en dessous de 30, indiquant une possible opportunité d\'achat.',
      icon: TrendingUp,
      color: 'green',
    });
  }

  if (currentPrice > avgPrice * 1.1) {
    signals.push({
      type: 'info',
      title: 'Prix au-dessus de la moyenne',
      description: `Le prix actuel est 10% au-dessus de la moyenne mobile (${avgPrice.toFixed(0)}$).`,
      icon: AlertCircle,
      color: 'blue',
    });
  } else if (currentPrice < avgPrice * 0.9) {
    signals.push({
      type: 'info',
      title: 'Prix en-dessous de la moyenne',
      description: `Le prix actuel est 10% en-dessous de la moyenne mobile (${avgPrice.toFixed(0)}$).`,
      icon: AlertCircle,
      color: 'blue',
    });
  }

  const volatilityPercent = (volatility / currentPrice) * 100;
  if (volatilityPercent > 5) {
    signals.push({
      type: 'warning',
      title: 'Volatilité élevée',
      description: `La volatilité est de ${volatilityPercent.toFixed(1)}%, soyez prudent dans vos positions.`,
      icon: AlertCircle,
      color: 'yellow',
    });
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
      <h3 className="text-white text-xl mb-4">Signaux et recommandations</h3>
      
      {signals.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-slate-400">Aucun signal particulier pour le moment</p>
          <p className="text-slate-500 text-sm mt-2">Les indicateurs sont dans une zone neutre</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {signals.map((signal, index) => {
            const Icon = signal.icon;
            const colorClasses = {
              red: 'bg-red-500/10 border-red-500/20 text-red-400',
              green: 'bg-green-500/10 border-green-500/20 text-green-400',
              blue: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
              yellow: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400',
            };

            return (
              <div
                key={index}
                className={`border rounded-lg p-4 ${colorClasses[signal.color as keyof typeof colorClasses]}`}
              >
                <div className="flex items-start gap-3">
                  <Icon className="w-6 h-6 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="mb-1">{signal.title}</h4>
                    <p className="text-sm opacity-80">{signal.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Educational Info */}
      <div className="mt-6 bg-slate-800 rounded-lg p-4">
        <h4 className="text-white mb-3">À propos des indicateurs</h4>
        <div className="space-y-2 text-sm text-slate-400">
          <p><span className="text-blue-400">RSI (Relative Strength Index):</span> Mesure la force d'une tendance. Au-dessus de 70 = surachat, en-dessous de 30 = survente.</p>
          <p><span className="text-purple-400">MA (Moving Average):</span> Moyenne mobile qui lisse les variations de prix et identifie la tendance.</p>
          <p><span className="text-green-400">Bandes de Bollinger:</span> Indiquent la volatilité et les zones de prix extrêmes.</p>
          <p><span className="text-yellow-400">MACD:</span> Identifie les changements de momentum et les points d'entrée/sortie potentiels.</p>
        </div>
      </div>
    </div>
  );
}

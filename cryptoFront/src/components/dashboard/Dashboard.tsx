import React, { useState, useMemo, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, BarChart3, AlertCircle, Loader2 } from 'lucide-react';
import { CryptoSelector } from './CryptoSelector';
import { TimeFilter } from './TimeFilter';
import { PriceChart } from './PriceChart';
import { CandlestickChart } from './CandlestickChart';
import { VolumeChart } from './VolumeChart';
import { cryptoList, generatePriceHistory, generateCandlestickData } from '../../data/mockData';
import { marketService, MarketStats, Crypto, ChartResponse } from '../../services/marketService';

type TimeRange = '24h' | '7j' | '1 mois' | '3 mois' | '1 an';
type ChartType = 'line' | 'candlestick' | 'volume';

export function Dashboard() {
  const [selectedCrypto, setSelectedCrypto] = useState('btc');
  const [timeRange, setTimeRange] = useState<TimeRange>('7j');
  const [chartType, setChartType] = useState<ChartType>('line');
  const [marketStats, setMarketStats] = useState<MarketStats | null>(null);
  const [cryptos, setCryptos] = useState<Crypto[]>([]);
  const [chartData, setChartData] = useState<ChartResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingCryptos, setIsLoadingCryptos] = useState(true);
  const [isLoadingChart, setIsLoadingChart] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cryptosError, setCryptosError] = useState<string | null>(null);
  const [chartError, setChartError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMarketStats = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const stats = await marketService.getMarketStats();
        setMarketStats(stats);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur lors du chargement des statistiques');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMarketStats();
  }, []);

  useEffect(() => {
    const fetchCryptos = async () => {
      try {
        setIsLoadingCryptos(true);
        setCryptosError(null);
        const data = await marketService.getLatestCryptos();
        setCryptos(data);
      } catch (err) {
        setCryptosError(err instanceof Error ? err.message : 'Erreur lors du chargement des cryptomonnaies');
      } finally {
        setIsLoadingCryptos(false);
      }
    };

    fetchCryptos();
  }, []);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        setIsLoadingChart(true);
        setChartError(null);
        const data = await marketService.getCryptoChart(selectedCrypto, timeRange);
        setChartData(data);
      } catch (err) {
        setChartError(err instanceof Error ? err.message : 'Erreur lors du chargement des données du graphique');
      } finally {
        setIsLoadingChart(false);
      }
    };

    fetchChartData();
  }, [selectedCrypto, timeRange]);

  const getDaysFromRange = (range: TimeRange): number => {
    switch (range) {
      case '24h': return 1;
      case '7j': return 7;
      case '1 mois': return 30;
      case '3 mois': return 90;
      case '1 an': return 365;
      default: return 30;
    }
  };

  // Find selected crypto data
  const selectedCryptoData = cryptos.find(c => c.symbol === selectedCrypto);

  // Transform chart data for different chart types
  const priceChartData = chartData?.data.map(d => ({
    date: d.time,
    price: d.price
  })) || [];

  const candlestickChartData = chartData?.data.map(d => ({
    date: d.time,
    open: d.open,
    high: d.high,
    low: d.low,
    close: d.close
  })) || [];

  const volumeChartData = chartData?.data.map(d => ({
    date: d.time,
    volume: d.volume
  })) || [];

  // Format numbers
  const formatMarketCap = (value: string) => {
    const num = parseFloat(value);
    return `$${(num / 1e9).toFixed(0)}Md`;
  };

  const formatVolume = (value: string) => {
    const num = parseFloat(value);
    return `$${(num / 1e9).toFixed(0)}Md`;
  };

  const formatPercentage = (value: string) => {
    const num = parseFloat(value);
    return num.toFixed(2);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Stats */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <div className="flex items-center justify-center h-24">
                <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-6 mb-8">
          <div className="flex items-center gap-3 text-red-400">
            <AlertCircle className="w-6 h-6" />
            <div>
              <p className="font-semibold">Erreur</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        </div>
      ) : marketStats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400">Cap. totale</span>
              <DollarSign className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-white text-2xl">{formatMarketCap(marketStats.totalMarketCap)}</p>
            <p className={`text-sm mt-1 ${parseFloat(marketStats.totalMarketCapChange24h) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {parseFloat(marketStats.totalMarketCapChange24h) >= 0 ? '+' : ''}{formatPercentage(marketStats.totalMarketCapChange24h)}% (24h)
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400">Volume 24h</span>
              <BarChart3 className="w-5 h-5 text-purple-400" />
            </div>
            <p className="text-white text-2xl">{formatVolume(marketStats.totalVolume24h)}</p>
            <p className={`text-sm mt-1 ${parseFloat(marketStats.totalVolume24hChange) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {parseFloat(marketStats.totalVolume24hChange) >= 0 ? '+' : ''}{formatPercentage(marketStats.totalVolume24hChange)}% (24h)
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400">Sentiment du marché</span>
              {marketStats.marketSentiment >= 50 ? (
                <TrendingUp className="w-5 h-5 text-green-400" />
              ) : (
                <TrendingDown className="w-5 h-5 text-red-400" />
              )}
            </div>
            <p className="text-white text-2xl">{marketStats.marketSentiment}</p>
            <p className={`text-sm mt-1 ${marketStats.marketSentiment >= 50 ? 'text-green-400' : 'text-red-400'}`}>
              {marketStats.marketSentiment >= 50 ? 'Positif' : 'Négatif'}
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400">Variation moyenne</span>
              {parseFloat(marketStats.avgChange24h) >= 0 ? (
                <TrendingUp className="w-5 h-5 text-green-400" />
              ) : (
                <TrendingDown className="w-5 h-5 text-red-400" />
              )}
            </div>
            <p className="text-white text-2xl">{formatPercentage(marketStats.avgChange24h)}%</p>
            <p className="text-slate-400 text-sm mt-1">Sur 24h</p>
          </div>
        </div>
      ) : null}

      {/* Chart Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <CryptoSelector
            cryptos={cryptos}
            selectedCrypto={selectedCrypto}
            onChange={setSelectedCrypto}
          />
          <TimeFilter
            selected={timeRange}
            onChange={setTimeRange}
          />
        </div>

        {/* Chart Type Selector */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setChartType('line')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              chartType === 'line'
                ? 'bg-blue-500 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Prix
          </button>
          <button
            onClick={() => setChartType('candlestick')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              chartType === 'candlestick'
                ? 'bg-blue-500 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Chandeliers
          </button>
          <button
            onClick={() => setChartType('volume')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              chartType === 'volume'
                ? 'bg-blue-500 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Volume
          </button>
        </div>

        {/* Chart Display */}
        <div className="bg-slate-950 rounded-lg p-4">
          {isLoadingChart ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
            </div>
          ) : chartError ? (
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-red-400">
                <AlertCircle className="w-5 h-5" />
                <p className="text-sm">{chartError}</p>
              </div>
            </div>
          ) : selectedCryptoData && chartData ? (
            <>
              <h3 className="text-white mb-4">
                {selectedCryptoData.name} ({selectedCryptoData.symbol.toUpperCase()})
                <span className={`ml-3 ${parseFloat(selectedCryptoData.change_24h) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {parseFloat(selectedCryptoData.change_24h) >= 0 ? '+' : ''}{parseFloat(selectedCryptoData.change_24h).toFixed(2)}%
                </span>
              </h3>
              
              {chartType === 'line' && <PriceChart data={priceChartData} />}
              {chartType === 'candlestick' && <CandlestickChart data={candlestickChartData} />}
              {chartType === 'volume' && <VolumeChart data={volumeChartData} />}
            </>
          ) : null}
        </div>
      </div>

      {/* Top Movers */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h3 className="text-white text-xl mb-4">Top variations 24h</h3>
        {isLoadingCryptos ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
          </div>
        ) : cryptosError ? (
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-red-400">
              <AlertCircle className="w-5 h-5" />
              <p className="text-sm">{cryptosError}</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-6 px-6">
            <div className="flex gap-4 min-w-max pb-2">
              {[...cryptos]
                .sort((a, b) => Math.abs(parseFloat(b.change_24h)) - Math.abs(parseFloat(a.change_24h)))
                .map((crypto) => {
                  const change24h = parseFloat(crypto.change_24h);
                  const price = parseFloat(crypto.price);
                  return (
                    <div key={crypto.id} className="bg-slate-800 rounded-lg p-4 min-w-[280px] flex-shrink-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                            {crypto.symbol.substring(0, 1).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-white uppercase">{crypto.symbol}</p>
                            <p className="text-slate-400 text-sm">{crypto.name}</p>
                          </div>
                        </div>
                        <div className={`px-2 py-1 rounded ${
                          change24h >= 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                        }`}>
                          {change24h >= 0 ? '+' : ''}{change24h.toFixed(2)}%
                        </div>
                      </div>
                      <p className="text-white">${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface MarketStats {
  totalMarketCap: string;
  totalMarketCapChange24h: string;
  totalVolume24h: string;
  totalVolume24hChange: string;
  marketSentiment: number;
  avgChange24h: string;
}

export interface Crypto {
  id: number;
  symbol: string;
  name: string;
  price: string;
  market_cap: string;
  volume_24h: string;
  change_1h: string;
  change_24h: string;
  collected_at: string;
}

export interface ChartDataPoint {
  time: string;
  price: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface ChartResponse {
  symbol: string;
  range: string;
  count: number;
  data: ChartDataPoint[];
}

class MarketService {
  async getMarketStats(): Promise<MarketStats> {
    try {
      const response = await fetch(`${API_BASE_URL}/market/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des statistiques du marché');
      }

      const result: MarketStats = await response.json();
      return result;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Erreur de connexion au serveur');
    }
  }

  async getLatestCryptos(): Promise<Crypto[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/cryptos/latest`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des cryptomonnaies');
      }

      const result: Crypto[] = await response.json();
      return result;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Erreur de connexion au serveur');
    }
  }

  async getCryptoChart(symbol: string, range: string): Promise<ChartResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/cryptos/${symbol}/chart?range=${range}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des données du graphique');
      }

      const result: ChartResponse = await response.json();
      return result;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Erreur de connexion au serveur');
    }
  }
}

export const marketService = new MarketService();

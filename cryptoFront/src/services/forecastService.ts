const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export interface ForecastData {
  date: string;
  price: number;
  confidence: number;
}

export interface HistoricalData {
  date: string;
  price: number;
}

export interface Indicators {
  sma7: number | null;
  sma14: number | null;
  sma30: number | null;
  ema7: number | null;
  ema14: number | null;
  linearSlope: number;
  r2: number;
  volatility: number;
}

export interface ForecastResponse {
  symbol: string;
  model: string;
  forecastDays: number;
  currentPrice: number;
  forecastedPrice: number;
  predictedChange: number;
  averageConfidence: number;
  indicators: Indicators;
  historical: HistoricalData[];
  forecasts: ForecastData[];
  generatedAt: string;
}

export interface IndicatorsResponse {
  symbol: string;
  currentPrice: number;
  movingAverages: {
    sma7: number | null;
    sma14: number | null;
    sma30: number | null;
    sma50: number | null;
    ema7: number | null;
    ema14: number | null;
    ema30: number | null;
  };
  trend: {
    direction: 'UP' | 'DOWN' | 'FLAT';
    slope: number;
    r2: number;
  };
  signal: {
    recommendation: 'BUY' | 'SELL' | 'NEUTRAL';
    strength: number;
  };
  dataPoints: number;
}

export type ModelType = 'linear' | 'sma' | 'ema' | 'combined';

class ForecastService {
  private getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  private getHeaders(): HeadersInit {
    const token = this.getToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  /**
   * Génère les prévisions de prix pour une crypto
   */
  async getForecast(symbol: string, days: number = 7, model: ModelType = 'combined'): Promise<ForecastResponse> {
    const response = await fetch(
      `${API_BASE_URL}/forecast/${symbol}?days=${days}&model=${model}`,
      { headers: this.getHeaders() }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erreur lors de la récupération des prévisions');
    }

    return response.json();
  }

  /**
   * Récupère les indicateurs techniques pour une crypto
   */
  async getIndicators(symbol: string): Promise<IndicatorsResponse> {
    const response = await fetch(
      `${API_BASE_URL}/forecast/${symbol}/indicators`,
      { headers: this.getHeaders() }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erreur lors de la récupération des indicateurs');
    }

    return response.json();
  }
}

export const forecastService = new ForecastService();

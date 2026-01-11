// Mock data for the cryptocurrency platform

export interface CryptoData {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
  image: string;
}

export const cryptoList: CryptoData[] = [
  {
    id: 'bitcoin',
    symbol: 'BTC',
    name: 'Bitcoin',
    price: 42500.00,
    change24h: 2.45,
    volume24h: 28500000000,
    marketCap: 832000000000,
    image: '₿'
  },
  {
    id: 'ethereum',
    symbol: 'ETH',
    name: 'Ethereum',
    price: 2250.75,
    change24h: -1.23,
    volume24h: 15200000000,
    marketCap: 270000000000,
    image: 'Ξ'
  },
  {
    id: 'solana',
    symbol: 'SOL',
    name: 'Solana',
    price: 98.50,
    change24h: 5.12,
    volume24h: 2400000000,
    marketCap: 42000000000,
    image: 'S'
  }
];

export interface PricePoint {
  time: string;
  price: number;
  volume?: number;
}

export interface CandlestickPoint {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// Generate mock historical data
export function generatePriceHistory(basePrice: number, days: number): PricePoint[] {
  const data: PricePoint[] = [];
  let currentPrice = basePrice;
  
  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    // Random price movement
    const change = (Math.random() - 0.5) * basePrice * 0.05;
    currentPrice += change;
    
    data.push({
      time: date.toISOString().split('T')[0],
      price: Math.max(currentPrice, basePrice * 0.7),
      volume: Math.random() * 1000000000 + 500000000,
    });
  }
  
  return data;
}

export function generateCandlestickData(basePrice: number, days: number): CandlestickPoint[] {
  const data: CandlestickPoint[] = [];
  let currentPrice = basePrice;
  
  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    const open = currentPrice;
    const change = (Math.random() - 0.5) * basePrice * 0.08;
    const close = open + change;
    const high = Math.max(open, close) * (1 + Math.random() * 0.02);
    const low = Math.min(open, close) * (1 - Math.random() * 0.02);
    
    currentPrice = close;
    
    data.push({
      time: date.toISOString().split('T')[0],
      open,
      high,
      low,
      close,
      volume: Math.random() * 1000000000 + 500000000,
    });
  }
  
  return data;
}

export interface Alert {
  id: string;
  crypto: string;
  condition: '>' | '<';
  threshold: number;
  active: boolean;
  triggered: boolean;
  createdAt: string;
}

export const mockAlerts: Alert[] = [
  {
    id: '1',
    crypto: 'BTC',
    condition: '>',
    threshold: 45000,
    active: true,
    triggered: false,
    createdAt: '2025-12-20',
  },
  {
    id: '2',
    crypto: 'ETH',
    condition: '<',
    threshold: 2000,
    active: true,
    triggered: false,
    createdAt: '2025-12-18',
  },
  {
    id: '3',
    crypto: 'SOL',
    condition: '>',
    threshold: 100,
    active: false,
    triggered: true,
    createdAt: '2025-12-15',
  },
];

export interface Transaction {
  id: string;
  type: 'achat' | 'vente';
  crypto: string;
  amount: number;
  price: number;
  total: number;
  date: string;
}

export const mockTransactions: Transaction[] = [
  {
    id: '1',
    type: 'achat',
    crypto: 'BTC',
    amount: 0.5,
    price: 40000,
    total: 20000,
    date: '2025-11-15',
  },
  {
    id: '2',
    type: 'achat',
    crypto: 'ETH',
    amount: 5,
    price: 2100,
    total: 10500,
    date: '2025-11-20',
  },
  {
    id: '3',
    type: 'vente',
    crypto: 'BTC',
    amount: 0.1,
    price: 42000,
    total: 4200,
    date: '2025-12-01',
  },
  {
    id: '4',
    type: 'achat',
    crypto: 'SOL',
    amount: 50,
    price: 85,
    total: 4250,
    date: '2025-12-10',
  },
];

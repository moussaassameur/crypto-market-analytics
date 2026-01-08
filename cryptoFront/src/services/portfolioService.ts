const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface Transaction {
  id: string;
  type: 'achat' | 'vente';
  crypto: string;
  amount: number;
  price: number;
  total: number;
  date: string;
}

export interface PortfolioStats {
  totalValue: number;
  gainLoss: number;
  roiPercent: number;
  bestCrypto: string | null;
  diversification: number;
}

export interface CreateTransactionData {
  type: 'achat' | 'vente';
  crypto: string;
  amount: number;
  price: number;
}

class PortfolioService {
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

  // Récupérer toutes les transactions
  async getTransactions(): Promise<Transaction[]> {
    const response = await fetch(`${API_BASE_URL}/portfolio/transactions`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erreur lors de la récupération des transactions');
    }

    return response.json();
  }

  // Créer une nouvelle transaction
  async createTransaction(data: CreateTransactionData): Promise<Transaction> {
    const response = await fetch(`${API_BASE_URL}/portfolio/transaction`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        ...data,
        date: new Date().toISOString().split('T')[0],
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erreur lors de la création de la transaction');
    }

    return response.json();
  }

  // Supprimer une transaction
  async deleteTransaction(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/portfolio/transaction/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erreur lors de la suppression');
    }
  }

  // Récupérer les stats du portefeuille
  async getStats(): Promise<PortfolioStats> {
    const response = await fetch(`${API_BASE_URL}/portfolio/stats`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erreur lors de la récupération des stats');
    }

    return response.json();
  }
}

export const portfolioService = new PortfolioService();

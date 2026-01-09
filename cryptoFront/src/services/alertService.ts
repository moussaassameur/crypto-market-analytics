const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface Alert {
  id: string;
  crypto: string;
  condition: '>' | '<';
  threshold: number;
  active: boolean;
  triggered: boolean;
  triggeredAt?: string;
  createdAt: string;
}

export interface CreateAlertData {
  crypto: string;
  condition: '>' | '<';
  threshold: number;
  active?: boolean;
}

export interface UpdateAlertData {
  crypto?: string;
  condition?: '>' | '<';
  threshold?: number;
  active?: boolean;
}

class AlertService {
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

  // Récupérer toutes les alertes de l'utilisateur
  async getAlerts(): Promise<Alert[]> {
    const response = await fetch(`${API_BASE_URL}/alerts`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erreur lors de la récupération des alertes');
    }

    return response.json();
  }

  // Créer une nouvelle alerte
  async createAlert(data: CreateAlertData): Promise<{ message: string; alert: Alert }> {
    const response = await fetch(`${API_BASE_URL}/alerts`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erreur lors de la création de l\'alerte');
    }

    return response.json();
  }

  // Modifier une alerte
  async updateAlert(id: string, data: UpdateAlertData): Promise<{ message: string; alert: Alert }> {
    const response = await fetch(`${API_BASE_URL}/alerts/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erreur lors de la modification de l\'alerte');
    }

    return response.json();
  }

  // Activer/désactiver une alerte
  async toggleAlert(id: string): Promise<{ message: string; alert: Alert }> {
    const response = await fetch(`${API_BASE_URL}/alerts/${id}/toggle`, {
      method: 'PATCH',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erreur lors du basculement de l\'alerte');
    }

    return response.json();
  }

  // Réinitialiser le statut triggered d'une alerte
  async resetAlert(id: string): Promise<{ message: string; alert: Alert }> {
    const response = await fetch(`${API_BASE_URL}/alerts/${id}/reset`, {
      method: 'PATCH',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erreur lors de la réinitialisation de l\'alerte');
    }

    return response.json();
  }

  // Supprimer une alerte
  async deleteAlert(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/alerts/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erreur lors de la suppression de l\'alerte');
    }
  }
}

export const alertService = new AlertService();

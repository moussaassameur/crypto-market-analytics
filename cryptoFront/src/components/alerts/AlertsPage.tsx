import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, Bell, BellOff, RefreshCw, Loader2 } from 'lucide-react';
import { AlertForm, type AlertFormData } from './AlertForm';
import { alertService, type Alert } from '../../services/alertService';

export function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAlert, setEditingAlert] = useState<Alert | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger les alertes au montage
  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await alertService.getAlerts();
      setAlerts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAlert = async (alertData: AlertFormData) => {
    try {
      const { alert: newAlert } = await alertService.createAlert(alertData);
      setAlerts([newAlert, ...alerts]);
      setIsFormOpen(false);
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'Erreur lors de la création');
    }
  };

  const handleEditAlert = async (alertData: AlertFormData) => {
    if (editingAlert) {
      try {
        const { alert: updatedAlert } = await alertService.updateAlert(editingAlert.id, alertData);
        setAlerts(alerts.map((a) => (a.id === editingAlert.id ? updatedAlert : a)));
        setEditingAlert(null);
        setIsFormOpen(false);
      } catch (err) {
        window.alert(err instanceof Error ? err.message : 'Erreur lors de la modification');
      }
    }
  };

  const handleDeleteAlert = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette alerte?')) {
      try {
        await alertService.deleteAlert(id);
        setAlerts(alerts.filter((a) => a.id !== id));
      } catch (err) {
        window.alert(err instanceof Error ? err.message : 'Erreur lors de la suppression');
      }
    }
  };

  const handleToggleActive = async (id: string) => {
    try {
      const { alert: toggledAlert } = await alertService.toggleAlert(id);
      setAlerts(alerts.map((a) => (a.id === id ? toggledAlert : a)));
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'Erreur lors du basculement');
    }
  };

  const handleResetAlert = async (id: string) => {
    try {
      const { alert: resetAlertData } = await alertService.resetAlert(id);
      setAlerts(alerts.map((a) => (a.id === id ? resetAlertData : a)));
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'Erreur lors de la réinitialisation');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white text-2xl">Mes alertes</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={loadAlerts}
              disabled={isLoading}
              className="flex items-center gap-2 px-3 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => {
                setEditingAlert(null);
                setIsFormOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Nouvelle alerte
            </button>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-lg p-4">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Alert Form Modal */}
        {isFormOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-md">
              <h3 className="text-white text-xl mb-4">
                {editingAlert ? 'Modifier l\'alerte' : 'Créer une alerte'}
              </h3>
              <AlertForm
                initialData={editingAlert || undefined}
                onSubmit={editingAlert ? handleEditAlert : handleCreateAlert}
                onCancel={() => {
                  setIsFormOpen(false);
                  setEditingAlert(null);
                }}
              />
            </div>
          </div>
        )}

        {/* Loading state */}
        {isLoading ? (
          <div className="text-center py-12">
            <Loader2 className="w-12 h-12 text-blue-500 mx-auto mb-4 animate-spin" />
            <p className="text-slate-400">Chargement des alertes...</p>
          </div>
        ) : alerts.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">Aucune alerte configurée</p>
            <p className="text-slate-500 text-sm mt-2">
              Créez votre première alerte pour être notifié des mouvements de prix
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="bg-slate-800 border border-slate-700 rounded-lg p-4 flex items-center justify-between hover:bg-slate-750 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleToggleActive(alert.id)}
                    className={`p-2 rounded-lg transition-colors ${
                      alert.active
                        ? 'bg-green-500/10 text-green-400'
                        : 'bg-slate-700 text-slate-500'
                    }`}
                  >
                    {alert.active ? (
                      <Bell className="w-5 h-5" />
                    ) : (
                      <BellOff className="w-5 h-5" />
                    )}
                  </button>

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-white font-medium">
                        {alert.crypto}
                      </span>
                      <span className="text-slate-400">
                        {alert.condition} ${alert.threshold.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        📧 Email
                      </span>
                      <span>Créée le {alert.createdAt}</span>
                      <span
                        className={`px-2 py-0.5 rounded ${
                          alert.active
                            ? 'bg-green-500/10 text-green-400'
                            : 'bg-slate-600/10 text-slate-500'
                        }`}
                      >
                        {alert.active ? 'Active' : 'Inactive'}
                      </span>
                      {alert.triggered && (
                        <span className="px-2 py-0.5 rounded bg-yellow-500/10 text-yellow-400">
                          Déclenchée
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {alert.triggered && (
                    <button
                      onClick={() => handleResetAlert(alert.id)}
                      title="Réinitialiser l'alerte"
                      className="p-2 text-yellow-400 hover:bg-yellow-500/10 rounded-lg transition-colors"
                    >
                      <RefreshCw className="w-5 h-5" />
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setEditingAlert(alert);
                      setIsFormOpen(true);
                    }}
                    className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteAlert(alert.id)}
                    className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info Box */}
        <div className="mt-6 bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
          <p className="text-blue-400 text-sm">
            💡 Les alertes vous permettent d'être notifié en temps réel lorsque le prix d'une
            cryptomonnaie atteint un certain seuil ou varie d'un pourcentage défini.
          </p>
        </div>
      </div>
    </div>
  );
}

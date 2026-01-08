import React, { useState } from 'react';
import { Plus, Trash2, Edit, Bell, BellOff } from 'lucide-react';
import { AlertForm } from './AlertForm';
import { mockAlerts, type Alert } from '../../data/mockData';

export function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAlert, setEditingAlert] = useState<Alert | null>(null);

  const handleCreateAlert = (alert: Omit<Alert, 'id' | 'createdAt'>) => {
    const newAlert: Alert = {
      ...alert,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split('T')[0],
    };
    setAlerts([...alerts, newAlert]);
    setIsFormOpen(false);
  };

  const handleEditAlert = (alert: Omit<Alert, 'id' | 'createdAt'>) => {
    if (editingAlert) {
      setAlerts(
        alerts.map((a) =>
          a.id === editingAlert.id
            ? { ...a, ...alert }
            : a
        )
      );
      setEditingAlert(null);
      setIsFormOpen(false);
    }
  };

  const handleDeleteAlert = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette alerte?')) {
      setAlerts(alerts.filter((a) => a.id !== id));
    }
  };

  const handleToggleActive = (id: string) => {
    setAlerts(
      alerts.map((a) =>
        a.id === id ? { ...a, active: !a.active } : a
      )
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white text-2xl">Mes alertes</h2>
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

        {/* Alerts List */}
        {alerts.length === 0 ? (
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
                      <span className="text-white">
                        {alert.crypto}
                      </span>
                      <span className="text-slate-400">
                        {alert.condition === 'variation %' 
                          ? `variation ${alert.condition} ${alert.threshold}%`
                          : `${alert.condition} $${alert.threshold.toLocaleString()}`
                        }
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        {alert.notificationType === 'email' ? '📧' : '💬'} 
                        {alert.notificationType}
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
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
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

import React, { useState } from 'react';
import { cryptoList, type Alert } from '../../data/mockData';

interface AlertFormProps {
  initialData?: Partial<Alert>;
  onSubmit: (alert: Omit<Alert, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}

export function AlertForm({ initialData, onSubmit, onCancel }: AlertFormProps) {
  const [crypto, setCrypto] = useState(initialData?.crypto || '');
  const [condition, setCondition] = useState(initialData?.condition || '>');
  const [threshold, setThreshold] = useState(initialData?.threshold?.toString() || '');
  const [notificationType, setNotificationType] = useState(initialData?.notificationType || 'email');
  const [active, setActive] = useState(initialData?.active ?? true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!crypto || !threshold) {
      alert('Veuillez remplir tous les champs requis');
      return;
    }

    onSubmit({
      crypto,
      condition,
      threshold: parseFloat(threshold),
      notificationType,
      active,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Crypto Selection */}
      <div>
        <label className="block text-slate-300 mb-2">Cryptomonnaie</label>
        <select
          value={crypto}
          onChange={(e) => setCrypto(e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="">Sélectionner...</option>
          {cryptoList.map((c) => (
            <option key={c.id} value={c.symbol}>
              {c.name} ({c.symbol})
            </option>
          ))}
        </select>
      </div>

      {/* Condition */}
      <div>
        <label className="block text-slate-300 mb-2">Condition</label>
        <select
          value={condition}
          onChange={(e) => setCondition(e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value=">">Supérieur à (&gt;)</option>
          <option value="<">Inférieur à (&lt;)</option>
          <option value="variation %">Variation en %</option>
        </select>
      </div>

      {/* Threshold */}
      <div>
        <label className="block text-slate-300 mb-2">
          {condition === 'variation %' ? 'Pourcentage (%)' : 'Prix seuil ($)'}
        </label>
        <input
          type="number"
          step="0.01"
          value={threshold}
          onChange={(e) => setThreshold(e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={condition === 'variation %' ? 'Ex: 10' : 'Ex: 50000'}
          required
        />
      </div>

      {/* Notification Type */}
      <div>
        <label className="block text-slate-300 mb-2">Type de notification</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setNotificationType('email')}
            className={`px-4 py-3 rounded-lg border transition-colors ${
              notificationType === 'email'
                ? 'bg-blue-500 border-blue-500 text-white'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
            }`}
          >
            📧 Email
          </button>
          <button
            type="button"
            onClick={() => setNotificationType('discord')}
            className={`px-4 py-3 rounded-lg border transition-colors ${
              notificationType === 'discord'
                ? 'bg-blue-500 border-blue-500 text-white'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
            }`}
          >
            💬 Discord
          </button>
        </div>
      </div>

      {/* Active Toggle */}
      <div className="flex items-center justify-between py-2">
        <label className="text-slate-300">Activer l'alerte immédiatement</label>
        <button
          type="button"
          onClick={() => setActive(!active)}
          className={`relative w-12 h-6 rounded-full transition-colors ${
            active ? 'bg-green-500' : 'bg-slate-700'
          }`}
        >
          <div
            className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
              active ? 'translate-x-7' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-3 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors"
        >
          Annuler
        </button>
        <button
          type="submit"
          className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          {initialData ? 'Modifier' : 'Créer'}
        </button>
      </div>
    </form>
  );
}

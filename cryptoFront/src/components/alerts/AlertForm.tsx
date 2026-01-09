import React, { useState } from 'react';
import { cryptoList } from '../../data/mockData';

export interface AlertFormData {
  crypto: string;
  condition: '>' | '<';
  threshold: number;
  active: boolean;
}

interface AlertFormProps {
  initialData?: Partial<AlertFormData>;
  onSubmit: (alert: AlertFormData) => void;
  onCancel: () => void;
}

export function AlertForm({ initialData, onSubmit, onCancel }: AlertFormProps) {
  const [crypto, setCrypto] = useState(initialData?.crypto || '');
  const [condition, setCondition] = useState<'>' | '<'>(initialData?.condition || '>');
  const [threshold, setThreshold] = useState(initialData?.threshold?.toString() || '');
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
          onChange={(e) => setCondition(e.target.value as '>' | '<')}
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value=">">Supérieur à (&gt;)</option>
          <option value="<">Inférieur à (&lt;)</option>
        </select>
      </div>

      {/* Threshold */}
      <div>
        <label className="block text-slate-300 mb-2">Prix seuil ($)</label>
        <input
          type="number"
          step="0.01"
          value={threshold}
          onChange={(e) => setThreshold(e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Ex: 50000"
          required
        />
      </div>

      {/* Notification Info */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-3">
        <p className="text-slate-400 text-sm flex items-center gap-2">
          📧 Notification par email à votre adresse enregistrée
        </p>
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

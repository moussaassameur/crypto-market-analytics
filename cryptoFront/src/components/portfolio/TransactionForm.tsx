import React, { useState, useEffect } from 'react';
import { marketService, type Crypto } from '../../services/marketService';
import { type CreateTransactionData } from '../../services/portfolioService';

interface TransactionFormProps {
  onSubmit: (transaction: CreateTransactionData) => void;
  onCancel: () => void;
}

export function TransactionForm({ onSubmit, onCancel }: TransactionFormProps) {
  const [type, setType] = useState<'achat' | 'vente'>('achat');
  const [crypto, setCrypto] = useState('');
  const [amount, setAmount] = useState('');
  const [price, setPrice] = useState('');
  const [cryptoList, setCryptoList] = useState<Crypto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Charger les cryptos depuis l'API
  useEffect(() => {
    const loadCryptos = async () => {
      try {
        const data = await marketService.getLatestCryptos();
        setCryptoList(data);
      } catch (error) {
        console.error('Erreur chargement cryptos:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadCryptos();
  }, []);
  //const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!crypto || !amount || !price) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    const amountNum = parseFloat(amount);
    const priceNum = parseFloat(price);

    onSubmit({
      type,
      crypto,
      amount: amountNum,
      price: priceNum,
    });
  };

  // Auto-fill current price when crypto is selected
  const handleCryptoChange = (symbol: string) => {
    setCrypto(symbol);
    const selectedCrypto = cryptoList.find((c) => c.symbol === symbol);
    if (selectedCrypto) {
      setPrice(selectedCrypto.price.toString());
    }
  };

  const total = (parseFloat(amount) || 0) * (parseFloat(price) || 0);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Transaction Type */}
      <div>
        <label className="block text-slate-300 mb-2">Type de transaction</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setType('achat')}
            className={`px-4 py-3 rounded-lg border transition-colors ${
              type === 'achat'
                ? 'bg-green-500 border-green-500 text-white'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
            }`}
          >
            Achat
          </button>
          <button
            type="button"
            onClick={() => setType('vente')}
            className={`px-4 py-3 rounded-lg border transition-colors ${
              type === 'vente'
                ? 'bg-red-500 border-red-500 text-white'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
            }`}
          >
            Vente
          </button>
        </div>
      </div>

      {/* Crypto Selection */}
      <div>
        <label className="block text-slate-300 mb-2">Cryptomonnaie</label>
        <select
          value={crypto}
          onChange={(e) => handleCryptoChange(e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
          disabled={isLoading}
        >
          <option value="">{isLoading ? 'Chargement...' : 'Sélectionner...'}</option>
          {cryptoList.map((c) => (
            <option key={c.id} value={c.symbol}>
              {c.name} ({c.symbol})
            </option>
          ))}
        </select>
      </div>

      {/* Amount */}
      <div>
        <label className="block text-slate-300 mb-2">Quantité</label>
        <input
          type="number"
          step="0.00000001"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="0.00"
          required
        />
      </div>

      {/* Price */}
      <div>
        <label className="block text-slate-300 mb-2">Prix unitaire ($)</label>
        <input
        readOnly
          type="number"
          step="0.01"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="0.00"
          required
        />
      </div>


      {/* Total */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Total</span>
          <span className="text-white text-xl">${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
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
          Ajouter
        </button>
      </div>
    </form>
  );
}

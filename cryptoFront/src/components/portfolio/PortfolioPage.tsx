import React, { useState } from 'react';
import { Plus, TrendingUp, TrendingDown, DollarSign, Percent, Coins, Award, Activity } from 'lucide-react';
import { TransactionForm } from './TransactionForm';
import { TransactionTable } from './TransactionTable';
import { PortfolioChart } from './PortfolioChart';
import { mockTransactions, cryptoList, type Transaction } from '../../data/mockData';

export function PortfolioPage() {
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleAddTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString(),
    };
    setTransactions([...transactions, newTransaction]);
    setIsFormOpen(false);
  };

  const handleDeleteTransaction = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette transaction?')) {
      setTransactions(transactions.filter((t) => t.id !== id));
    }
  };

  // Calculate portfolio stats
  const calculatePortfolioStats = () => {
    let totalInvested = 0;
    let currentValue = 0;
    const holdings: { [key: string]: number } = {};
    const cryptoInvestments: { [key: string]: number } = {};

    transactions.forEach((tx) => {
      if (tx.type === 'achat') {
        totalInvested += tx.total;
        holdings[tx.crypto] = (holdings[tx.crypto] || 0) + tx.amount;
        cryptoInvestments[tx.crypto] = (cryptoInvestments[tx.crypto] || 0) + tx.total;
      } else {
        totalInvested -= tx.total;
        holdings[tx.crypto] = (holdings[tx.crypto] || 0) - tx.amount;
        cryptoInvestments[tx.crypto] = (cryptoInvestments[tx.crypto] || 0) - tx.total;
      }
    });

    let bestPerformer = { crypto: '', gain: 0, percentage: 0 };
    
    Object.entries(holdings).forEach(([symbol, amount]) => {
      const crypto = cryptoList.find((c) => c.symbol === symbol);
      if (crypto && amount > 0) {
        const value = amount * crypto.price;
        currentValue += value;
        
        const invested = cryptoInvestments[symbol] || 0;
        const gain = value - invested;
        const gainPercentage = invested > 0 ? (gain / invested) * 100 : 0;
        
        if (gain > bestPerformer.gain) {
          bestPerformer = { crypto: symbol, gain, percentage: gainPercentage };
        }
      }
    });

    const pnl = currentValue - totalInvested;
    const roi = totalInvested > 0 ? (pnl / totalInvested) * 100 : 0;
    const numCryptos = Object.keys(holdings).filter(key => holdings[key] > 0).length;

    return { 
      totalInvested, 
      currentValue, 
      pnl, 
      roi, 
      holdings,
      numCryptos,
      bestPerformer,
      totalTransactions: transactions.length
    };
  };

  const stats = calculatePortfolioStats();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400">Valeur totale</span>
            <DollarSign className="w-5 h-5 text-blue-400" />
          </div>
          <p className="text-white text-2xl font-semibold">${stats.currentValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
          <p className="text-slate-400 text-sm mt-1">Portfolio actuel</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400">Gain/Perte</span>
            {stats.pnl >= 0 ? (
              <TrendingUp className="w-5 h-5 text-green-400" />
            ) : (
              <TrendingDown className="w-5 h-5 text-red-400" />
            )}
          </div>
          <p className={`text-2xl font-semibold ${stats.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {stats.pnl >= 0 ? '+' : ''}${Math.abs(stats.pnl).toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </p>
          <p className={`text-sm mt-1 ${stats.roi >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {stats.roi >= 0 ? '+' : ''}{stats.roi.toFixed(2)}% ROI
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400">Meilleure crypto</span>
            <Award className="w-5 h-5 text-yellow-400" />
          </div>
          {stats.bestPerformer.crypto ? (
            <>
              <p className="text-white text-2xl font-semibold uppercase">{stats.bestPerformer.crypto}</p>
              <p className={`text-sm mt-1 ${stats.bestPerformer.percentage >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {stats.bestPerformer.percentage >= 0 ? '+' : ''}{stats.bestPerformer.percentage.toFixed(2)}%
              </p>
            </>
          ) : (
            <p className="text-slate-400 text-sm">Aucune crypto</p>
          )}
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400">Diversification</span>
            <Coins className="w-5 h-5 text-purple-400" />
          </div>
          <p className="text-white text-2xl font-semibold">{stats.numCryptos}</p>
          <p className="text-slate-400 text-sm mt-1">{stats.totalTransactions} transaction{stats.totalTransactions > 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Transactions */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-white text-xl">Transactions</h3>
          <button
            onClick={() => setIsFormOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Nouvelle transaction
          </button>
        </div>

        {/* Transaction Form Modal */}
        {isFormOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-md">
              <h3 className="text-white text-xl mb-4">Ajouter une transaction</h3>
              <TransactionForm
                onSubmit={handleAddTransaction}
                onCancel={() => setIsFormOpen(false)}
              />
            </div>
          </div>
        )}

        <TransactionTable
          transactions={transactions}
          onDelete={handleDeleteTransaction}
        />
      </div>
    </div>
  );
}
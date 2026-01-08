import React, { useState, useEffect } from 'react';
import { Plus, TrendingUp, TrendingDown, DollarSign, Percent, Coins, Award, Activity } from 'lucide-react';
import { TransactionForm } from './TransactionForm';
import { TransactionTable } from './TransactionTable';
import { PortfolioChart } from './PortfolioChart';
import { portfolioService, type CreateTransactionData, type Transaction, type PortfolioStats } from '../../services/portfolioService';

export function PortfolioPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<PortfolioStats | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger les transactions et stats au montage
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [transactionsData, statsData] = await Promise.all([
        portfolioService.getTransactions(),
        portfolioService.getStats()
      ]);
      setTransactions(transactionsData);
      setStats(statsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
      console.error('Erreur chargement données:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTransaction = async (transaction: CreateTransactionData) => {
    try {
      setError(null);
      const newTransaction = await portfolioService.createTransaction(transaction);
      setTransactions([...transactions, newTransaction]);
      // Recharger les stats après ajout
      const statsData = await portfolioService.getStats();
      setStats(statsData);
      setIsFormOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'ajout');
      console.error('Erreur ajout transaction:', err);
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette transaction?')) {
      try {
        setError(null);
        await portfolioService.deleteTransaction(id);
        setTransactions(transactions.filter((t) => t.id !== id));
        // Recharger les stats après suppression
        const statsData = await portfolioService.getStats();
        setStats(statsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur lors de la suppression');
        console.error('Erreur suppression transaction:', err);
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400">Valeur totale</span>
            <DollarSign className="w-5 h-5 text-blue-400" />
          </div>
          <p className="text-white text-2xl font-semibold">${(stats?.totalValue ?? 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
          <p className="text-slate-400 text-sm mt-1">Portfolio actuel</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400">Gain/Perte</span>
            {(stats?.gainLoss ?? 0) >= 0 ? (
              <TrendingUp className="w-5 h-5 text-green-400" />
            ) : (
              <TrendingDown className="w-5 h-5 text-red-400" />
            )}
          </div>
          <p className={`text-2xl font-semibold ${(stats?.gainLoss ?? 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {(stats?.gainLoss ?? 0) >= 0 ? '+' : ''}${Math.abs(stats?.gainLoss ?? 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </p>
          <p className={`text-sm mt-1 ${(stats?.roiPercent ?? 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {(stats?.roiPercent ?? 0) >= 0 ? '+' : ''}{(stats?.roiPercent ?? 0).toFixed(2)}% ROI
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400">Meilleure crypto</span>
            <Award className="w-5 h-5 text-yellow-400" />
          </div>
          {stats?.bestCrypto ? (
            <>
              <p className="text-white text-2xl font-semibold uppercase">{stats.bestCrypto}</p>
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
          <p className="text-white text-2xl font-semibold">{stats?.diversification ?? 0}</p>
          <p className="text-slate-400 text-sm mt-1">{transactions.length} transaction{transactions.length > 1 ? 's' : ''}</p>
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

        {/* Message d'erreur */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-4">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="text-center py-8">
            <p className="text-slate-400">Chargement...</p>
          </div>
        )}

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

        {!isLoading && (
          <TransactionTable
            transactions={transactions}
            onDelete={handleDeleteTransaction}
          />
        )}
      </div>
    </div>
  );
}
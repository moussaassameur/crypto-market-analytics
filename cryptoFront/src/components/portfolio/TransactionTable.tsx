import React from 'react';
import { Trash2 } from 'lucide-react';
import { type Transaction } from '../../data/mockData';

interface TransactionTableProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
}

export function TransactionTable({ transactions, onDelete }: TransactionTableProps) {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400">Aucune transaction</p>
        <p className="text-slate-500 text-sm mt-2">
          Ajoutez votre première transaction pour commencer à suivre votre portefeuille
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-800">
            <th className="text-left py-4 px-4 text-slate-400">Type</th>
            <th className="text-left py-4 px-4 text-slate-400">Crypto</th>
            <th className="text-right py-4 px-4 text-slate-400">Quantité</th>
            <th className="text-right py-4 px-4 text-slate-400">Prix unitaire</th>
            <th className="text-right py-4 px-4 text-slate-400">Total</th>
            <th className="text-left py-4 px-4 text-slate-400">Date</th>
            <th className="text-center py-4 px-4 text-slate-400">Actions</th>
          </tr>
        </thead>
        <tbody>
          {[...transactions].reverse().map((tx) => (
            <tr
              key={tx.id}
              className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors"
            >
              <td className="py-4 px-4">
                <span
                  className={`px-3 py-1 rounded ${
                    tx.type === 'achat'
                      ? 'bg-green-500/10 text-green-400'
                      : 'bg-red-500/10 text-red-400'
                  }`}
                >
                  {tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}
                </span>
              </td>
              <td className="py-4 px-4 text-white">{tx.crypto}</td>
              <td className="py-4 px-4 text-right text-white">
                {tx.amount.toLocaleString(undefined, { maximumFractionDigits: 8 })}
              </td>
              <td className="py-4 px-4 text-right text-white">
                ${tx.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </td>
              <td className="py-4 px-4 text-right text-white">
                ${tx.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </td>
              <td className="py-4 px-4 text-slate-400">{tx.date}</td>
              <td className="py-4 px-4 text-center">
                <button
                  onClick={() => onDelete(tx.id)}
                  className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors inline-flex"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

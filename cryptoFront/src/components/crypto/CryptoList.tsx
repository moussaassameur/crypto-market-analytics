import React, { useState, useMemo, useEffect } from 'react';
import { Search, ArrowUpDown, ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Loader2, AlertCircle } from 'lucide-react';
import { marketService, Crypto } from '../../services/marketService';

type SortField = 'name' | 'price' | 'change_24h' | 'volume_24h' | 'market_cap';
type SortDirection = 'asc' | 'desc';

export function CryptoList() {
  const [cryptos, setCryptos] = useState<Crypto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('market_cap');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchCryptos = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await marketService.getLatestCryptos();
        setCryptos(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur lors du chargement des cryptomonnaies');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCryptos();
  }, []);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const filteredAndSorted = useMemo(() => {
    let result = [...cryptos];

    // Filter
    if (searchQuery) {
      result = result.filter(
        crypto =>
          crypto.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          crypto.symbol.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort
    result.sort((a, b) => {
      let aVal: any = a[sortField];
      let bVal: any = b[sortField];

      if (sortField === 'name') {
        aVal = a.name.toLowerCase();
        bVal = b.name.toLowerCase();
      } else if (sortField === 'price' || sortField === 'change_24h' || sortField === 'volume_24h' || sortField === 'market_cap') {
        aVal = parseFloat(aVal);
        bVal = parseFloat(bVal);
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [cryptos, searchQuery, sortField, sortDirection]);

  const totalPages = Math.ceil(filteredAndSorted.length / itemsPerPage);
  const paginatedData = filteredAndSorted.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center gap-1 hover:text-white transition-colors"
    >
      {children}
      <ArrowUpDown className="w-4 h-4" />
    </button>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-white text-2xl">Liste des cryptomonnaies</h2>
          
          {/* Search */}
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher une crypto..."
              className="w-full sm:w-64 bg-slate-800 border border-slate-700 rounded-lg pl-11 pr-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Loading and Error States */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-red-400">
              <AlertCircle className="w-5 h-5" />
              <p className="text-sm">{error}</p>
            </div>
          </div>
        ) : (
          <>
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left py-4 px-4 text-slate-400 w-16">#</th>
                <th className="text-left py-4 px-4 text-slate-400">
                  <SortButton field="name">Nom</SortButton>
                </th>
                <th className="text-right py-4 px-4 text-slate-400">
                  <div className="flex justify-end">
                    <SortButton field="price">Prix</SortButton>
                  </div>
                </th>
                <th className="text-right py-4 px-4 text-slate-400">
                  <div className="flex justify-end">
                    <SortButton field="change_24h">24h %</SortButton>
                  </div>
                </th>
                <th className="text-right py-4 px-4 text-slate-400">
                  <div className="flex justify-end">
                    <SortButton field="volume_24h">Volume 24h</SortButton>
                  </div>
                </th>
                <th className="text-right py-4 px-4 text-slate-400">
                  <div className="flex justify-end">
                    <SortButton field="market_cap">Cap. marché</SortButton>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((crypto, index) => (
                <tr
                  key={crypto.id}
                  className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors cursor-pointer"
                >
                  <td className="py-4 px-4 text-slate-400">
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        {crypto.symbol.substring(0, 1).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-white">{crypto.name}</p>
                        <p className="text-slate-400 text-sm uppercase">{crypto.symbol}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-right text-white">
                    ${parseFloat(crypto.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <span
                        className={`px-2 py-1 rounded ${
                          parseFloat(crypto.change_24h) >= 0
                            ? 'bg-green-500/10 text-green-400'
                            : 'bg-red-500/10 text-red-400'
                        }`}
                      >
                        {parseFloat(crypto.change_24h) >= 0 ? (
                          <TrendingUp className="w-4 h-4 inline mr-1" />
                        ) : (
                          <TrendingDown className="w-4 h-4 inline mr-1" />
                        )}
                        {parseFloat(crypto.change_24h) >= 0 ? '+' : ''}
                        {parseFloat(crypto.change_24h).toFixed(2)}%
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-right text-white">
                    ${(parseFloat(crypto.volume_24h) / 1e9).toFixed(2)}Md
                  </td>
                  <td className="py-4 px-4 text-right text-white">
                    ${(parseFloat(crypto.market_cap) / 1e9).toFixed(2)}Md
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-6">
          <p className="text-slate-400">
            Affichage {(currentPage - 1) * itemsPerPage + 1} à{' '}
            {Math.min(currentPage * itemsPerPage, filteredAndSorted.length)} sur{' '}
            {filteredAndSorted.length} résultats
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 bg-slate-800 text-slate-400 rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    currentPage === page
                      ? 'bg-blue-500 text-white'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 bg-slate-800 text-slate-400 rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
        </>
        )}
      </div>
    </div>
  );
}

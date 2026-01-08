import React, { useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';

interface Crypto {
  id: number;
  symbol: string;
  name: string;
}

interface CryptoSelectorProps {
  cryptos: Crypto[];
  selectedCrypto: string;
  onChange: (selected: string) => void;
}

export function CryptoSelector({ cryptos, selectedCrypto, onChange }: CryptoSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectCrypto = (symbol: string) => {
    onChange(symbol);
    setIsOpen(false);
  };

  const selectedCryptoData = cryptos.find(c => c.symbol === selectedCrypto);
  const selectedName = selectedCryptoData ? `${selectedCryptoData.symbol.toUpperCase()} - ${selectedCryptoData.name}` : 'Sélectionner...';

  return (
    <div className="relative flex-1">
      <label className="block text-slate-300 mb-2">Cryptomonnaies</label>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-left text-white flex items-center justify-between hover:border-slate-600 transition-colors"
      >
        <span>{selectedName}</span>
        <ChevronDown className="w-5 h-5 text-slate-400" />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full mt-2 w-full bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-20 max-h-64 overflow-y-auto">
            {cryptos.map((crypto) => (
              <button
                key={crypto.id}
                onClick={() => selectCrypto(crypto.symbol)}
                className="w-full px-4 py-3 text-left hover:bg-slate-700 transition-colors flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {crypto.symbol.substring(0, 1).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-white uppercase">{crypto.symbol}</p>
                    <p className="text-slate-400 text-sm">{crypto.name}</p>
                  </div>
                </div>
                {selectedCrypto === crypto.symbol && (
                  <Check className="w-5 h-5 text-blue-400" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

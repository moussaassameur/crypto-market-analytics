import React from 'react';

type TimeRange = '24h' | '7j' | '1 mois' | '3 mois' | '1 an';

interface TimeFilterProps {
  selected: TimeRange;
  onChange: (range: TimeRange) => void;
}

export function TimeFilter({ selected, onChange }: TimeFilterProps) {
  const options: TimeRange[] = ['24h', '7j', '1 mois', '3 mois', '1 an'];

  return (
    <div className="flex-1">
      <label className="block text-slate-300 mb-2">Période</label>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option}
            onClick={() => onChange(option)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selected === option
                ? 'bg-blue-500 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

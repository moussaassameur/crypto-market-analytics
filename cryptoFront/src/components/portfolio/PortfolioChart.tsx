import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { cryptoList } from '../../data/mockData';

interface PortfolioChartProps {
  holdings: { [key: string]: number };
}

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#6366f1', '#f43f5e'];

export function PortfolioChart({ holdings }: PortfolioChartProps) {
  const chartData = Object.entries(holdings)
    .filter(([_, amount]) => amount > 0)
    .map(([symbol, amount]) => {
      const crypto = cryptoList.find((c) => c.symbol === symbol);
      return {
        name: symbol,
        value: crypto ? amount * crypto.price : 0,
      };
    });

  if (chartData.length === 0) {
    return (
      <div className="h-80 flex items-center justify-center">
        <p className="text-slate-400">Aucune position dans le portefeuille</p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-3">
          <p className="text-white">{payload[0].name}</p>
          <p className="text-blue-400">
            ${payload[0].value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-slate-400 text-sm">
            {((payload[0].value / chartData.reduce((sum, d) => sum + d.value, 0)) * 100).toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Pie Chart */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Holdings List */}
      <div className="space-y-3">
        {chartData.map((item, index) => {
          const totalValue = chartData.reduce((sum, d) => sum + d.value, 0);
          const percentage = (item.value / totalValue) * 100;
          
          return (
            <div key={item.name} className="bg-slate-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-white">{item.name}</span>
                </div>
                <span className="text-slate-400">{percentage.toFixed(1)}%</span>
              </div>
              <p className="text-white">
                ${item.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

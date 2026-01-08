import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, ComposedChart, ReferenceLine } from 'recharts';

interface ForecastChartProps {
  historicalData: any[];
  forecastData: any[];
}

export function ForecastChart({ historicalData, forecastData }: ForecastChartProps) {
  // Combine historical and forecast data
  const combinedData = [
    ...historicalData.slice(-14).map(d => ({
      time: d.time,
      actual: d.price,
      predicted: null,
      confidence: null,
    })),
    ...forecastData.map(d => ({
      time: d.time,
      actual: null,
      predicted: d.predicted,
      confidence: d.confidence,
    })),
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-3">
          <p className="text-slate-400 text-sm mb-2">{data.time}</p>
          {data.actual && (
            <p className="text-blue-400">Réel: ${data.actual.toLocaleString()}</p>
          )}
          {data.predicted && (
            <>
              <p className="text-purple-400">Prédit: ${data.predicted.toLocaleString()}</p>
              <p className="text-slate-400 text-sm">Confiance: {data.confidence}%</p>
            </>
          )}
        </div>
      );
    }
    return null;
  };

  // Find the transition point (last historical data point)
  const transitionIndex = historicalData.slice(-14).length - 1;
  const transitionTime = historicalData[historicalData.length - 1].time;

  return (
    <ResponsiveContainer width="100%" height={400}>
      <ComposedChart data={combinedData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
        <XAxis 
          dataKey="time" 
          stroke="#94a3b8"
          tick={{ fill: '#94a3b8' }}
        />
        <YAxis 
          stroke="#94a3b8"
          tick={{ fill: '#94a3b8' }}
          tickFormatter={(value) => `$${value.toLocaleString()}`}
        />
        <Tooltip content={<CustomTooltip />} />
        
        {/* Reference line to separate historical and forecast */}
        <ReferenceLine 
          x={transitionTime} 
          stroke="#64748b" 
          strokeDasharray="3 3"
          label={{ value: 'Aujourd\'hui', fill: '#94a3b8', position: 'top' }}
        />
        
        {/* Confidence area for forecast */}
        <Area
          type="monotone"
          dataKey="predicted"
          stroke="none"
          fill="#8b5cf6"
          fillOpacity={0.1}
        />
        
        {/* Historical price line */}
        <Line 
          type="monotone" 
          dataKey="actual" 
          stroke="#3b82f6" 
          strokeWidth={3}
          dot={false}
          connectNulls={false}
        />
        
        {/* Forecast line */}
        <Line 
          type="monotone" 
          dataKey="predicted" 
          stroke="#8b5cf6" 
          strokeWidth={3}
          strokeDasharray="5 5"
          dot={false}
          connectNulls={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

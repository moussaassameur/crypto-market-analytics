import React from 'react';
import { ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

interface AnalysisChartProps {
  data: any[];
  showRSI: boolean;
  showMACD: boolean;
  showBollinger: boolean;
}

export function AnalysisChart({ data, showRSI, showMACD, showBollinger }: AnalysisChartProps) {
  // Calculate moving average
  const dataWithMA = data.map((point, index) => {
    if (index < 19) return { ...point, ma20: null };
    
    const slice = data.slice(index - 19, index + 1);
    const ma20 = slice.reduce((sum, d) => sum + d.price, 0) / 20;
    
    return { ...point, ma20 };
  });

  // Calculate Bollinger Bands
  const dataWithBollinger = dataWithMA.map((point, index) => {
    if (!point.ma20) return point;
    
    const slice = data.slice(Math.max(0, index - 19), index + 1);
    const variance = slice.reduce((sum, d) => sum + Math.pow(d.price - point.ma20, 2), 0) / slice.length;
    const stdDev = Math.sqrt(variance);
    
    return {
      ...point,
      upperBand: point.ma20 + (2 * stdDev),
      lowerBand: point.ma20 - (2 * stdDev),
    };
  });

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-3">
          <p className="text-slate-400 text-sm mb-2">{payload[0].payload.time}</p>
          <p className="text-white">Prix: ${payload[0].value.toLocaleString()}</p>
          {payload[0].payload.ma20 && (
            <p className="text-blue-400">MA20: ${payload[0].payload.ma20.toFixed(2)}</p>
          )}
          {showBollinger && payload[0].payload.upperBand && (
            <>
              <p className="text-green-400">BB Sup: ${payload[0].payload.upperBand.toFixed(2)}</p>
              <p className="text-red-400">BB Inf: ${payload[0].payload.lowerBand.toFixed(2)}</p>
            </>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={400}>
      <ComposedChart data={dataWithBollinger} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
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
        
        {/* Bollinger Bands */}
        {showBollinger && (
          <>
            <Area
              type="monotone"
              dataKey="upperBand"
              stroke="none"
              fill="#22c55e"
              fillOpacity={0.1}
            />
            <Area
              type="monotone"
              dataKey="lowerBand"
              stroke="none"
              fill="#ef4444"
              fillOpacity={0.1}
            />
            <Line
              type="monotone"
              dataKey="upperBand"
              stroke="#22c55e"
              strokeWidth={1}
              dot={false}
              strokeDasharray="3 3"
            />
            <Line
              type="monotone"
              dataKey="lowerBand"
              stroke="#ef4444"
              strokeWidth={1}
              dot={false}
              strokeDasharray="3 3"
            />
          </>
        )}
        
        {/* Moving Average */}
        <Line
          type="monotone"
          dataKey="ma20"
          stroke="#8b5cf6"
          strokeWidth={2}
          dot={false}
        />
        
        {/* Price Line */}
        <Line 
          type="monotone" 
          dataKey="price" 
          stroke="#3b82f6" 
          strokeWidth={3}
          dot={false}
        />
        
        {/* RSI Reference Lines */}
        {showRSI && (
          <>
            <ReferenceLine y={70} stroke="#ef4444" strokeDasharray="3 3" />
            <ReferenceLine y={30} stroke="#22c55e" strokeDasharray="3 3" />
          </>
        )}
      </ComposedChart>
    </ResponsiveContainer>
  );
}

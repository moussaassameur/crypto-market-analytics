import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface CandlestickChartProps {
  data: any[];
}

export function CandlestickChart({ data }: CandlestickChartProps) {
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-3">
          <p className="text-slate-400 text-sm mb-2">{data.time}</p>
          <div className="space-y-1 text-sm">
            <p className="text-white">O: ${data.open?.toLocaleString()}</p>
            <p className="text-green-400">H: ${data.high?.toLocaleString()}</p>
            <p className="text-red-400">L: ${data.low?.toLocaleString()}</p>
            <p className="text-white">C: ${data.close?.toLocaleString()}</p>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom candlestick rendering
  const CandlestickBar = (props: any) => {
    const { x, y, width, height, payload } = props;
    const isGreen = payload.close >= payload.open;
    const color = isGreen ? '#22c55e' : '#ef4444';
    
    const wickX = x + width / 2;
    const bodyTop = Math.min(payload.open, payload.close);
    const bodyBottom = Math.max(payload.open, payload.close);
    const bodyHeight = Math.abs(payload.close - payload.open);
    
    return (
      <g>
        {/* Wick */}
        <line
          x1={wickX}
          y1={y}
          x2={wickX}
          y2={y + height}
          stroke={color}
          strokeWidth={1}
        />
        {/* Body */}
        <rect
          x={x + width * 0.2}
          y={y + (payload.high - bodyBottom) / (payload.high - payload.low) * height}
          width={width * 0.6}
          height={Math.max(bodyHeight / (payload.high - payload.low) * height, 1)}
          fill={color}
        />
      </g>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
        <XAxis 
          dataKey="time" 
          stroke="#94a3b8"
          tick={{ fill: '#94a3b8' }}
        />
        <YAxis 
          stroke="#94a3b8"
          tick={{ fill: '#94a3b8' }}
          domain={['auto', 'auto']}
          tickFormatter={(value) => `$${value.toLocaleString()}`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="high" shape={<CandlestickBar />} />
      </BarChart>
    </ResponsiveContainer>
  );
}

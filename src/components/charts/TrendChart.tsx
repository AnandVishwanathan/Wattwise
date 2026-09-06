import { useMemo } from 'react';
import { ComposedChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { format, parseISO } from 'date-fns';
import type { EnergyLog } from '../../types';

interface TrendChartProps {
  logs: EnergyLog[];
}

export function TrendChart({ logs }: TrendChartProps) {
  const chartData = useMemo(() => {
    // Sort logs by date and take the last 14 days
    const sorted = [...logs].sort((a, b) => a.date.localeCompare(b.date));
    
    // In a real app, we'd fill in missing dates. 
    // Here we'll just take the last 14 available logs.
    return sorted.slice(-14).map(log => ({
      date: log.date,
      kwh: log.kwh,
    }));
  }, [logs]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const formattedDate = format(parseISO(label), 'eeee, dd MMM');
      return (
        <div className="bg-surface border border-border p-md rounded-lg shadow-card">
          <p className="font-medium text-text-primary mb-1">{formattedDate}</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <p className="text-text-primary text-small">{payload[0].value.toFixed(1)} kWh</p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-[300px] w-full mt-lg">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
          <XAxis 
            dataKey="date" 
            tickFormatter={(val) => format(parseISO(val), 'dd MMM')}
            tick={{ fontSize: 11, fill: '#64748b' }}
            axisLine={false}
            tickLine={false}
            dy={10}
            minTickGap={20}
          />
          <YAxis 
            tick={{ fontSize: 11, fill: '#64748b' }}
            axisLine={false}
            tickLine={false}
            dx={-10}
            tickFormatter={(val) => `${val}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line 
            type="monotone" 
            dataKey="kwh" 
            stroke="#00C48C" 
            strokeWidth={3} 
            dot={{ r: 4, fill: '#00C48C', strokeWidth: 2, stroke: '#fff' }}
            activeDot={{ r: 6, strokeWidth: 0 }}
            animationDuration={1500}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

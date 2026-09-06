import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { Appliance } from '../../types';

interface ConsumptionChartProps {
  appliances: Appliance[];
}

export function ConsumptionChart({ appliances }: ConsumptionChartProps) {
  // Process data for the chart
  const data = appliances.map(app => {
    const kwh = (app.powerWatts * app.hoursPerDay * 30) / 1000;
    return {
      name: app.name,
      kwh: Number(kwh.toFixed(1)),
      cost: Number((kwh * 6.5).toFixed(0))
    };
  }).sort((a, b) => b.kwh - a.kwh);

  // Group top 7, others
  let displayData = data;
  if (data.length > 7) {
    const top7 = data.slice(0, 7);
    const others = data.slice(7).reduce((acc, curr) => ({
      name: 'Others',
      kwh: acc.kwh + curr.kwh,
      cost: acc.cost + curr.cost
    }), { name: 'Others', kwh: 0, cost: 0 });
    displayData = [...top7, others];
  }

  // If no data, show empty state
  if (displayData.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center text-text-muted">
        No appliance data yet.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={displayData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
        <XAxis 
          dataKey="name" 
          axisLine={false} 
          tickLine={false} 
          tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} 
        />
        <YAxis 
          axisLine={false} 
          tickLine={false} 
          tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} 
          tickFormatter={(value) => `${value}k`}
        />
        <Tooltip
          cursor={{ fill: 'var(--color-surface)' }}
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              const data = payload[0].payload;
              return (
                <div className="bg-card border border-border p-sm rounded shadow-card pointer-events-none">
                  <p className="font-medium text-small mb-1">{data.name}</p>
                  <p className="text-primary font-mono tabular-nums text-micro">{data.kwh} kWh / mo</p>
                  <p className="text-text-muted font-mono tabular-nums text-micro">₹{data.cost} / mo</p>
                </div>
              );
            }
            return null;
          }}
        />
        <Bar dataKey="kwh" radius={[4, 4, 0, 0]}>
          {displayData.map((_entry, index) => (
            <Cell key={`cell-${index}`} fill={index === 0 ? 'var(--color-primary)' : 'var(--color-primary)'} className="hover:opacity-80 transition-opacity" />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

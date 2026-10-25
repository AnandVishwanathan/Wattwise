import { useMemo } from 'react';
import { ComposedChart, Line, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { format, parseISO } from 'date-fns';
import { forecastNextMonth } from '../../lib/ml/forecast';
import type { EnergyLog } from '../../types';

interface ForecastChartProps {
  logs: EnergyLog[];
}

const ForecastTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const formattedDate = format(parseISO(label), 'dd MMM yyyy');
    
    if (data.isForecast) {
      return (
        <div className="bg-surface border border-border p-md rounded-lg shadow-card">
          <p className="font-medium text-text-primary mb-1">{formattedDate}</p>
          <p className="text-primary text-small">Forecast (±15%): {data.forecast.toFixed(1)} kWh</p>
          <p className="text-text-muted text-micro mt-1">Range: {data.lower.toFixed(1)} - {data.upper.toFixed(1)}</p>
        </div>
      );
    }
    return (
      <div className="bg-surface border border-border p-md rounded-lg shadow-card">
        <p className="font-medium text-text-primary mb-1">{formattedDate}</p>
        <p className="text-text-primary text-small">Actual: {data.actual.toFixed(1)} kWh</p>
      </div>
    );
  }
  return null;
};

export function ForecastChart({ logs }: ForecastChartProps) {
  const forecast = useMemo(() => forecastNextMonth(logs), [logs]);

  if (forecast.insufficientData) {
    return (
      <div className="flex flex-col items-center justify-center p-xl text-center h-[300px]">
        <svg className="w-16 h-16 text-text-muted mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01" />
        </svg>
        <h3 className="text-h3 text-text-primary mb-2">Not enough data yet.</h3>
        <p className="text-text-muted text-small max-w-[250px]">
          Keep logging daily to unlock your forecast. Forecast unlocks after 14 days of logging.
        </p>
      </div>
    );
  }

  // Combine actual logs (last 30) and predictions
  const sortedLogs = [...logs].sort((a, b) => a.date.localeCompare(b.date)).slice(-30);
  
  const chartData = [
    ...sortedLogs.map(log => ({
      date: log.date,
      actual: log.kwh,
      isForecast: false,
    })),
    ...forecast.predictions.map(pred => ({
      date: pred.date,
      forecast: pred.kWh,
      lower: pred.lower,
      upper: pred.upper,
      isForecast: true,
    }))
  ];

  const today = sortedLogs.length > 0 ? sortedLogs[sortedLogs.length - 1].date : null;

  const trendMessages = {
    up: { bg: 'bg-amber-100', text: 'text-amber-800', msg: `Projected to increase ${parseFloat(forecast.percentChange.toString()).toFixed(1)}%` },
    down: { bg: 'bg-green-100', text: 'text-green-800', msg: `Projected to decrease ${Math.abs(forecast.percentChange).toFixed(1)}%` },
    stable: { bg: 'bg-border/50', text: 'text-text-primary', msg: 'Projected to remain stable' },
  };

  const trendBadge = trendMessages[forecast.trend];

  return (
    <div className="w-full">
      <div className="flex justify-start mb-lg px-2">
        <span className={`text-small font-medium px-3 py-1 rounded-full ${trendBadge.bg} ${trendBadge.text}`}>
          {trendBadge.msg}
        </span>
      </div>
      
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <XAxis 
              dataKey="date" 
              tickFormatter={(val) => format(parseISO(val), 'dd MMM')}
              minTickGap={30}
              tick={{ fontSize: 12, fill: '#64748b' }}
              axisLine={{ stroke: '#e2e8f0' }}
              tickLine={false}
              dy={10}
            />
            <YAxis 
              tickFormatter={(val) => val.toFixed(1)}
              tick={{ fontSize: 12, fill: '#64748b' }}
              axisLine={false}
              tickLine={false}
              dx={-10}
            />
            <Tooltip content={<ForecastTooltip />} />
            
            {/* Area for confidence band, only where upper/lower exist */}
            <Area 
              type="monotone" 
              dataKey="upper" 
              stroke="none" 
              fill="#00C48C" 
              fillOpacity={0.08}
            />
            {/* Recharts naturally overlays, to get a band we can use an Area with baseValue="lower" if supported, or stacking.
                ComposedChart Area with arbitrary data is simplest. Let's define the bottom boundary to obscure the fill below 'lower' */}
            <Area 
              type="monotone" 
              dataKey="lower" 
              stroke="none" 
              fill="#ffffff" 
              fillOpacity={1}
            />

            <Line 
              type="monotone" 
              dataKey="actual" 
              stroke="#00C48C" 
              strokeWidth={2} 
              dot={false}
              isAnimationActive={false}
            />
            
            <Line 
              type="monotone" 
              dataKey="forecast" 
              stroke="#00C48C" 
              strokeWidth={2} 
              strokeDasharray="6 3" 
              dot={false}
              isAnimationActive={false}
            />
            
            {today && (
              <ReferenceLine 
                x={today} 
                stroke="#64748b" 
                strokeDasharray="3 3"
                label={{ position: 'top', value: 'Today', fill: '#64748b', fontSize: 12 }}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

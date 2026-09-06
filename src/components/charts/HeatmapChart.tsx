import React, { useMemo } from 'react';
import type { EnergyLog } from '../../types';
import { format, subDays, startOfDay, isSameDay } from 'date-fns';

interface HeatmapChartProps {
  logs: EnergyLog[];
  targetKwh: number;
}

export const HeatmapChart: React.FC<HeatmapChartProps> = ({ logs, targetKwh }) => {
  const weeks = 12;
  const daysPerWeek = 7;
  const totalDays = weeks * daysPerWeek;

  const data = useMemo(() => {
    const today = startOfDay(new Date());
    
    const result = [];
    for (let i = 0; i < totalDays; i++) {
      const date = subDays(today, (totalDays - 1) - i);
      const log = logs.find(l => isSameDay(new Date(l.date), date));
      const kwh = log ? log.kwh : 0;
      
      let intensity = 0;
      if (log) {
        const ratio = kwh / (targetKwh / 30); // daily target
        if (ratio < 0.2) intensity = 1;
        else if (ratio < 0.5) intensity = 2;
        else if (ratio < 0.8) intensity = 3;
        else intensity = 4;
      }
      
      result.push({
        date,
        kwh,
        intensity,
        formattedDate: format(date, 'MMM d, yyyy')
      });
    }
    return result;
  }, [logs, targetKwh, totalDays]);

  const getColor = (intensity: number) => {
    switch (intensity) {
      case 0: return 'bg-white/5';
      case 1: return 'bg-emerald-900/40';
      case 2: return 'bg-emerald-700/60';
      case 3: return 'bg-emerald-500/80';
      case 4: return 'bg-emerald-400';
      default: return 'bg-white/5';
    }
  };

  // Group into weeks (columns)
  const weekData = [];
  for (let i = 0; i < weeks; i++) {
    weekData.push(data.slice(i * 7, (i + 1) * 7));
  }

  return (
    <div className="p-md bg-bg-card rounded-xl border border-border">
      <div className="flex items-center justify-between mb-lg">
        <div>
          <h3 className="text-text-1 font-semibold">Energy Intensity</h3>
          <p className="text-xs text-text-muted">Daily usage over last 12 weeks</p>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-text-muted uppercase tracking-wider">
          <span>Less</span>
          <div className="flex gap-1">
            {[0, 1, 2, 3, 4].map(i => (
              <div key={i} className={`w-2.5 h-2.5 rounded-sm ${getColor(i)} border border-white/5`} />
            ))}
          </div>
          <span>More</span>
        </div>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {/* Day labels */}
        <div className="flex flex-col gap-1 justify-between pt-1 pb-1">
          {['M', 'W', 'F'].map(label => (
            <span key={label} className="text-[10px] text-text-3 h-3 flex items-center">{label}</span>
          ))}
        </div>

        {/* Heatmap Grid */}
        <div className="flex gap-1">
          {weekData.map((week, wIdx) => (
            <div key={wIdx} className="flex flex-col gap-1">
              {week.map((day, dIdx) => (
                <div
                  key={dIdx}
                  className={`w-3.5 h-3.5 rounded-[2px] transition-all duration-300 hover:ring-2 hover:ring-accent/50 cursor-help ${getColor(day.intensity)} border border-white/5`}
                  title={`${day.formattedDate}: ${day.kwh.toFixed(1)} kWh`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-md pt-md border-t border-border flex justify-between text-[10px] text-text-3">
        <span>{format(subDays(new Date(), 83), 'MMM d')}</span>
        <span>{format(new Date(), 'MMM d, yyyy')}</span>
      </div>
    </div>
  );
};

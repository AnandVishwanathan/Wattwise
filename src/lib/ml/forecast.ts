import type { EnergyLog } from '../../types';

export interface ForecastResult {
  predictions: Array<{ date: string; kWh: number; lower: number; upper: number }>;
  trend: "up" | "down" | "stable";
  percentChange: number;
  insufficientData: boolean;
}

export function forecastNextMonth(logs: EnergyLog[]): ForecastResult {
  if (!logs || logs.length < 14) {
    return { predictions: [], trend: "stable", percentChange: 0, insufficientData: true };
  }

  // 1. Sort and take most recent 60 days
  const sorted = [...logs].sort((a, b) => a.date.localeCompare(b.date));
  const recentLogs = sorted.slice(-60);
  
  const n = recentLogs.length;
  
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumX2 = 0;

  // 2-3. Calculate linear regression
  for (let i = 0; i < n; i++) {
    const x = i;
    const y = recentLogs[i].kwh;
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumX2 += x * x;
  }

  const denominator = (n * sumX2 - sumX * sumX);
  const slope = denominator === 0 ? 0 : (n * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / n;

  // 4. For next 30 days
  const predictions = [];
  // Parse last date to add days
  const lastDateObj = new Date(recentLogs[n - 1].date);
  
  for (let i = 0; i < 30; i++) {
    const x = n + i;
    let predicted = slope * x + intercept;
    if (predicted < 0) predicted = 0;
    
    // add days to the last date
    const targetDate = new Date(lastDateObj);
    targetDate.setDate(targetDate.getDate() + i + 1);
    
    // formatted as YYYY-MM-DD
    const yyyy = targetDate.getFullYear();
    const mm = String(targetDate.getMonth() + 1).padStart(2, '0');
    const dd = String(targetDate.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;

    predictions.push({
      date: dateStr,
      kWh: Number(predicted.toFixed(2)),
      lower: Number((predicted * 0.85).toFixed(2)),
      upper: Number((predicted * 1.15).toFixed(2))
    });
  }

  // 5. Trend determination
  const first7 = predictions.slice(0, 7);
  const last7 = predictions.slice(-7);
  
  const avgFirst7 = first7.reduce((s, p) => s + p.kWh, 0) / 7;
  const avgLast7 = last7.reduce((s, p) => s + p.kWh, 0) / 7;
  
  let percentChange = 0;
  if (avgFirst7 > 0) {
    percentChange = ((avgLast7 - avgFirst7) / avgFirst7) * 100;
  }

  let trend: "up" | "down" | "stable" = "stable";
  if (percentChange > 5) trend = "up";
  else if (percentChange < -5) trend = "down";

  // 6. Return
  return {
    predictions,
    trend,
    percentChange: Number(percentChange.toFixed(2)),
    insufficientData: false
  };
}

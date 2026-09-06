import type { EnergyLog } from '../../types';

export interface AnomalyResult {
  date: string;           // YYYY-MM-DD
  actualKwh: number;
  expectedKwh: number;    // 7-day rolling average before this date
  percentAbove: number;   // ((actual - expected) / expected) * 100
  severity: "low" | "medium" | "high";
}

export function detectAnomalies(logs: EnergyLog[]): AnomalyResult[] {
  if (!logs || logs.length < 8) return [];

  // Sort logs by date ascending
  const sortedLogs = [...logs].sort((a, b) => a.date.localeCompare(b.date));

  const anomalies: AnomalyResult[] = [];

  for (let i = 7; i < sortedLogs.length; i++) {
    const todayLog = sortedLogs[i];
    if (todayLog.kwh === null || todayLog.kwh === undefined) continue;

    let sum = 0;
    let count = 0;
    
    // Average of 7 days BEFORE this day (index i-7 to i-1)
    for (let j = 1; j <= 7; j++) {
      const prevLog = sortedLogs[i - j];
      if (prevLog && prevLog.kwh !== null && prevLog.kwh !== undefined) {
        sum += prevLog.kwh;
        count++;
      }
    }

    if (count === 0) continue;
    
    const rollingAvg = sum / count;
    if (rollingAvg === 0) continue;

    const pctAbove = ((todayLog.kwh - rollingAvg) / rollingAvg) * 100;

    let severity: "low" | "medium" | "high" | null = null;
    if (pctAbove >= 70) {
      severity = "high";
    } else if (pctAbove >= 40) {
      severity = "medium";
    } else if (pctAbove >= 20) {
      severity = "low";
    }

    if (severity) {
      anomalies.push({
        date: todayLog.date,
        actualKwh: todayLog.kwh,
        expectedKwh: rollingAvg,
        percentAbove: pctAbove,
        severity
      });
    }
  }

  return anomalies;
}

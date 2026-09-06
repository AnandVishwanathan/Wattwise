import type { EnergyLog } from '../../types';

export interface HabitScoreResult {
  score: number;           // 0–100, always integer
  trend: "improving" | "declining" | "steady";
  trendPoints: number;     // how many points changed vs last period
  weeklyScores: Array<{ week: string; score: number }>;
}

function calculateScoreForWindow(logs: EnergyLog[], targetKwh: number): number {
  if (targetKwh <= 0) return 50;
  
  const totalActualKwh = logs.reduce((sum, log) => sum + log.kwh, 0);
  
  const actualDays = new Set(logs.map(l => l.date)).size;
  if (actualDays === 0) return 50;

  const proRataTarget = targetKwh * (actualDays / 30);
  const ratio = totalActualKwh / proRataTarget;

  let score = 0;
  if (ratio <= 1.0) {
    score = 100;
  } else if (ratio <= 1.2) {
    score = Math.round(100 - (ratio - 1.0) * 200);
  } else if (ratio <= 2.0) {
    score = Math.round(60 - (ratio - 1.2) * 75);
  } else {
    score = 0;
  }

  return Math.max(0, Math.min(100, score));
}

export function calculateHabitScore(
  logs: EnergyLog[],
  targetKwh: number,
  windowDays: number = 30
): HabitScoreResult {
  if (!logs || logs.length < 3 || targetKwh <= 0) {
    return { score: 50, trend: "steady", trendPoints: 0, weeklyScores: [] };
  }

  const sorted = [...logs].sort((a, b) => a.date.localeCompare(b.date));
  
  const currentWindowLogs = sorted.slice(-windowDays);
  const score = calculateScoreForWindow(currentWindowLogs, targetKwh);

  const prevWindowLogs = sorted.slice(-windowDays * 2, -windowDays);
  const prevScore = calculateScoreForWindow(prevWindowLogs, targetKwh);

  let trend: "improving" | "declining" | "steady" = "steady";
  const trendPoints = score - prevScore;

  if (prevWindowLogs.length < 3) {
    trend = "steady";
  } else {
    if (score > prevScore + 3) trend = "improving";
    else if (score < prevScore - 3) trend = "declining";
    else trend = "steady";
  }

  const weeklyScores: Array<{ week: string; score: number }> = [];
  const bucketSize = Math.max(1, Math.ceil(currentWindowLogs.length / 4));
  
  for (let i = 0; i < 4; i++) {
    const weekLogs = currentWindowLogs.slice(i * bucketSize, (i + 1) * bucketSize);
    if (weekLogs.length > 0) {
      const wScore = calculateScoreForWindow(weekLogs, targetKwh);
      weeklyScores.push({ week: `Week ${i + 1}`, score: wScore });
    } else {
      weeklyScores.push({ week: `Week ${i + 1}`, score: 50 });
    }
  }

  return {
    score,
    trend,
    trendPoints,
    weeklyScores
  };
}

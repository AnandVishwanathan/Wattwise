import { format } from 'date-fns';
import type { EnergyLog, StreakResult, Badge } from '../../types';

export function calculateStreak(logs: EnergyLog[]): StreakResult {
  const today = format(new Date(), 'yyyy-MM-dd');
  const zeroState: StreakResult = {
    currentStreak: 0,
    longestStreak: 0,
    greenCredits: 0,
    lastUpdated: today,
    isTodayCounted: false
  };

  if (!logs || logs.length < 2) {
    return zeroState;
  }

  // Ensure logs are sorted by date descending (most recent first)
  const sortedLogs = [...logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  let currentStreak = 0;
  let longestStreak = 0;

  for (let i = 0; i < sortedLogs.length - 1; i++) {
    // A streak continues if today's usage is <= yesterday's usage
    if (sortedLogs[i].kwh <= sortedLogs[i+1].kwh) {
      currentStreak++;
      longestStreak = Math.max(longestStreak, currentStreak);
    } else {
      break;
    }
  }

  const greenCredits = (currentStreak * 1) + 
                       (Math.floor(currentStreak / 7) * 10) + 
                       (Math.floor(currentStreak / 30) * 50);

  return {
    currentStreak,
    longestStreak,
    greenCredits,
    lastUpdated: today,
    isTodayCounted: sortedLogs[0].date === today
  };
}

export function getBadges(
  _currentStreak: number,
  longestStreak: number,
  greenCredits: number,
  _logs: EnergyLog[],
  _targetKwh: number,
  applianceCount: number = 0,
  hasTargetHit: boolean = false,
  hasResolvedAnomaly: boolean = false,
  hasReducedBill: boolean = false,
  earnedDates: Record<string, string> = {}
): Badge[] {
  const today = format(new Date(), 'yyyy-MM-dd');
  
  const checkEarned = (id: string, conditionMet: boolean) => {
    if (earnedDates[id]) return earnedDates[id];
    if (conditionMet) return today;
    return null;
  };

  return [
    {
      id: "first_log", name: "Power Aware", icon: "⚡", description: "Logged your first appliance", condition: "Add your first appliance",
      earnedAt: checkEarned("first_log", applianceCount >= 1)
    },
    {
      id: "streak_7", name: "Green Week", icon: "🌿", description: "7-day saving streak achieved", condition: "Reduce usage 7 days in a row",
      earnedAt: checkEarned("streak_7", longestStreak >= 7)
    },
    {
      id: "streak_30", name: "Eco Champion", icon: "🏆", description: "30-day saving streak achieved", condition: "Reduce usage 30 days in a row",
      earnedAt: checkEarned("streak_30", longestStreak >= 30)
    },
    {
      id: "credits_100", name: "Credit Collector", icon: "💎", description: "Earned 100 green credits", condition: "Accumulate 100 green credits",
      earnedAt: checkEarned("credits_100", greenCredits >= 100)
    },
    {
      id: "goal_hit", name: "Target Smasher", icon: "🎯", description: "Finished a month under your kWh target", condition: "Complete a month within your energy goal",
      earnedAt: checkEarned("goal_hit", hasTargetHit)
    },
    {
      id: "five_appliances", name: "Home Mapper", icon: "🏠", description: "Logged 5 or more appliances", condition: "Add at least 5 appliances",
      earnedAt: checkEarned("five_appliances", applianceCount >= 5)
    },
    {
      id: "anomaly_resolved", name: "Spike Buster", icon: "🔍", description: "Had a usage spike and recovered the next day", condition: "Recover from a detected usage anomaly",
      earnedAt: checkEarned("anomaly_resolved", hasResolvedAnomaly)
    },
    {
      id: "bill_reduced", name: "Bill Crusher", icon: "📉", description: "Reduced monthly bill by 20% or more", condition: "Cut your bill by 20% vs previous month",
      earnedAt: checkEarned("bill_reduced", hasReducedBill)
    }
  ];
}

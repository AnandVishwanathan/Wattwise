export interface Appliance {
  id: string;
  name: string;
  icon: string; // emoji
  room: string;
  powerWatts: number;
  hoursPerDay: number;
  createdAt: string;
  userId: string;
}

export interface PresetAppliance {
  name: string;
  icon: string;
  defaultWatts: number;
}

export const PRESET_APPLIANCES: PresetAppliance[] = [
  { name: 'Air Conditioner', icon: '❄️', defaultWatts: 1500 },
  { name: 'Refrigerator', icon: '🧊', defaultWatts: 150 },
  { name: 'Washing Machine', icon: '🧺', defaultWatts: 500 },
  { name: 'Television', icon: '📺', defaultWatts: 100 },
  { name: 'Water Heater', icon: '♨️', defaultWatts: 2000 },
  { name: 'Ceiling Fan', icon: '🌀', defaultWatts: 75 },
  { name: 'Microwave', icon: '🍱', defaultWatts: 800 },
  { name: 'Desktop PC', icon: '💻', defaultWatts: 250 },
];

export const ROOMS = ['Living Room', 'Bedroom', 'Kitchen', 'Bathroom', 'Other'];

export interface EnergyTip {
  appliance: string;
  action: string;
  savingRupees: number;
  category: "timing" | "temperature" | "duration" | "replacement" | "habit";
}

export interface EnergyLog {
  id: string;
  date: string;
  userId: string;
  kwh: number;
}

export interface StreakResult {
  currentStreak: number;
  longestStreak: number;
  greenCredits: number;
  lastUpdated: string;
  isTodayCounted: boolean;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: string | null;
  condition: string;
}

export interface SavingOpportunity {
  applianceId: string;
  applianceName: string;
  currentMonthlyCost: number;
  optimizedMonthlyCost: number;
  savingRupees: number;
  recommendedTime: string;
  reason: string;
  isFlexible: boolean;
}

export interface ReportData {
  userName: string;
  month: string;
  totalKwh: number;
  totalCost: number;
  targetKwh: number;
  habitScore: number;
  co2Kg: number;
  topAppliances: Array<{
    name: string;
    kWh: number;
    cost: number;
  }>;
  streakDays: number;
  greenCredits: number;
  savingVsLastMonth: number;
  tips: EnergyTip[];
}

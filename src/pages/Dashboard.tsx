import { useState, useEffect, useMemo } from 'react';
import { Zap, IndianRupee, Leaf, Target } from 'lucide-react';
import { StatCard } from '../components/dashboard/StatCard';
import { ConsumptionChart } from '../components/charts/ConsumptionChart';
import { AITipsPanel } from '../components/dashboard/AITipsPanel';
import { AnomalyAlert } from '../components/dashboard/AnomalyAlert';
import { RateOptimizer } from '../components/dashboard/RateOptimizer';
import { TargetSettingsSheet } from '../components/dashboard/TargetSettingsSheet';
import { HabitScoreDetailSheet } from '../components/dashboard/HabitScoreDetailSheet';
import type { Appliance, EnergyLog } from '../types';
import { calculateCO2 } from '../lib/calculations';
import { calculateHabitScore } from '../lib/ml/habitScore';
import { calculateRateOptimizations } from '../lib/ml/rateOptimizer';
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

const mockAppliances: Appliance[] = [
  { id: '1', name: 'AC Master', icon: '❄️', room: 'Bedroom', powerWatts: 1500, hoursPerDay: 8, createdAt: '2023-01-01', userId: '1' },
  { id: '2', name: 'Fridge', icon: '🧊', room: 'Kitchen', powerWatts: 150, hoursPerDay: 24, createdAt: '2023-01-01', userId: '1' },
  { id: '3', name: 'TV', icon: '📺', room: 'Living', powerWatts: 100, hoursPerDay: 4, createdAt: '2023-01-01', userId: '1' },
  { id: '4', name: 'Water Heater', icon: '♨️', room: 'Bathroom', powerWatts: 2000, hoursPerDay: 1, createdAt: '2023-01-01', userId: '1' },
  { id: '5', name: 'Washing Machine', icon: '🧺', room: 'Utility', powerWatts: 500, hoursPerDay: 2, createdAt: '2023-01-01', userId: '1' },
];

const mockLogs: EnergyLog[] = [
  { id: '1', date: '2023-10-01', kwh: 12, userId: '1' },
  { id: '2', date: '2023-10-02', kwh: 11, userId: '1' },
  { id: '3', date: '2023-10-03', kwh: 13, userId: '1' },
  { id: '4', date: '2023-10-04', kwh: 10, userId: '1' },
  { id: '5', date: '2023-10-05', kwh: 12, userId: '1' },
  { id: '6', date: '2023-10-06', kwh: 11, userId: '1' },
  { id: '7', date: '2023-10-07', kwh: 12, userId: '1' },
  { id: '8', date: '2023-10-08', kwh: 38, userId: '1' }, // Spike!
  { id: '9', date: '2023-10-09', kwh: 10, userId: '1' },
  { id: '10', date: '2023-10-10', kwh: 11, userId: '1' },
  { id: '11', date: '2023-10-11', kwh: 12, userId: '1' },
  { id: '12', date: '2023-10-12', kwh: 13, userId: '1' },
];

export default function Dashboard() {
  const { user } = useAuth();
  const appliances = mockAppliances;

  const [monthlyTarget, setMonthlyTarget] = useState<number | null>(null);
  const [isTargetSheetOpen, setIsTargetSheetOpen] = useState(false);
  const [isHabitSheetOpen, setIsHabitSheetOpen] = useState(false);

  useEffect(() => {
    async function loadTarget() {
      if (user?.uid) {
        try {
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists() && docSnap.data().profile?.monthlyTarget) {
            setMonthlyTarget(docSnap.data().profile.monthlyTarget);
          }
        } catch (e) {
          console.warn("Error loading target via firebase (likely unconfigured):", e);
        }
      }
    }
    loadTarget();
  }, [user]);

  const handleSaveTarget = async (target: number) => {
    setMonthlyTarget(target);
    if (user?.uid) {
      try {
        const docRef = doc(db, 'users', user.uid);
        await setDoc(docRef, { profile: { monthlyTarget: target } }, { merge: true });
      } catch (e) {
        console.warn("Error saving target via firebase (likely unconfigured):", e);
      }
    }
  };

  const totalMonthlyKwh = appliances.reduce((sum, app) => sum + (app.powerWatts * app.hoursPerDay * 30) / 1000, 0);
  const totalDailyKwh = totalMonthlyKwh / 30;
  const totalMonthlyBill = totalMonthlyKwh * 6.5;
  
  const co2Data = calculateCO2(totalMonthlyKwh);
  const habitData = calculateHabitScore(mockLogs, monthlyTarget || 150);
  
  const rateOpportunities = useMemo(() => calculateRateOptimizations(appliances), [appliances]);

  return (
    <div className="pb-3xl p-md">
      <header className="mb-lg">
        <h1 className="text-h1">Dashboard</h1>
        <p className="text-text-muted text-small">Welcome back, User! Here's your energy summary.</p>
      </header>

      {monthlyTarget === null && (
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-md mb-lg flex items-center justify-between">
          <p className="text-small font-medium text-primary">Set a monthly target to unlock Habit Score</p>
          <button 
            onClick={() => setIsTargetSheetOpen(true)}
            className="text-[12px] font-bold bg-primary text-white px-3 py-1.5 rounded-full hover:bg-primary-dark transition-colors touch-target whitespace-nowrap"
          >
            Set Target
          </button>
        </div>
      )}

      <AnomalyAlert logs={mockLogs} />

      {/* Top 4 Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-md mb-xl">
        <StatCard
          icon={<Zap size={14} className="text-warning" />}
          iconColor="bg-warning/10"
          label="Today's Est."
          value={totalDailyKwh}
          suffix=" kWh"
          decimals={1}
          trend={-5}
        />
        <StatCard
          icon={<IndianRupee size={14} className="text-primary" />}
          iconColor="bg-primary/10"
          label="Month Bill"
          value={totalMonthlyBill}
          prefix="₹"
          trend={12}
          trendGoodIfUp={false}
        />
        
        <div title={`Equivalent to driving ${co2Data.carKm.toFixed(0)} km`} className="flex flex-col">
          <StatCard
            icon={<Leaf size={14} className="text-[#0D9488]" />}
            iconColor="bg-[#0D9488]/10"
            label="CO₂ Footprint"
            value={co2Data.kgCO2}
            suffix=" kg"
            decimals={1}
            trend={-8}
          />
          <p className="text-[10px] text-text-muted text-center mt-1">≈ {co2Data.treeDays.toFixed(0)} tree-days</p>
        </div>
        
        <div onClick={() => { if(monthlyTarget) setIsHabitSheetOpen(true); }} className={monthlyTarget ? "cursor-pointer" : "opacity-50 pointer-events-none"}>
          <StatCard
            icon={<Target size={14} className="text-[#9333EA]" />}
            iconColor="bg-[#9333EA]/10"
            label="Habit Score"
            value={monthlyTarget ? habitData.score : 0}
            trend={monthlyTarget ? habitData.trendPoints : 0}
            trendGoodIfUp={true}
          />
        </div>
      </div>

      <RateOptimizer opportunities={rateOpportunities} />

      <AITipsPanel 
        appliances={appliances} 
        monthlyBill={totalMonthlyBill} 
        habitScore={monthlyTarget ? habitData.score : 50} 
        localRate={6.5} 
        isTargetSet={monthlyTarget !== null}
        onSetTarget={() => setIsTargetSheetOpen(true)}
      />

      {/* Charts Section */}
      <div className="bg-card border border-border rounded-lg p-md shadow-card mb-lg">
        <h2 className="text-h3 mb-md">Top Appliances (Monthly consumption)</h2>
        <div className="h-[250px] w-full">
          <ConsumptionChart appliances={appliances} />
        </div>
      </div>

      <TargetSettingsSheet 
        isOpen={isTargetSheetOpen} 
        onClose={() => setIsTargetSheetOpen(false)} 
        onSave={handleSaveTarget}
        initialTarget={monthlyTarget || 150}
      />

      {monthlyTarget && (
        <HabitScoreDetailSheet
          isOpen={isHabitSheetOpen}
          onClose={() => setIsHabitSheetOpen(false)}
          result={habitData}
          onSetNewTarget={() => {
            setIsHabitSheetOpen(false);
            setTimeout(() => setIsTargetSheetOpen(true), 300);
          }}
        />
      )}
    </div>
  );
}

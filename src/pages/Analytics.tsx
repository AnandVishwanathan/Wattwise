import { useState } from 'react';
import { ConsumptionChart } from '../components/charts/ConsumptionChart';
import { ForecastChart } from '../components/charts/ForecastChart';
import { HeatmapChart } from '../components/charts/HeatmapChart';
import { TrendChart } from '../components/charts/TrendChart';
import type { Appliance, EnergyLog } from '../types';

const mockAppliances: Appliance[] = [
  { id: '1', name: 'AC Master', icon: '❄️', room: 'Bedroom', powerWatts: 1500, hoursPerDay: 8, createdAt: '2023-01-01', userId: '1' },
  { id: '2', name: 'Fridge', icon: '🧊', room: 'Kitchen', powerWatts: 150, hoursPerDay: 24, createdAt: '2023-01-01', userId: '1' },
];

const mockLogs: EnergyLog[] = [
  ...Array.from({ length: 90 }, (_, i) => ({
    id: String(i),
    date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    kwh: Math.random() * 15 + 2,
    userId: '1'
  }))
];

export default function Analytics() {
  const [activeTab, setActiveTab] = useState<'consumption' | 'trend' | 'forecast' | 'heatmap'>('heatmap');

  return (
    <div className="pb-3xl p-md">
      <header className="mb-lg">
        <h1 className="text-h1">Analytics</h1>
        <p className="text-text-muted text-small">Deep dive into your energy usage.</p>
      </header>

      <div className="flex bg-surface rounded-lg p-1 border border-border mb-lg overflow-x-auto">
        {['consumption', 'trend', 'forecast', 'heatmap'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`flex-1 min-w-[100px] py-2 text-small font-medium rounded-md capitalize transition-colors ${
              activeTab === tab ? 'bg-card shadow-sm text-primary' : 'text-text-muted hover:text-text-primary'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="bg-card border border-border rounded-lg p-md shadow-card">
        {activeTab === 'consumption' && (
          <div>
            <h2 className="text-h3 mb-md">Top Appliances (Monthly consumption)</h2>
            <div className="h-[250px] w-full">
              <ConsumptionChart appliances={mockAppliances} />
            </div>
          </div>
        )}
        {activeTab === 'trend' && (
          <div>
            <h2 className="text-h3 mb-md">Daily Usage Trend</h2>
            <TrendChart logs={mockLogs} />
          </div>
        )}
        {activeTab === 'forecast' && (
          <div>
            <ForecastChart logs={mockLogs} />
          </div>
        )}
        {activeTab === 'heatmap' && (
          <div>
            <HeatmapChart logs={mockLogs} targetKwh={200} />
          </div>
        )}
      </div>
    </div>
  );
}

import React from 'react';
import type { SavingOpportunity } from '../../types';
import { Card } from '../ui/Card';
import { Zap, Clock, TrendingDown } from 'lucide-react';

interface RateOptimizerProps {
  opportunities: SavingOpportunity[];
}

export const RateOptimizer: React.FC<RateOptimizerProps> = ({ opportunities }) => {
  if (opportunities.length === 0) return null;

  const totalSavings = opportunities.reduce((acc, op) => acc + op.savingRupees, 0);

  return (
    <div className="space-y-md mb-xl">
      <div className="flex items-center justify-between">
        <h3 className="text-text-1 font-semibold flex items-center gap-2">
          <div className="p-1 rounded-md bg-amber/10 border border-amber/20">
            <Zap className="w-4 h-4 text-amber" />
          </div>
          Rate Optimizer
        </h3>
        <span className="text-[10px] bg-accent/10 text-accent font-bold px-2 py-1 rounded-md border border-accent/20 flex items-center gap-1">
          <TrendingDown className="w-3 h-3" />
          Potential Savings: ₹{totalSavings}/mo
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
        {opportunities.map((op) => (
          <Card key={op.applianceId} className="group transition-all hover:bg-bg-raised hover:scale-[1.01] border-white/5">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-text-1 font-medium">{op.applianceName}</h4>
                <div className="flex items-center gap-1.5 mt-1 text-[10px] text-text-3 font-mono">
                  <Clock className="w-3 h-3" />
                  <span>Recommend: {op.recommendedTime}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-accent font-bold text-sm">₹{op.savingRupees}</div>
                <div className="text-[9px] text-text-3 uppercase tracking-tighter">monthly</div>
              </div>
            </div>
            
            <div className="mt-md bg-black/20 rounded-md p-2 border border-white/5">
              <p className="text-[11px] text-text-2 leading-relaxed italic">
                "{op.reason}"
              </p>
            </div>
            
            <div className="mt-md flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[9px] text-text-3 uppercase">Current</span>
                <span className="text-xs text-red/70 line-through">₹{op.currentMonthlyCost}</span>
              </div>
              <div className="h-px flex-1 mx-4 bg-gradient-to-r from-red/20 via-accent/20 to-accent/20" />
              <div className="flex flex-col items-end">
                <span className="text-[9px] text-text-3 uppercase">Optimized</span>
                <span className="text-xs text-accent font-semibold">₹{op.optimizedMonthlyCost}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

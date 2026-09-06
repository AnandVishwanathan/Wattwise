import { useState, useEffect } from 'react';
import { Sparkles, RotateCw, Target } from 'lucide-react';
import { getEnergyTips } from '../../lib/gemini';
import type { EnergyTip, Appliance } from '../../types';

interface AITipsPanelProps {
  appliances: Appliance[];
  monthlyBill: number;
  habitScore: number;
  localRate: number;
  isTargetSet: boolean;
  onSetTarget: () => void;
}

const CATEGORY_COLORS: Record<string, { border: string; bg: string; text: string }> = {
  timing: { border: 'border-l-amber-500', bg: 'bg-amber-100', text: 'text-amber-700' },
  temperature: { border: 'border-l-blue-500', bg: 'bg-blue-100', text: 'text-blue-700' },
  duration: { border: 'border-l-teal-500', bg: 'bg-teal-100', text: 'text-teal-700' },
  replacement: { border: 'border-l-purple-500', bg: 'bg-purple-100', text: 'text-purple-700' },
  habit: { border: 'border-l-green-500', bg: 'bg-green-100', text: 'text-green-700' },
};

export function AITipsPanel({ appliances, monthlyBill, habitScore, localRate, isTargetSet, onSetTarget }: AITipsPanelProps) {
  const [tips, setTips] = useState<EnergyTip[]>([]);
  const [loading, setLoading] = useState(true);
  const [animatingTextArray, setAnimatingTextArray] = useState<string[]>(['', '', '']);

  const fetchTips = async (bypassCache = false) => {
    setLoading(true);
    setAnimatingTextArray(['', '', '']);
    
    const startTime = Date.now();
    try {
      const result = await getEnergyTips(appliances, monthlyBill, habitScore, localRate, bypassCache);
      
      const elapsed = Date.now() - startTime;
      if (elapsed < 800) {
        await new Promise(resolve => setTimeout(resolve, 800 - elapsed));
      }
      
      setTips(result);
      setLoading(false);
      
      // trigger typewriter
      result.forEach((tip, index) => {
        let i = 0;
        const interval = setInterval(() => {
          setAnimatingTextArray(prev => {
            const next = [...prev];
            next[index] = tip.action.slice(0, i + 1);
            return next;
          });
          i++;
          if (i >= tip.action.length) {
             clearInterval(interval);
          }
        }, 25);
      });
      
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isTargetSet) {
      fetchTips();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appliances, monthlyBill, habitScore, localRate, isTargetSet]);

  return (
    <div className="bg-surface border border-border rounded-lg p-md mb-xl shadow-sm">
      <div className="flex items-center justify-between mb-md">
        <div className="flex items-center gap-sm">
          <Sparkles className="text-primary" size={18} />
          <h3 className="text-h3 font-medium">AI suggestions</h3>
        </div>
        <button 
          onClick={() => fetchTips(true)}
          disabled={loading}
          className="p-1.5 rounded-full hover:bg-border/50 text-text-muted transition-colors disabled:opacity-50 touch-target flex items-center justify-center"
        >
          <RotateCw size={16} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="space-y-sm">
        {!isTargetSet ? (
          <div className="flex flex-col items-center justify-center py-xl text-center border border-dashed border-border rounded-lg bg-card/30">
            <Target className="text-text-muted mb-3 opacity-40" size={32} />
            <p className="text-small text-text-muted mb-4 max-w-[200px]">
              Set your monthly target to unlock AI energy-saving recommendations.
            </p>
            <button 
              onClick={onSetTarget}
              className="px-4 py-2 bg-primary text-white text-small font-bold rounded-lg hover:bg-primary-dark transition-colors"
            >
              Set Target Now
            </button>
          </div>
        ) : loading ? (
          <>
            {[1, 2, 3].map(i => (
              <div key={i} className="h-[80px] rounded border border-border bg-card animate-pulse flex flex-col justify-center p-md">
                 <div className="h-3 w-16 bg-border/50 rounded mb-2" />
                 <div className="h-3 w-full bg-border/50 rounded" />
              </div>
            ))}
          </>
        ) : (
          tips.map((tip, idx) => {
            const colors = CATEGORY_COLORS[tip.category] || CATEGORY_COLORS.habit;
            return (
              <div key={idx} className={`border border-border bg-card rounded p-md flex flex-col items-start gap-1.5 border-l-4 ${colors.border}`}>
                <div className="flex w-full items-start justify-between">
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${colors.bg} ${colors.text}`}>
                    {tip.appliance}
                  </span>
                  <span className="text-[10px] font-medium text-white bg-green-500 px-2 py-0.5 rounded-full">
                    Save ₹{tip.savingRupees}/mo
                  </span>
                </div>
                <p className="text-[14px] text-text-primary min-h-[42px] mt-1 break-words">{animatingTextArray[idx]}</p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

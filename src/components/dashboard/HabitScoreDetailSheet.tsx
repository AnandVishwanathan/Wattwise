import { BottomSheet } from '../ui/Sheet';
import { Button } from '../ui/Button';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import type { HabitScoreResult } from '../../lib/ml/habitScore';

interface HabitScoreDetailSheetProps {
  isOpen: boolean;
  onClose: () => void;
  result: HabitScoreResult;
  onSetNewTarget: () => void;
}

export function HabitScoreDetailSheet({ isOpen, onClose, result, onSetNewTarget }: HabitScoreDetailSheetProps) {
  
  let interpretation = "Needs attention — usage is significantly above target.";
  if (result.score >= 90) interpretation = "Excellent — you are well within your energy target.";
  else if (result.score >= 70) interpretation = "Good — minor adjustments will bring you to your goal.";
  else if (result.score >= 50) interpretation = "Fair — consider reducing usage of your top appliances.";

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Habit Score Details">
      <div className="mb-md text-center">
        <h2 className="text-[48px] font-bold text-primary tabular-nums leading-none tracking-tight">{result.score}</h2>
        <p className="text-text-muted font-medium">/ 100</p>
      </div>
      
      <div className="bg-surface rounded-lg p-md mb-lg border border-border">
        <p className="text-text-primary text-small">{interpretation}</p>
      </div>

      <h3 className="text-small font-medium text-text-muted mb-md">Weekly Breakdown</h3>
      <div className="h-[150px] w-full mb-lg">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={result.weeklyScores}>
            <XAxis dataKey="week" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
            <Tooltip 
              cursor={{ fill: 'rgba(0,0,0,0.05)' }} 
              content={({ active, payload }: any) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-card border border-border px-3 py-1.5 rounded-md shadow-sm">
                      <p className="font-bold text-primary">{payload[0].value} <span className="font-normal text-text-muted text-small">pts</span></p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="score" fill="#9333EA" radius={[4, 4, 0, 0]} maxBarSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <Button variant="outline" fullWidth onClick={() => { onClose(); onSetNewTarget(); }}>
        Set new target
      </Button>
    </BottomSheet>
  );
}

import { useAuth } from '../contexts/AuthContext';
import { useStreak } from '../hooks/useStreak';
import { BadgeGrid } from '../components/goals/BadgeGrid';
import { Card } from '../components/ui/Card';
import { Trophy, Flame, Coins, Info } from 'lucide-react';

export default function Goals() {
  const { user } = useAuth();
  const { streakResult, badges, loading } = useStreak(user?.uid);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="pb-3xl p-md max-w-4xl mx-auto">
      <header className="mb-xl">
        <h1 className="text-h1 flex items-center gap-2">
          <Trophy className="text-amber" size={28} />
          Achievements & Goals
        </h1>
        <p className="text-text-muted text-small">Track your consistency and unlock rewards.</p>
      </header>

      {/* Streak Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-md mb-xl">
        <Card className="p-md bg-gradient-to-br from-amber/10 to-transparent border-white/5">
          <div className="flex items-center gap-3 mb-2">
            <Flame className="text-amber" size={24} />
            <span className="text-text-3 uppercase tracking-widest font-bold text-[9px]">Current Streak</span>
          </div>
          <div className="text-3xl font-bold text-text-1">{streakResult.currentStreak} Days</div>
          <p className="text-[10px] text-text-3 mt-1 italic">Keep logging daily to grow!</p>
        </Card>

        <Card className="p-md bg-gradient-to-br from-accent/10 to-transparent border-white/5">
          <div className="flex items-center gap-3 mb-2">
            <Coins className="text-accent" size={24} />
            <span className="text-text-3 uppercase tracking-widest font-bold text-[9px]">Green Credits</span>
          </div>
          <div className="text-3xl font-bold text-text-1">{streakResult.greenCredits}</div>
          <p className="text-[10px] text-text-3 mt-1 italic">Redeemable for rewards.</p>
        </Card>

        <Card className="p-md bg-gradient-to-br from-primary/10 to-transparent border-white/5">
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="text-primary" size={24} />
            <span className="text-text-3 uppercase tracking-widest font-bold text-[9px]">Longest Streak</span>
          </div>
          <div className="text-3xl font-bold text-text-1">{streakResult.longestStreak} Days</div>
          <p className="text-[10px] text-text-3 mt-1 italic">Your all-time best record.</p>
        </Card>
      </div>

      <section>
        <div className="flex items-center justify-between mb-lg">
          <h2 className="text-h2">Badges</h2>
          <div className="flex items-center gap-1.5 text-text-3">
            <Info size={14} />
            <span className="text-[10px] uppercase font-mono tracking-tighter">Unlocked {badges.filter(b => b.earnedAt).length}/{badges.length}</span>
          </div>
        </div>
        <BadgeGrid badges={badges} />
      </section>
    </div>
  );
}

import type { Badge } from '../../types';

interface BadgeGridProps {
  badges: Badge[];
}

export function BadgeGrid({ badges }: BadgeGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-[16px]">
      {badges.map((badge) => {
        const isEarned = badge.earnedAt !== null;
        
        return (
          <div
            key={badge.id}
            className={`
              w-full flex flex-col items-center text-center p-[20px] px-[16px] rounded-[10px] bg-[var(--bg-card)] border transition-all duration-200
              ${isEarned 
                ? 'border-[var(--accent-border)] shadow-[0_0_16px_rgba(0,214,143,0.10)] hover:-translate-y-[3px]' 
                : 'border-[var(--border)]'}
            `}
          >
            <div className={`text-[28px] ${!isEarned ? 'opacity-20 grayscale' : ''}`}>
              {badge.icon}
            </div>
            
            <h4 className={`mt-[8px] text-[14px] ${isEarned ? 'font-semibold text-[var(--text-1)]' : 'font-medium text-[var(--text-2)]'}`}>
              {badge.name}
            </h4>
            
            {isEarned ? (
              <p className="mt-[4px] font-body text-[11px] text-[var(--text-2)]">
                Earned {new Date(badge.earnedAt!).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </p>
            ) : (
              <p className="mt-[4px] font-body text-[11px] text-[var(--text-3)]">
                {badge.condition}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

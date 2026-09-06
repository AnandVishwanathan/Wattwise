import { useEffect, useState, useRef } from 'react';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

// Easing function
const easeOutExpo = (x: number): number => {
  return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
};

interface StatCardProps {
  icon: React.ReactNode;
  iconColor: string;
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  trend?: number; // percentage (-10 to 10 etc.)
  trendGoodIfUp?: boolean;
  onClick?: () => void;
}

export function StatCard({
  icon,
  iconColor,
  label,
  value,
  prefix = '',
  suffix = '',
  decimals = 0,
  trend,
  trendGoodIfUp = false,
  onClick
}: StatCardProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const frameRef = useRef<number | null>(null);
  const startTime = useRef<number | null>(null);

  useEffect(() => {
    // Count up animation
    startTime.current = null;
    const duration = 800; // ms

    const animate = (timestamp: number) => {
      if (!startTime.current) startTime.current = timestamp;
      const progress = timestamp - startTime.current;
      const percent = Math.min(progress / duration, 1);
      
      const easedProgress = easeOutExpo(percent);
      setDisplayValue(easedProgress * value);

      if (progress < duration) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayValue(value);
      }
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [value]);

  const trendIsGood = trend !== undefined && (trend > 0 ? trendGoodIfUp : !trendGoodIfUp);
  const trendColor = trendIsGood ? 'text-primary' : 'text-danger';

  return (
    <motion.button 
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="bg-card border border-border rounded-lg p-md h-[88px] flex flex-col justify-between w-full text-left touch-target shadow-card relative overflow-hidden group hover:border-text-muted transition-colors"
    >
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-xs">
          <div className={cn("w-5 h-5 flex items-center justify-center rounded-sm", iconColor)}>
            {icon}
          </div>
          <span className="text-micro text-text-muted uppercase tracking-wider font-medium">{label}</span>
        </div>
        
        {trend !== undefined && (
          <span className={cn("text-[10px] font-medium px-1 rounded", trendColor, trendIsGood ? 'bg-primary-light' : 'bg-red-50')}>
            {trend > 0 ? '▲' : '▼'} {Math.abs(trend)}%
          </span>
        )}
      </div>

      <div className="text-h1 font-mono font-bold tabular-nums text-text-primary leading-none mt-1">
        {prefix}{displayValue.toFixed(decimals)}{suffix}
      </div>
    </motion.button>
  );
}

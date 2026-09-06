import { useState } from 'react';
import { motion } from 'framer-motion';
import type { PanInfo } from 'framer-motion';
import { Trash2, Edit2, Copy } from 'lucide-react';
import type { Appliance } from '../../types';
import { cn } from '../../lib/utils';
import { BottomSheet } from '../ui/Sheet';

interface ApplianceCardProps {
  appliance: Appliance;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
}

export function ApplianceCard({ appliance, onEdit, onDelete, onDuplicate }: ApplianceCardProps) {
  const [showActions, setShowActions] = useState(false);
  
  // Usage intensity color
  const monthlyKwh = (appliance.powerWatts * appliance.hoursPerDay * 30) / 1000;
  const intensityColor = monthlyKwh < 50 ? 'border-primary' : monthlyKwh > 150 ? 'border-danger' : 'border-warning';
  const monthlyCost = monthlyKwh * 6.5;

  let longPressTimer: ReturnType<typeof setTimeout>;

  const handleTouchStart = () => {
    longPressTimer = setTimeout(() => setShowActions(true), 500);
  };

  const handleTouchEnd = () => {
    clearTimeout(longPressTimer);
  };

  const handleDragEnd = (_e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x < -100) {
      onDelete(appliance.id);
    }
  };

  return (
    <>
      <div className="relative mb-sm max-w-full overflow-hidden touch-target h-[72px] rounded-lg">
        {/* Underlay for swipe-to-delete */}
        <div className="absolute inset-0 bg-danger flex items-center justify-end px-lg rounded-lg">
          <Trash2 className="text-white" />
        </div>
        
        <motion.div
          drag="x"
          dragConstraints={{ left: -100, right: 0 }}
          dragElastic={0.1}
          onDragEnd={handleDragEnd}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleTouchStart}
          onMouseUp={handleTouchEnd}
          onMouseLeave={handleTouchEnd}
          className="absolute inset-0 bg-card border border-border flex items-center p-md rounded-lg shadow-sm"
        >
          <div className={cn("w-10 h-10 rounded-full flex items-center justify-center text-[24px] border-2 flex-shrink-0", intensityColor)}>
            {appliance.icon}
          </div>
          
          <div className="ml-md flex-1 overflow-hidden">
            <h3 className="text-body font-medium truncate">{appliance.name}</h3>
            <span className="text-micro bg-surface px-2 py-0.5 rounded-full text-text-muted mt-1 inline-block">
              {appliance.room}
            </span>
          </div>
          
          <div className="text-right flex-shrink-0">
            <div className="text-[14px] font-mono font-medium tabular-nums">{monthlyKwh.toFixed(1)} kWh/mo</div>
            <div className="text-[12px] text-text-muted tabular-nums">₹{monthlyCost.toFixed(0)}/mo</div>
          </div>
        </motion.div>
      </div>

      <BottomSheet isOpen={showActions} onClose={() => setShowActions(false)} title="Appliance Actions">
        <div className="space-y-sm">
          <button 
            className="w-full flex items-center gap-md p-md rounded-lg hover:bg-surface touch-target"
            onClick={() => { setShowActions(false); onEdit(appliance.id); }}
          >
            <Edit2 className="text-primary" size={20} />
            <span className="text-body font-medium">Edit {appliance.name}</span>
          </button>
          
          <button 
            className="w-full flex items-center gap-md p-md rounded-lg hover:bg-surface touch-target"
            onClick={() => { setShowActions(false); onDuplicate(appliance.id); }}
          >
            <Copy className="text-primary" size={20} />
            <span className="text-body font-medium">Duplicate</span>
          </button>
          
          <button 
            className="w-full flex items-center gap-md p-md rounded-lg hover:bg-surface touch-target"
            onClick={() => { setShowActions(false); onDelete(appliance.id); }}
          >
            <Trash2 className="text-danger" size={20} />
            <span className="text-body font-medium text-danger">Delete</span>
          </button>
        </div>
      </BottomSheet>
    </>
  );
}

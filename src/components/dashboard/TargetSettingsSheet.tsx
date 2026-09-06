import { useState } from 'react';
import { BottomSheet } from '../ui/Sheet';
import { Button } from '../ui/Button';

interface TargetSettingsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (target: number) => void;
  initialTarget?: number;
}

export function TargetSettingsSheet({ isOpen, onClose, onSave, initialTarget }: TargetSettingsSheetProps) {
  const [target, setTarget] = useState(initialTarget || 150);

  const handleSave = () => {
    onSave(target);
    onClose();
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Set Monthly Target">
      <div className="space-y-lg">
        <p className="text-text-muted text-small text-center">
          Average Indian household uses 100–250 kWh/month
        </p>

        <div>
          <label className="text-small text-text-muted font-medium mb-sm block">Monthly target in kWh</label>
          <div className="flex items-center gap-md">
            <input 
              type="range" min="50" max="500" step="10"
              value={target} onChange={e => setTarget(Number(e.target.value))}
              className="flex-1 accent-primary"
            />
            <input 
              type="number" value={target} onChange={e => setTarget(Number(e.target.value))}
              className="w-20 touch-target rounded-md border border-border bg-surface px-sm text-center tabular-nums"
            />
          </div>
        </div>

        <Button fullWidth onClick={handleSave}>Save Target</Button>
      </div>
    </BottomSheet>
  );
}

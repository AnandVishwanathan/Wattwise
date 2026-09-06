import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PRESET_APPLIANCES, ROOMS } from '../../types';
import type { Appliance, PresetAppliance } from '../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { BottomSheet } from '../ui/Sheet';
import { Plus, Minus } from 'lucide-react';

interface ApplianceFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (appliance: Omit<Appliance, 'id' | 'createdAt' | 'userId'>) => void;
  initialData?: Appliance;
}

export function ApplianceForm({ isOpen, onClose, onSave, initialData }: ApplianceFormProps) {
  const [step, setStep] = useState(1);
  
  
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('⚡');
  const [watts, setWatts] = useState(100);
  const [hours, setHours] = useState(1);
  const [room, setRoom] = useState(ROOMS[0]);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setIcon(initialData.icon);
      setWatts(initialData.powerWatts);
      setHours(initialData.hoursPerDay);
      setRoom(initialData.room);
      setStep(initialData.name ? 2 : 1);
    } else {
      setStep(1);
      setName('');
      setIcon('⚡');
      setWatts(100);
      setHours(1);
      setRoom(ROOMS[0]);
    }
  }, [isOpen, initialData]);

  const handleSelectPreset = (preset: PresetAppliance) => {
    setName(preset.name);
    setIcon(preset.icon);
    setWatts(preset.defaultWatts);
    setStep(2);
  };

  const handleSave = () => {
    onSave({
      name,
      icon,
      powerWatts: watts,
      hoursPerDay: hours,
      room,
    });
    onClose();
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title={initialData ? "Edit Appliance" : "Add Appliance"}>
      <div className="flex justify-center mb-lg gap-2">
        {[1, 2, 3].map(i => (
          <div key={i} className={`h-2 rounded-full transition-all ${step >= i ? 'w-8 bg-primary' : 'w-2 bg-border'}`} />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
            <p className="text-text-muted mb-md">Select an appliance to start</p>
            <div className="grid grid-cols-4 gap-sm mb-lg">
              {PRESET_APPLIANCES.map(preset => (
                <button
                  key={preset.name}
                  onClick={() => handleSelectPreset(preset)}
                  className="touch-target flex flex-col items-center p-sm rounded-lg bg-surface border border-border hover:border-primary transition-colors"
                >
                  <span className="text-[28px] mb-1">{preset.icon}</span>
                  <span className="text-micro text-center leading-tight">{preset.name}</span>
                </button>
              ))}
            </div>
            <div className="text-center">
              <button 
                className="text-primary text-small font-medium touch-target px-md py-sm rounded-full hover:bg-primary-light"
                onClick={() => { setName('Custom'); setIcon('⚡'); setStep(2); }}
              >
                More options (Custom)
              </button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-lg">
            <Input label="Appliance Name" value={name} onChange={e => setName(e.target.value)} />
            
            <div>
              <label className="text-small text-text-muted font-medium mb-sm block">Power (Watts)</label>
              <div className="flex items-center gap-md">
                <input 
                  type="range" min="10" max="5000" step="10"
                  value={watts} onChange={e => setWatts(Number(e.target.value))}
                  className="flex-1 accent-primary"
                />
                <input 
                  type="number" value={watts} onChange={e => setWatts(Number(e.target.value))}
                  className="w-20 touch-target rounded-md border border-border bg-surface px-sm text-center tabular-nums"
                />
              </div>
              {watts > 3000 && <p className="text-micro text-warning mt-1">Is this correct? Most home appliances use under 3000W.</p>}
            </div>

            <div>
              <label className="text-small text-text-muted font-medium mb-sm block">Hours per day</label>
              <div className="flex items-center justify-between border border-border rounded-lg p-sm bg-surface">
                <button 
                  onClick={() => setHours(Math.max(0.5, hours - 0.5))}
                  className="touch-target rounded-full bg-card hover:bg-border/50 text-text-primary w-10 h-10 flex items-center justify-center border border-border"
                >
                  <Minus size={20} />
                </button>
                <div className="font-mono text-h3 tabular-nums">{hours} h</div>
                <button 
                  onClick={() => setHours(Math.min(24, hours + 0.5))}
                  className="touch-target rounded-full bg-card hover:bg-border/50 text-text-primary w-10 h-10 flex items-center justify-center border border-border"
                >
                  <Plus size={20} />
                </button>
              </div>
            </div>

            <div className="flex gap-md pt-sm">
              <Button variant="outline" fullWidth onClick={() => setStep(1)}>Back</Button>
              <Button fullWidth onClick={() => setStep(3)}>Next</Button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="step3" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-lg">
            <p className="text-small text-text-muted font-medium mb-sm">Which room is this in?</p>
            <div className="flex flex-wrap gap-sm">
              {ROOMS.map(r => (
                <button
                  key={r}
                  onClick={() => setRoom(r)}
                  className={`touch-target px-md py-sm rounded-full text-small font-medium transition-colors border ${
                    room === r ? 'bg-primary text-white border-primary' : 'bg-surface text-text-primary border-border hover:border-primary/50'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
            
            <div className="bg-primary-light p-md rounded-lg mt-xl">
              <p className="text-small font-medium text-primary-dark mb-1">Estimated Cost</p>
              <p className="text-h2 font-mono tabular-nums">₹{((watts * hours * 30 / 1000) * 6.5).toFixed(0)} <span className="text-small font-sans font-normal text-primary-dark">/ month</span></p>
            </div>

            <div className="flex gap-md pt-sm">
              <Button variant="outline" fullWidth onClick={() => setStep(2)}>Back</Button>
              <Button fullWidth onClick={handleSave}>Confirm</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </BottomSheet>
  );
}

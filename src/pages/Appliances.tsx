import { useState } from 'react';
import { Plus } from 'lucide-react';
import type { Appliance } from '../types';
import { ROOMS } from '../types';
import { ApplianceCard } from '../components/appliances/ApplianceCard';
import { ApplianceForm } from '../components/appliances/ApplianceForm';
import { Button } from '../components/ui/Button';

// Dummy data for initial UI
const initialAppliances: Appliance[] = [
  { id: '1', name: 'Air Conditioner', icon: '❄️', room: 'Bedroom', powerWatts: 1500, hoursPerDay: 8, createdAt: new Date().toISOString(), userId: '1' },
  { id: '2', name: 'Refrigerator', icon: '🧊', room: 'Kitchen', powerWatts: 150, hoursPerDay: 24, createdAt: new Date().toISOString(), userId: '1' },
];

export default function Appliances() {
  const [appliances, setAppliances] = useState<Appliance[]>(initialAppliances);
  const [activeRoom, setActiveRoom] = useState('All');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAppliance, setEditingAppliance] = useState<Appliance | undefined>(undefined);

  const filteredAppliances = activeRoom === 'All' 
    ? appliances 
    : appliances.filter(a => a.room === activeRoom);

  const handleEdit = (id: string) => {
    const app = appliances.find(a => a.id === id);
    if (app) {
      setEditingAppliance(app);
      setIsFormOpen(true);
    }
  };

  const handleDuplicate = (id: string) => {
    const app = appliances.find(a => a.id === id);
    if (app) {
      const newApp = { ...app, id: Date.now().toString(), name: `${app.name} (Copy)` };
      setAppliances(prev => [...prev, newApp]);
    }
  };

  const handleDelete = (id: string) => {
    setAppliances(prev => prev.filter(a => a.id !== id));
  };

  const handleSave = (applianceData: Omit<Appliance, 'id' | 'createdAt' | 'userId'>) => {
    if (editingAppliance) {
      setAppliances(prev => prev.map(a => a.id === editingAppliance.id ? { ...a, ...applianceData } : a));
    } else {
      const newApp: Appliance = {
        ...applianceData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        userId: '1'
      };
      setAppliances(prev => [...prev, newApp]);
    }
    setEditingAppliance(undefined);
  };

  const roomTabs = ['All', ...ROOMS];

  return (
    <div className="pb-3xl">
      <div className="sticky top-0 bg-surface/80 backdrop-blur-md z-10 p-md flex items-center justify-between border-b border-border">
        <h1 className="text-h1">Appliances</h1>
        <Button onClick={() => { setEditingAppliance(undefined); setIsFormOpen(true); }} className="w-10 h-10 p-0 rounded-full flex items-center justify-center shadow-card">
          <Plus size={24} />
        </Button>
      </div>

      <div className="px-md py-sm overflow-x-auto no-scrollbar whitespace-nowrap sticky top-[73px] bg-surface z-10 border-b border-border">
        {roomTabs.map(room => (
          <button
            key={room}
            onClick={() => setActiveRoom(room)}
            className={`inline-block mr-sm mb-1 px-4 py-2 rounded-full text-small font-medium transition-colors touch-target ${
              activeRoom === room ? 'bg-primary text-white' : 'bg-surface text-text-muted hover:text-text-primary'
            }`}
          >
            {room}
          </button>
        ))}
      </div>

      <div className="p-md">
        {filteredAppliances.length === 0 ? (
          <div className="text-center py-2xl">
            <div className="text-6xl mb-4">🏠</div>
            <h3 className="text-h3 mb-2">No appliances here</h3>
            <p className="text-text-muted mb-lg">Add your first appliance to start tracking.</p>
            <Button onClick={() => { setEditingAppliance(undefined); setIsFormOpen(true); }}>Add Appliance</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-md">
            {filteredAppliances.map(app => (
              <ApplianceCard 
                key={app.id} 
                appliance={app} 
                onEdit={handleEdit} 
                onDelete={handleDelete} 
                onDuplicate={handleDuplicate}
              />
            ))}
          </div>
        )}
      </div>

      <ApplianceForm 
        isOpen={isFormOpen} 
        onClose={() => { setIsFormOpen(false); setEditingAppliance(undefined); }}
        onSave={handleSave}
        initialData={editingAppliance}
      />
    </div>
  );
}

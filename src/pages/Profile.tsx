import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { generateMonthlyReport } from '../lib/pdfExport';
import { Download, User, Mail, Shield, Bell, LogOut, Check, X, Edit2 } from 'lucide-react';
import type { ReportData } from '../types';
import { useState } from 'react';
import { updateProfile } from 'firebase/auth';
import { auth } from '../lib/firebase';

export default function Profile() {
  const { user, signOut } = useAuth();
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(user?.displayName || '');

  const handleUpdateName = async () => {
    if (!newName.trim()) return;
    try {
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: newName });
        // The display name change might not immediately reflect in useAuth()'s user object
        // but it will after a refresh or context update.
      }
      setIsEditingName(false);
    } catch (e) {
      console.error("Error updating profile:", e);
    }
  };

  const handleDownloadReport = () => {
    // mock report data
    const reportData: ReportData = {
      userName: user?.displayName || 'WattWise User',
      month: 'March',
      totalKwh: 156.4,
      totalCost: 1016.6,
      targetKwh: 150,
      habitScore: 84,
      co2Kg: 58.4,
      topAppliances: [
        { name: 'AC Master', kWh: 72.0, cost: 468.0 },
        { name: 'Water Heater', kWh: 30.0, cost: 195.0 },
        { name: 'Fridge', kWh: 54.4, cost: 353.6 }
      ],
      streakDays: 14,
      greenCredits: 240,
      savingVsLastMonth: 12.5,
      tips: [
        { appliance: 'AC Master', action: 'Increase target temp by 1°C', savingRupees: 120, category: 'temperature' },
        { appliance: 'Water Heater', action: 'Set to eco-mode for 15 mins', savingRupees: 45, category: 'habit' }
      ]
    };
    
    generateMonthlyReport(reportData);
  };

  return (
    <div className="pb-3xl p-md max-w-2xl mx-auto">
      <header className="mb-xl text-center">
        <div className="w-24 h-24 bg-accent-muted rounded-full mx-auto flex items-center justify-center mb-md border border-accent-border relative group">
          <User size={48} className="text-accent" />
          <div className="absolute inset-0 bg-black/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
            <Edit2 size={24} className="text-white" />
          </div>
        </div>
        
        <div className="flex items-center justify-center gap-2 mb-sm">
          {isEditingName ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="bg-surface border border-accent text-h1 text-center py-1 rounded-md focus:outline-none"
                autoFocus
              />
              <button onClick={handleUpdateName} className="p-2 bg-accent text-black rounded-md hover:brightness-90">
                <Check size={20} />
              </button>
              <button onClick={() => setIsEditingName(false)} className="p-2 bg-surface border border-border text-text-muted rounded-md hover:text-text-1">
                <X size={20} />
              </button>
            </div>
          ) : (
            <>
              <h1 className="text-h1">{user?.displayName || 'User Profile'}</h1>
              <button 
                onClick={() => {
                  setNewName(user?.displayName || '');
                  setIsEditingName(true);
                }} 
                className="text-text-muted hover:text-accent p-1"
              >
                <Edit2 size={18} />
              </button>
            </>
          )}
        </div>
        <p className="text-text-muted text-small">{user?.email}</p>
      </header>

      <div className="space-y-lg">
        <Card className="p-md space-y-md border-white/5">
          <h3 className="text-text-1 font-semibold border-b border-border pb-sm">Account Settings</h3>
          
          <div className="flex items-center justify-between group">
            <div className="flex items-center gap-3">
              <Mail size={18} className="text-text-3 group-hover:text-accent transition-colors" />
              <div>
                <p className="text-xs text-text-3 uppercase tracking-wider font-mono">Email Address</p>
                <p className="text-small text-text-2">{user?.email}</p>
              </div>
            </div>
            <Button variant="ghost" className="text-tiny">Edit</Button>
          </div>

          <div className="flex items-center justify-between group">
            <div className="flex items-center gap-3">
              <Shield size={18} className="text-text-3 group-hover:text-amber transition-colors" />
              <div>
                <p className="text-xs text-text-3 uppercase tracking-wider font-mono">Password</p>
                <p className="text-small text-text-2">••••••••••••</p>
              </div>
            </div>
            <Button variant="ghost" className="text-tiny">Change</Button>
          </div>
        </Card>

        <Card className="p-md border-accent-border bg-accent/5">
          <h3 className="text-text-1 font-semibold flex items-center gap-2 mb-md">
            <Download size={18} className="text-accent" />
            Monthly Reports
          </h3>
          <p className="text-xs text-text-2 mb-lg leading-relaxed">
            Download your detailed energy consumption report for March 2024. Includes AI insights and carbon footprint analysis.
          </p>
          <Button fullWidth onClick={handleDownloadReport} className="gap-2">
            <Download size={16} />
            Download March 2024 Report (PDF)
          </Button>
        </Card>

        <Card className="p-md space-y-sm border-white/5">
          <h3 className="text-text-1 font-semibold border-b border-border pb-sm">Preferences</h3>
          <div className="flex items-center justify-between py-1">
            <span className="text-small text-text-2 flex items-center gap-2">
              <Bell size={16} className="text-text-3" />
              Email Notifications
            </span>
            <input type="checkbox" defaultChecked className="accent-accent" />
          </div>
        </Card>

        <Button 
          variant="outline" 
          fullWidth 
          onClick={signOut}
          className="mt-2xl border-red/20 text-red/70 hover:bg-red/5 hover:border-red/40"
        >
          <LogOut size={16} className="mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}

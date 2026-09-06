import { NavLink, Link } from 'react-router-dom';
import { Home, Plug, BarChart2, Target, User, Zap } from 'lucide-react';
import { cn } from '../../lib/utils';

import { ROUTES } from '../../lib/routes';

const NAV_ITEMS = [
  { path: ROUTES.DASHBOARD, label: 'Dashboard', icon: Home },
  { path: ROUTES.APPLIANCES, label: 'Appliances', icon: Plug },
  { path: ROUTES.ANALYTICS, label: 'Analytics', icon: BarChart2 },
  { path: ROUTES.GOALS, label: 'Goals', icon: Target },
  { path: ROUTES.PROFILE, label: 'Profile', icon: User },
];

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 h-[60px] bg-surface border-t border-border flex items-center justify-around px-2 z-30 md:hidden pb-safe">
      {NAV_ITEMS.map(({ path, label, icon: Icon }) => (
        <NavLink
          key={path}
          to={path}
          className={({ isActive }) => cn(
            "touch-target flex flex-col items-center justify-center w-full",
            isActive ? "text-primary font-medium" : "text-text-muted hover:text-text-primary"
          )}
        >
          <Icon size={24} className="mb-1" />
          <span className="text-[10px] sm:text-micro">{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

export function Sidebar() {
  return (
    <aside className="hidden md:flex flex-col w-[240px] h-screen fixed top-0 left-0 bg-surface border-r border-border py-lg z-30">
      <Link to={ROUTES.DASHBOARD} className="px-lg flex items-center gap-sm mb-2xl touch-target">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center rotate-3">
          <Zap size={20} className="text-white" />
        </div>
        <h1 className="text-h3 font-heading font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-dark">WattWise</h1>
      </Link>
      
      <nav className="flex-1 px-md flex flex-col gap-2">
        {NAV_ITEMS.map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) => cn(
              "flex items-center gap-md px-md py-sm rounded-lg transition-colors touch-target w-full",
              isActive ? "bg-primary-light text-primary font-medium" : "text-text-muted hover:bg-surface hover:text-text-primary"
            )}
          >
            <Icon size={20} />
            <span className="text-body relative top-[1px]">{label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

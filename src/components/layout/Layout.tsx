import { Outlet } from 'react-router-dom';
import { BottomNav, Sidebar } from './Navigation';

export function Layout() {
  return (
    <div className="min-h-screen bg-surface flex">
      {/* Desktop Sidebar */}
      <Sidebar />
      
      {/* Main Content Area */}
      <main className="flex-1 md:pl-[240px] pb-[60px] md:pb-0 relative max-w-[1200px] mx-auto w-full">
        {/* We use framer-motion page transitions in App config if needed, here just Outlet */}
        <Outlet />
      </main>

      {/* Mobile Bottom Nav */}
      <BottomNav />
    </div>
  );
}

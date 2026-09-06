import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ROUTES } from './lib/routes';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './lib/firebase';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import Appliances from './pages/Appliances';
import Analytics from './pages/Analytics';
import Goals from './pages/Goals';
import Profile from './pages/Profile';
import { Layout } from './components/layout/Layout';
import type { ReactNode } from 'react';

function ProtectedRoute({ children }: { children: ReactNode }) {
  const [user, loading] = useAuthState(auth);
  if (loading) return <FullScreenLoader />;
  if (!user) return <Navigate to={ROUTES.LOGIN} replace />;
  return children;
}

function FullScreenLoader() {
  return (
    <div style={{
      height: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: '#07090F'
    }}>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      <div style={{
        width: 32, height: 32, borderRadius: '50%',
        border: '2px solid rgba(0,214,143,0.15)',
        borderTopColor: '#00D68F',
        animation: 'spin 700ms linear infinite'
      }}/>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={ROUTES.HOME} element={<HomePage />} />
        <Route path={ROUTES.LOGIN} element={<AuthPage />} />
        <Route path="/signup" element={<AuthPage />} />
        
        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
          <Route path={ROUTES.APPLIANCES} element={<Appliances />} />
          <Route path={ROUTES.ANALYTICS} element={<Analytics />} />
          <Route path={ROUTES.GOALS} element={<Goals />} />
          <Route path={ROUTES.PROFILE} element={<Profile />} />
        </Route>
        
        <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
      </Routes>
    </BrowserRouter>
  );
}

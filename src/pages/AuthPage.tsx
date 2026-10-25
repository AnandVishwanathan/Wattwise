import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../lib/routes';
import { Eye, EyeOff, TrendingDown, Clock, Users, Lock, Loader2 } from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

export default function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'signin'|'signup'>('signin');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [targetKwh, setTargetKwh] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Calculates password strength (0-4)
  const calculateStrength = (pw: string) => {
    let score = 0;
    if (pw.length >= 8) score += 1;
    if (/\d/.test(pw)) score += 1;
    if (/[A-Z]/.test(pw)) score += 1;
    if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]+/.test(pw)) score += 1;
    return Math.min(score, 4);
  };
  const strength = calculateStrength(password);
  
  const getStrengthInfo = (s: number) => {
    if (s === 0) return { label: 'Too short', color: '#7C8FAC' };
    if (s === 1) return { label: 'Weak', color: '#F05252' };
    if (s === 2) return { label: 'Fair', color: '#F5A623' };
    if (s === 3) return { label: 'Good', color: '#F5A623' };
    return { label: 'Strong', color: '#00D68F' };
  };
  const strengthInfo = getStrengthInfo(strength);

  const handleFirebaseError = (err: any) => {
    console.error('Auth Error Details:', err);
    const code = err.code || '';
    if (code === 'auth/user-not-found') setErrorMsg('No account found with this email.');
    else if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') setErrorMsg('Incorrect password. Try again.');
    else if (code === 'auth/too-many-requests') setErrorMsg('Too many attempts. Wait a moment.');
    else if (code === 'auth/invalid-email') setErrorMsg('That email address is not valid.');
    else if (code === 'auth/email-already-in-use') setErrorMsg('Email is already registered. Please sign in.');
    else setErrorMsg(`Error: ${err.message || code || 'Something went wrong.'}`);
  };

  const onGoogleSubmit = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      navigate(ROUTES.DASHBOARD);
    } catch (e) {
      handleFirebaseError(e);
      setLoading(false);
    }
  };

  const onEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      if (mode === 'signin') {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        // Save initial profile if target provided
        if (targetKwh) {
          await setDoc(doc(db, 'users', userCredential.user.uid), {
            profile: { monthlyTarget: Number(targetKwh) }
          }, { merge: true });
        }
      }
      navigate(ROUTES.DASHBOARD);
    } catch (err) {
      handleFirebaseError(err);
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[var(--bg)] font-body text-[var(--text-2)] overflow-x-hidden">
      
      {/* Left Panel - Auth Form */}
      <div className="w-full lg:w-[45%] flex flex-col justify-center px-[24px] sm:px-[32px] lg:px-[48px] relative min-h-[100vh]">
        <div className="w-full max-w-[420px] mx-auto py-[40px]">
          
          {/* Logo */}
          <div className="flex items-center justify-center gap-[8px] cursor-pointer mb-[40px]" onClick={() => navigate(ROUTES.HOME)}>
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path d="M13 2L4 13h7l-2 7 9-11h-7l2-7z" fill="#00D68F" stroke="#00D68F" strokeWidth="1" strokeLinejoin="round"/>
            </svg>
            <span className="font-display text-[19px] font-bold">
              <span style={{ color: 'var(--text-1)' }}>Watt</span>
              <span style={{ color: 'var(--accent)' }}>Wise</span>
            </span>
          </div>

          {/* Form Entrance Animation Wrapper */}
          <div 
            key={mode} 
            style={{ animation: 'formEnter 220ms ease-out forwards' }}
          >
            {/* Tabs */}
            <div className="bg-[var(--bg-raised)] rounded-[8px] p-[4px] grid grid-cols-2 mb-[32px]">
              <div 
                className={`text-center font-display text-[14px] font-medium py-[10px] rounded-[6px] cursor-pointer transition-all duration-150 border ${mode === 'signin' ? 'bg-[var(--bg-hover)] text-[var(--text-1)] border-[var(--border-2)]' : 'bg-transparent text-[var(--text-2)] border-transparent'}`}
                onClick={() => { setMode('signin'); setErrorMsg(''); }}
              >
                Sign in
              </div>
              <div 
                className={`text-center font-display text-[14px] font-medium py-[10px] rounded-[6px] cursor-pointer transition-all duration-150 border ${mode === 'signup' ? 'bg-[var(--bg-hover)] text-[var(--text-1)] border-[var(--border-2)]' : 'bg-transparent text-[var(--text-2)] border-transparent'}`}
                onClick={() => { setMode('signup'); setErrorMsg(''); }}
              >
                Create account
              </div>
            </div>

            {/* Headers */}
            <div className="mb-[28px]">
              <h1 className="font-display text-[26px] font-bold text-[var(--text-1)]">
                {mode === 'signin' ? 'Welcome back' : 'Create your account'}
              </h1>
              <p className="font-body text-[14px] text-[var(--text-2)] mt-1">
                {mode === 'signin' ? 'Sign in to your WattWise dashboard' : 'Start tracking your energy usage in 5 minutes'}
              </p>
            </div>

            {/* Google Button */}
            <button 
              onClick={onGoogleSubmit}
              disabled={loading}
              className="w-full bg-[var(--bg-raised)] border border-[var(--border-2)] rounded-[6px] py-[12px] px-[20px] flex items-center justify-center gap-[10px] cursor-pointer hover:bg-[var(--bg-hover)] hover:border-gray-600 transition-colors duration-160 disabled:opacity-50"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.16v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.16C1.43 8.55 1 10.22 1 12s.43 3.45 1.16 4.93l3.68-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.16 7.07l3.68 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span className="font-display text-[15px] font-medium text-[var(--text-1)]">
                {mode === 'signin' ? 'Continue with Google' : 'Sign up with Google'}
              </span>
            </button>

            {/* Divider */}
            <div className="flex items-center my-[24px]">
              <div className="flex-1 h-[1px] bg-[var(--border)]" />
              <span className="font-body text-[12px] text-[var(--text-3)] px-[14px]">or sign in with email</span>
              <div className="flex-1 h-[1px] bg-[var(--border)]" />
            </div>

            {/* Email Form */}
            <form onSubmit={onEmailSubmit}>
              
              {mode === 'signup' && (
                <div className="mb-[18px]">
                  <label className="block font-body text-[13px] font-medium text-[var(--text-2)] mb-[6px]">Full name</label>
                  <input 
                    type="text" 
                    required 
                    value={fullName} onChange={e => setFullName(e.target.value)}
                    placeholder="Anand Kumar"
                    className="w-full bg-[var(--bg-raised)] border border-[var(--border)] rounded-[6px] py-[11px] px-[14px] font-body text-[16px] xl:text-[14px] text-[var(--text-1)] outline-none transition-colors duration-150 placeholder-[var(--text-3)] focus:border-[var(--accent-border)] focus:ring-[3px] focus:ring-[rgba(0,214,143,0.08)]"
                  />
                </div>
              )}

              <div className="mb-[18px]">
                <label className="block font-body text-[13px] font-medium text-[var(--text-2)] mb-[6px]">Email address</label>
                <input 
                  type="email" 
                  required 
                  value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-[var(--bg-raised)] border border-[var(--border)] rounded-[6px] py-[11px] px-[14px] font-body text-[16px] xl:text-[14px] text-[var(--text-1)] outline-none transition-colors duration-150 placeholder-[var(--text-3)] focus:border-[var(--accent-border)] focus:ring-[3px] focus:ring-[rgba(0,214,143,0.08)]"
                />
              </div>

              <div className={mode === 'signin' ? "mb-[8px]" : "mb-[18px]"}>
                <label className="block font-body text-[13px] font-medium text-[var(--text-2)] mb-[6px]">Password</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    required 
                    value={password} onChange={e => setPassword(e.target.value)}
                    placeholder={mode === 'signin' ? "Your password" : "Min. 8 characters"}
                    className="w-full bg-[var(--bg-raised)] border border-[var(--border)] rounded-[6px] py-[11px] pl-[14px] pr-[40px] font-body text-[16px] xl:text-[14px] text-[var(--text-1)] outline-none transition-colors duration-150 placeholder-[var(--text-3)] focus:border-[var(--accent-border)] focus:ring-[3px] focus:ring-[rgba(0,214,143,0.08)]"
                  />
                  <div 
                    className="absolute right-[12px] top-1/2 -translate-y-1/2 cursor-pointer text-[var(--text-3)] hover:text-[var(--text-2)] p-1 z-10"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </div>
                </div>

                {mode === 'signup' && password.length > 0 && (
                  <div className="mt-[6px] flex items-center justify-between">
                    <div className="flex gap-[4px] flex-1 mr-[12px]">
                      {[1, 2, 3, 4].map(idx => (
                        <div 
                          key={idx} 
                          className="flex-1 h-[3px] rounded-full transition-colors duration-300"
                          style={{ backgroundColor: strength >= idx ? strengthInfo.color : 'var(--bg-hover)' }}
                        />
                      ))}
                    </div>
                    <span className="font-body text-[11px]" style={{ color: strengthInfo.color }}>{strengthInfo.label}</span>
                  </div>
                )}
              </div>

              {mode === 'signin' && (
                <div className="flex justify-end mb-[18px]">
                  <a href="#" className="font-body text-[13px] text-[var(--accent)] hover:underline">Forgot password?</a>
                </div>
              )}

              {mode === 'signup' && (
                <div className="mb-[24px]">
                  <label className="block font-body text-[13px] font-medium text-[var(--text-2)] mb-[6px]">Monthly kWh target (optional)</label>
                  <input 
                    type="number" 
                    value={targetKwh} onChange={e => setTargetKwh(e.target.value)}
                    placeholder="e.g. 150 — leave blank to skip"
                    className="w-full bg-[var(--bg-raised)] border border-[var(--border)] rounded-[6px] py-[11px] px-[14px] font-body text-[16px] xl:text-[14px] text-[var(--text-1)] outline-none transition-colors duration-150 placeholder-[var(--text-3)] focus:border-[var(--accent-border)] focus:ring-[3px] focus:ring-[rgba(0,214,143,0.08)] tabular-nums"
                  />
                  <p className="font-body text-[12px] text-[var(--text-3)] mt-[5px]">Average Indian household uses 100–250 kWh/month</p>
                </div>
              )}

              {errorMsg && (
                <div className="mb-[16px] bg-[rgba(240,82,82,0.08)] border border-[rgba(240,82,82,0.25)] rounded-[6px] px-[14px] py-[10px] text-[#F87171] font-body text-[13px]">
                  {errorMsg}
                </div>
              )}

              <button 
                type="submit"
                disabled={loading || (mode === 'signup' && password.length < 8)}
                className="w-full bg-[var(--accent)] text-[#07090F] font-display text-[15px] font-semibold py-[13px] rounded-[6px] hover:brightness-90 transition-all duration-180 disabled:opacity-70 disabled:filter-none flex justify-center items-center gap-[8px]"
              >
                {loading && <Loader2 size={16} className="animate-spin" />}
                {loading ? 'Signing in...' : (mode === 'signin' ? 'Sign in →' : 'Create account →')}
              </button>

              <div className="mt-[24px] text-center font-body text-[14px] text-[var(--text-2)]">
                {mode === 'signin' ? "Don't have an account? " : "Already have an account? "}
                <span 
                  className="text-[var(--accent)] cursor-pointer hover:underline"
                  onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
                >
                  {mode === 'signin' ? 'Create one' : 'Sign in'}
                </span>
              </div>

            </form>
          </div>
        </div>
      </div>

      {/* Right Panel - Visual */}
      <div className="hidden lg:flex w-[55%] bg-[var(--bg-card)] border-l border-[var(--border)] flex-col justify-center px-[48px] xl:px-[80px] py-[56px] sticky top-0 h-screen">
        
        <div className="max-w-[500px] w-full mx-auto">
          {/* Quote */}
          <div className="mb-[48px]">
            <div className="border-l-[3px] border-[var(--accent)] pl-[20px]">
              <p className="font-display text-[22px] font-semibold text-[var(--text-1)] leading-[1.4]">
                "I used to argue with my family about who left the AC on.
                Now I just open WattWise and show them the data."
              </p>
            </div>
            <p className="font-body text-[14px] text-[var(--text-2)] mt-[12px] pl-[23px]">
              — Meena R., Tirupur
            </p>
          </div>

          {/* Mini Stats */}
          <div className="flex flex-col gap-[16px]">
            {[
              { icon: <TrendingDown size={20} className="text-[var(--accent)]" />, val: '₹800', lbl: 'average monthly saving' },
              { icon: <Clock size={20} className="text-[var(--accent)]" />, val: '5 min', lbl: 'average setup time' },
              { icon: <Users size={20} className="text-[var(--accent)]" />, val: '2,400+', lbl: 'households using WattWise' },
            ].map((stat, i) => (
              <div key={i} className="bg-[var(--bg-raised)] border border-[var(--border)] rounded-[8px] p-[16px] px-[20px] flex items-center gap-[16px]">
                {stat.icon}
                <div>
                  <div className="font-mono text-[20px] font-medium text-[var(--text-1)] tabular-nums leading-none tracking-tight">{stat.val}</div>
                  <div className="font-body text-[13px] text-[var(--text-2)] mt-[4px]">{stat.lbl}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-[40px] flex items-start gap-[10px]">
            <Lock size={14} className="text-[var(--text-3)] shrink-0 mt-[4px]" />
            <p className="font-body text-[13px] text-[var(--text-3)] leading-[1.6]">
              Your data is stored securely. We never sell your information
              or share it with electricity providers.
            </p>
          </div>
        </div>

      </div>

      {/* Embedded Styles */}
      <style>{`
        @keyframes formEnter {
          from { opacity: 0; transform: translateX(-8px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}

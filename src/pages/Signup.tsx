import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ROUTES } from '../lib/routes';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { motion, AnimatePresence } from 'framer-motion';

export default function Signup() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleNextName = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return setError('Name is required');
    setError(''); setStep(2);
  };

  const handleNextEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return setError('Email is required');
    setError(''); setStep(3);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || password.length < 6) return setError('Password must be at least 6 chars');
    setError('');
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        name,
        email,
        electricityRate: 6.5,
        targetBudget: 1000,
        createdAt: new Date().toISOString()
      });
      navigate(ROUTES.HOME);
    } catch (err: any) {
      setError(err.message || 'Failed to sign up');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface p-md">
      <div className="w-full max-w-[400px]">
        <div className="mb-2xl text-center">
          <h1 className="text-h1 mb-sm">Create Account</h1>
          <p className="text-text-muted">Start tracking your energy</p>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.form key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} onSubmit={handleNextName} className="space-y-lg">
              <Input autoFocus type="text" label="Full Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Akshay Kumar" error={error} />
              <Button type="submit" fullWidth>Continue</Button>
            </motion.form>
          )}
          {step === 2 && (
            <motion.form key="step2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} onSubmit={handleNextEmail} className="space-y-lg">
              <Input autoFocus type="email" label="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" error={error} />
              <div className="flex gap-sm">
                <Button type="button" variant="ghost" onClick={() => setStep(1)}>Back</Button>
                <Button type="submit" fullWidth>Continue</Button>
              </div>
            </motion.form>
          )}
          {step === 3 && (
            <motion.form key="step3" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} onSubmit={handleSignup} className="space-y-lg">
              <Input autoFocus type="password" label="Create Password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" error={error} />
              <div className="flex gap-sm">
                <Button type="button" variant="ghost" onClick={() => setStep(2)}>Back</Button>
                <Button type="submit" fullWidth disabled={isLoading}>{isLoading ? 'Creating...' : 'Sign Up'}</Button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
        
        <div className="mt-xl text-center">
          <p className="text-text-muted text-small">
            Already have an account? <Link to="/login" className="text-primary font-medium hover:underline">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

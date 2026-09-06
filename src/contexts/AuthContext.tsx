import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth } from '../lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Attempt Firebase auth, but fallback to mock user for UI demonstration
    // since we don't have valid Firebase credentials yet
    try {
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
        setLoading(false);
      }, (error) => {
        console.warn('Firebase auth failed, using mock user', error);
        setUser({ uid: 'mock-user', email: 'user@example.com' } as any);
        setLoading(false);
      });
      
      // Fallback timeout in case onAuthStateChanged never fires
      const timer = setTimeout(() => {
        if (loading) {
          setUser({ uid: 'mock-user', email: 'user@example.com' } as any);
          setLoading(false);
        }
      }, 1000);

      return () => {
        unsubscribe();
        clearTimeout(timer);
      };
    } catch (err) {
      console.warn('Firebase init failed, using mock user', err);
      setUser({ uid: 'mock-user', email: 'user@example.com' } as any);
      setLoading(false);
    }
  }, [loading]);

  const signOut = () => firebaseSignOut(auth);

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

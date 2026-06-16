import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { User } from 'firebase/auth';
import { onAuthStateChange, logOut } from '../services/auth';
import { saveSession, clearSession, getSavedUid, saveSkipped, getSkipped, clearAllLocalData } from '../services/session';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  skipped: boolean;
  setSkipped: (value: boolean) => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  skipped: false,
  setSkipped: () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [skipped, setSkippedState] = useState(false);
  const initRef = useRef(false);

  useEffect(() => {
    (async () => {
      const wasSkipped = await getSkipped();
      setSkippedState(wasSkipped);
      const savedUid = await getSavedUid();
      if (savedUid && !wasSkipped) {
        setLoading(true);
      } else if (!savedUid && !wasSkipped) {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    let firebaseRestored = false;
    const timer = setTimeout(() => {
      if (!firebaseRestored) {
        setLoading(false);
      }
    }, 4000);

    const unsubscribe = onAuthStateChange((firebaseUser) => {
      firebaseRestored = true;
      clearTimeout(timer);
      setUser(firebaseUser);
      if (firebaseUser) {
        saveSession(firebaseUser.uid, firebaseUser.email, firebaseUser.displayName);
        saveSkipped(false);
        setSkippedState(false);
      }
      setLoading(false);
    });

    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, []);

  const setSkipped = (value: boolean) => {
    setSkippedState(value);
    saveSkipped(value);
  };

  const signOut = async () => {
    try {
      await logOut();
      await clearSession();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, skipped, setSkipped, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

import React, { createContext, useMemo, useState, useEffect, useContext } from 'react';
import { useAuth } from '../context/AuthContext';

interface ColorModeContextType {
  mode: 'light' | 'dark'; // resolved mode
  userPref: 'light' | 'dark' | 'system'; // user's preference
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  toggleColorMode: () => void;
}

export const ColorModeContext = createContext<ColorModeContextType>({
  mode: 'light',
  userPref: 'system',
  setTheme: () => {},
  toggleColorMode: () => {},
});

export const useColorMode = () => useContext(ColorModeContext);

export const ColorModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, setTheme: setUserTheme } = useAuth();
  const getSystemTheme = () => window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  const [mode, setMode] = useState<'light' | 'dark'>(getSystemTheme());
  const [userPref, setUserPref] = useState<'light' | 'dark' | 'system'>('system');

  // Sync with user preference
  useEffect(() => {
    if (user && user.theme) {
      setUserPref(user.theme);
      if (user.theme === 'system') {
        setMode(getSystemTheme());
      } else {
        setMode(user.theme);
      }
    } else {
      setUserPref('system');
      setMode(getSystemTheme());
    }
  }, [user]);

  // Listen to system theme changes if userPref is 'system'
  useEffect(() => {
    if (userPref !== 'system') return;
    const listener = (e: MediaQueryListEvent) => setMode(e.matches ? 'dark' : 'light');
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    mql.addEventListener('change', listener);
    return () => mql.removeEventListener('change', listener);
  }, [userPref]);

  const setTheme = (theme: 'light' | 'dark' | 'system') => {
    setUserPref(theme);
    if (theme === 'system') {
      setMode(getSystemTheme());
    } else {
      setMode(theme);
    }
    if (user && setUserTheme) {
      setUserTheme(theme);
    }
  };

  const toggleColorMode = () => {
    if (userPref === 'system') {
      setTheme('dark');
    } else if (mode === 'dark') {
      setTheme('light');
    } else {
      setTheme('dark');
    }
  };

  const colorMode = useMemo<ColorModeContextType>(() => ({
    mode,
    userPref,
    setTheme,
    toggleColorMode,
  }), [mode, userPref]);

  return (
    <ColorModeContext.Provider value={colorMode}>
      {children}
    </ColorModeContext.Provider>
  );
}; 
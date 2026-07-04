import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { applyTheme, readStoredTheme, storeTheme, subscribeColorScheme, type ThemeMode } from '../hooks/useTheme';

interface ThemeContextValue {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [mode, setModeState] = useState<ThemeMode>(() => readStoredTheme());

  useEffect(() => {
    applyTheme(mode);
    storeTheme(mode);
  }, [mode]);

  useEffect(() => {
    if (mode !== 'system') {
      return;
    }

    return subscribeColorScheme(() => applyTheme('system'));
  }, [mode]);

  const setMode = (nextMode: ThemeMode) => {
    setModeState(nextMode);
  };

  return <ThemeContext.Provider value={{ mode, setMode }}>{children}</ThemeContext.Provider>;
}

export function useThemeContext() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within ThemeProvider');
  }
  return context;
}

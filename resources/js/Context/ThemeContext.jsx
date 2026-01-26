import React, { createContext, useContext, useState, useEffect } from 'react';
import { THEME_MODES } from '../Utils/constants';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [mode, setMode] = useState(() => {
    const stored = localStorage.getItem('ched_theme_mode');
    return stored || THEME_MODES.LIGHT;
  });

  useEffect(() => {
    localStorage.setItem('ched_theme_mode', mode);
    
    // Apply mode to document
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(mode);
  }, [mode]);

  const toggleMode = () => {
    setMode((prev) => prev === THEME_MODES.LIGHT ? THEME_MODES.DARK : THEME_MODES.LIGHT);
  };

  return (
    <ThemeContext.Provider
      value={{
        mode,
        toggleMode,
        isDark: mode === THEME_MODES.DARK
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

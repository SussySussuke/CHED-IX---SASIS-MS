import React, { createContext, useContext, useState, useEffect } from 'react';
import { THEME_MODES } from '../Utils/constants';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [mode, setMode] = useState(() => {
    const stored = localStorage.getItem('ched_theme_mode');
    const initialMode = stored || THEME_MODES.LIGHT;
    
    // Apply immediately on initialization to prevent flash
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(initialMode);
    
    return initialMode;
  });

  useEffect(() => {
    localStorage.setItem('ched_theme_mode', mode);
    
    // Apply mode to document for Tailwind and CSS variables
    // The .light and .dark classes trigger CSS variable changes in theme.css
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

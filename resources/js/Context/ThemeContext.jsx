import React, { createContext, useContext, useState, useEffect } from 'react';
import { THEME_MODES } from '../Utils/constants';

const ThemeContext = createContext();

const DEFAULT_THEME = {
  mode: THEME_MODES.LIGHT,
  colors: {
    primary: '#1e40af',
    secondary: '#64748b',
    success: '#16a34a',
    warning: '#f59e0b',
    danger: '#dc2626',
    info: '#0891b2'
  }
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem('ched_theme');
    return stored ? JSON.parse(stored) : DEFAULT_THEME;
  });

  useEffect(() => {
    localStorage.setItem('ched_theme', JSON.stringify(theme));
    applyTheme(theme);
  }, [theme]);

  const applyTheme = (currentTheme) => {
    const root = document.documentElement;

    // Apply mode
    root.classList.remove('light', 'dark');
    root.classList.add(currentTheme.mode);

    // Apply color variables
    Object.entries(currentTheme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });
  };

  const toggleMode = () => {
    setTheme((prev) => ({
      ...prev,
      mode: prev.mode === THEME_MODES.LIGHT ? THEME_MODES.DARK : THEME_MODES.LIGHT
    }));
  };

  const updateColors = (colors) => {
    setTheme((prev) => ({
      ...prev,
      colors: { ...prev.colors, ...colors }
    }));
  };

  const resetTheme = () => {
    setTheme(DEFAULT_THEME);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleMode,
        updateColors,
        resetTheme,
        isDark: theme.mode === THEME_MODES.DARK
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

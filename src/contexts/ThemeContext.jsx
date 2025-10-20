import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(undefined);

export function ThemeProvider({ children }) {
  // Initialize with dark mode by default, then check localStorage
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('csit-quiz-theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    // Default to dark mode
    return true;
  });

  useEffect(() => {
    // Apply theme on mount
    applyTheme(isDarkMode);
  }, []);

  useEffect(() => {
    // Apply theme whenever it changes
    applyTheme(isDarkMode);
  }, [isDarkMode]);

  const applyTheme = (isDark) => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    applyTheme(newDarkMode);
    localStorage.setItem('csit-quiz-theme', newDarkMode ? 'dark' : 'light');
  };

  const setTheme = (theme) => {
    const isDark = theme === 'dark';
    setIsDarkMode(isDark);
    applyTheme(isDark);
    localStorage.setItem('csit-quiz-theme', theme);
  };

  return (
    <ThemeContext.Provider value={{ 
      isDarkMode, 
      toggleDarkMode, 
      setTheme 
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
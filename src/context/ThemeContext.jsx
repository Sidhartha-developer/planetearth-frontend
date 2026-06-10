import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('water');

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'solar') {
      root.classList.add('solar-theme');
    } else {
      root.classList.remove('solar-theme');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'water' ? 'solar' : 'water');
  };

  const isWater = theme === 'water';
  const isSolar = theme === 'solar';

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isWater, isSolar }}>
      {children}
    </ThemeContext.Provider>
  );
};

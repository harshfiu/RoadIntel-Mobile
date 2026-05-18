import { createContext, useContext, useState } from 'react';
import { THEMES, URGENCY } from '../constants/theme';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(true);
  const theme = isDark ? THEMES.dark : THEMES.light;
  const urgencyStyle = isDark ? URGENCY.dark : URGENCY.light;
  const toggleTheme = () => setIsDark(v => !v);

  return (
    <ThemeContext.Provider value={{ theme, isDark, urgencyStyle, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

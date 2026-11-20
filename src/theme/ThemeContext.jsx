import { createContext, useContext, useLayoutEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage.js';

const ThemeContext = createContext(null);
const isTheme = (value) => value === 'light' || value === 'dark';

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useLocalStorage('todo-app:theme', document.documentElement.dataset.theme, isTheme);
  useLayoutEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);
  const toggleTheme = () => setTheme((current) => current === 'dark' ? 'light' : 'dark');
  return <ThemeContext value={{ theme, toggleTheme }}>{children}</ThemeContext>;
}

export const useTheme = () => useContext(ThemeContext);

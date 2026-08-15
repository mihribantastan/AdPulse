import { useState } from 'react';

const STORAGE_KEY = 'adpulse_theme';

export function useTheme() {
  const [isLight, setIsLight] = useState(() => document.documentElement.classList.contains('light'));

  const toggleTheme = () => {
    const next = !isLight;
    setIsLight(next);
    document.documentElement.classList.toggle('light', next);
    localStorage.setItem(STORAGE_KEY, next ? 'light' : 'dark');
  };

  return { isLight, toggleTheme };
}

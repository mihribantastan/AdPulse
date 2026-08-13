import { useEffect, useState } from 'react';

// Topbar tema değiştiricisi <html> öğesine "dark" class'ını doğrudan DOM üzerinden
// ekleyip çıkarıyor (React state'e yansıtmadan) - grafik renkleri için bunu izlememiz gerekiyor.
export function useIsDarkMode(): boolean {
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  return isDark;
}

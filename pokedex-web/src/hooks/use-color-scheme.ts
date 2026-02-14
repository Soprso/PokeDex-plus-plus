import { useEffect, useState } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

/**
 * To support static rendering, this value needs to be re-calculated on the client side for web
 */
export function useColorScheme() {
  const [hasHydrated, setHasHydrated] = useState(false);
  const [localTheme, setLocalTheme] = useState<'light' | 'dark' | null>(null);

  useEffect(() => {
    setHasHydrated(true);
    // Check localStorage on mount
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('pokedex-settings');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (typeof parsed.darkMode === 'boolean') {
            setLocalTheme(parsed.darkMode ? 'dark' : 'light');
          }
        }
      } catch (e) {
        console.error('Failed to parse settings in useColorScheme:', e);
      }
    }

    // Listen for storage changes (optional but good for multi-tab sync)
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'pokedex-settings') {
        try {
          const parsed = JSON.parse(e.newValue || '{}');
          if (typeof parsed.darkMode === 'boolean') {
            setLocalTheme(parsed.darkMode ? 'dark' : 'light');
          }
        } catch (err) { /* ignore */ }
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const systemColorScheme = useRNColorScheme();

  if (!hasHydrated) {
    return 'light';
  }

  // Prioritize local setting if found
  return localTheme ?? systemColorScheme ?? 'light';
}

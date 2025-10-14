"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemeName, getTheme, Theme } from '@/lib/themes';
import { isGuestUser } from '@/lib/guest';

interface ThemeContextType {
  currentTheme: ThemeName;
  theme: Theme;
  setTheme: (theme: ThemeName) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'userTheme';
const GUEST_THEME_STORAGE_KEY = 'guestTheme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState<ThemeName>('default');
  const [isClient, setIsClient] = useState(false);

  // Load theme on mount
  useEffect(() => {
    setIsClient(true);

    if (typeof window !== 'undefined') {
      const isGuest = isGuestUser();
      const storageKey = isGuest ? GUEST_THEME_STORAGE_KEY : THEME_STORAGE_KEY;
      const savedTheme = localStorage.getItem(storageKey) as ThemeName;

      if (savedTheme && ['default', 'dark', 'vintage', 'baby-pink'].includes(savedTheme)) {
        setCurrentTheme(savedTheme);
      }
    }
  }, []);

  // Apply theme CSS variables whenever theme changes
  useEffect(() => {
    if (!isClient) return;

    const theme = getTheme(currentTheme);
    const root = document.documentElement;

    // Apply all theme colors as CSS variables
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--theme-${key}`, value);
    });

    // Also set data attribute for potential CSS targeting
    root.setAttribute('data-theme', currentTheme);
  }, [currentTheme, isClient]);

  const setTheme = (theme: ThemeName) => {
    setCurrentTheme(theme);

    if (typeof window !== 'undefined') {
      const isGuest = isGuestUser();
      const storageKey = isGuest ? GUEST_THEME_STORAGE_KEY : THEME_STORAGE_KEY;
      localStorage.setItem(storageKey, theme);
    }
  };

  const theme = getTheme(currentTheme);

  return (
    <ThemeContext.Provider value={{ currentTheme, theme, setTheme }}>
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

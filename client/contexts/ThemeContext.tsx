import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeMode, ThemePresets, getShadows } from '@/constants/theme';

type ColorTheme = typeof ThemePresets.dori.light;

interface ThemeContextType {
  themeMode: ThemeMode;
  isDark: boolean;
  theme: ColorTheme;
  shadows: ReturnType<typeof getShadows>;
  setThemeMode: (mode: ThemeMode) => void;
  toggleDarkMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@dori_theme_mode';
const DARK_MODE_STORAGE_KEY = '@dori_dark_mode';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeMode, setThemeModeState] = useState<ThemeMode>('dori');
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    loadThemePreferences();
  }, []);

  const loadThemePreferences = async () => {
    try {
      const [savedTheme, savedDarkMode] = await Promise.all([
        AsyncStorage.getItem(THEME_STORAGE_KEY),
        AsyncStorage.getItem(DARK_MODE_STORAGE_KEY),
      ]);
      if (savedTheme && (savedTheme === 'classic' || savedTheme === 'dori')) {
        setThemeModeState(savedTheme);
      }
      if (savedDarkMode !== null) {
        setIsDark(savedDarkMode === 'true');
      }
    } catch (error) {
      console.log('Error loading theme preferences:', error);
    }
  };

  const setThemeMode = async (mode: ThemeMode) => {
    setThemeModeState(mode);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch (error) {
      console.log('Error saving theme mode:', error);
    }
  };

  const toggleDarkMode = async () => {
    const newValue = !isDark;
    setIsDark(newValue);
    try {
      await AsyncStorage.setItem(DARK_MODE_STORAGE_KEY, String(newValue));
    } catch (error) {
      console.log('Error saving dark mode:', error);
    }
  };

  const themeColors = ThemePresets[themeMode];
  const theme = isDark ? themeColors.dark : themeColors.light;
  const shadows = getShadows(theme.primary);

  return (
    <ThemeContext.Provider
      value={{
        themeMode,
        isDark,
        theme,
        shadows,
        setThemeMode,
        toggleDarkMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
}

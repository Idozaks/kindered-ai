import { useThemeContext } from "@/contexts/ThemeContext";

export function useTheme() {
  const { theme, isDark, shadows, themeMode, setThemeMode, toggleDarkMode } = useThemeContext();

  return {
    theme,
    isDark,
    shadows,
    themeMode,
    setThemeMode,
    toggleDarkMode,
  };
}

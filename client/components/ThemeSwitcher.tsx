import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { ThemeMode, ThemeNames, BorderRadius, Spacing, Typography } from '@/constants/theme';

export function ThemeSwitcher() {
  const { theme, themeMode, setThemeMode, isDark, toggleDarkMode } = useTheme();

  const themes: ThemeMode[] = ['dori', 'classic'];

  return (
    <View style={styles.container}>
      <View style={styles.themesRow}>
        {themes.map((mode) => (
          <Pressable
            key={mode}
            style={[
              styles.themeOption,
              {
                backgroundColor: themeMode === mode ? theme.primary : theme.backgroundSecondary,
                borderColor: themeMode === mode ? theme.primary : theme.border,
              },
            ]}
            onPress={() => setThemeMode(mode)}
          >
            <Text
              style={[
                styles.themeText,
                {
                  color: themeMode === mode ? theme.buttonText : theme.text,
                },
              ]}
            >
              {ThemeNames[mode]}
            </Text>
          </Pressable>
        ))}
      </View>

      <Pressable
        style={[
          styles.darkModeToggle,
          { backgroundColor: theme.backgroundSecondary, borderColor: theme.border },
        ]}
        onPress={toggleDarkMode}
      >
        <Ionicons
          name={isDark ? 'moon' : 'sunny'}
          size={24}
          color={theme.primary}
        />
        <Text style={[styles.darkModeText, { color: theme.text }]}>
          {isDark ? 'מצב כהה' : 'מצב בהיר'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.md,
  },
  themesRow: {
    flexDirection: 'row-reverse',
    gap: Spacing.md,
  },
  themeOption: {
    flex: 1,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    alignItems: 'center',
  },
  themeText: {
    ...Typography.button,
  },
  darkModeToggle: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginTop: Spacing.sm,
  },
  darkModeText: {
    ...Typography.body,
    flex: 1,
    textAlign: 'right',
  },
});

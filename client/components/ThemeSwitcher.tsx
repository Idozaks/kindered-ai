import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { ThemeMode, ThemeNames, BorderRadius, Spacing, Typography } from '@/constants/theme';

export function ThemeSwitcher() {
  const { theme, themeMode, setThemeMode, isDark, toggleDarkMode } = useTheme();

  const themes: ThemeMode[] = ['dori', 'classic', 'sunset', 'nature', 'ocean'];

  return (
    <View style={styles.container}>
      <View style={styles.themesGrid}>
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
  themesGrid: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  themeOption: {
    minWidth: '30%',
    flexGrow: 1,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
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

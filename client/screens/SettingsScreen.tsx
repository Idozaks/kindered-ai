import React, { useState, useEffect } from "react";
import { StyleSheet, View, Switch, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useTranslation } from "react-i18next";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown } from "react-native-reanimated";

import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { GlassCard } from "@/components/GlassCard";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { storage, UserSettings } from "@/lib/storage";
import i18n from "@/lib/i18n";

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [settings, setSettings] = useState<UserSettings>({
    language: "en",
    highContrast: false,
    fontSize: "normal",
    narratorMode: false,
    privacyShield: true,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const loaded = await storage.getSettings();
    setSettings(loaded);
  };

  const updateSetting = async <K extends keyof UserSettings>(
    key: K,
    value: UserSettings[K]
  ) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    await storage.saveSettings({ [key]: value });

    if (key === "language") {
      i18n.changeLanguage(value as string);
      await storage.setLanguage(value as "en" | "he");
    }
  };

  const fontSizeOptions = [
    { value: "normal", label: "A", size: 18 },
    { value: "large", label: "A", size: 22 },
    { value: "xlarge", label: "A", size: 26 },
  ];

  return (
    <ThemedView style={styles.container}>
      <KeyboardAwareScrollViewCompat
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: headerHeight + Spacing.xl,
            paddingBottom: insets.bottom + Spacing.xl,
          },
        ]}
      >
        <Animated.View entering={FadeInDown.delay(100).duration(500)}>
          <GlassCard style={styles.section}>
            <ThemedText type="h4" style={styles.sectionTitle}>
              {t("settings.language")}
            </ThemedText>
            <View style={styles.languageRow}>
              <Pressable
                testID="lang-en"
                style={[
                  styles.languageButton,
                  {
                    backgroundColor:
                      settings.language === "en"
                        ? theme.primary
                        : theme.backgroundSecondary,
                    borderColor: theme.glassBorder,
                  },
                ]}
                onPress={() => updateSetting("language", "en")}
              >
                <ThemedText
                  style={[
                    styles.languageText,
                    {
                      color:
                        settings.language === "en" ? "#FFFFFF" : theme.text,
                    },
                  ]}
                >
                  English
                </ThemedText>
              </Pressable>
              <Pressable
                testID="lang-he"
                style={[
                  styles.languageButton,
                  {
                    backgroundColor:
                      settings.language === "he"
                        ? theme.primary
                        : theme.backgroundSecondary,
                    borderColor: theme.glassBorder,
                  },
                ]}
                onPress={() => updateSetting("language", "he")}
              >
                <ThemedText
                  style={[
                    styles.languageText,
                    {
                      color:
                        settings.language === "he" ? "#FFFFFF" : theme.text,
                    },
                  ]}
                >
                  עברית
                </ThemedText>
              </Pressable>
            </View>
          </GlassCard>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(500)}>
          <GlassCard style={styles.section}>
            <ThemedText type="h4" style={styles.sectionTitle}>
              {t("settings.fontSize")}
            </ThemedText>
            <View style={styles.fontSizeRow}>
              {fontSizeOptions.map((option) => (
                <Pressable
                  key={option.value}
                  testID={`font-${option.value}`}
                  style={[
                    styles.fontSizeButton,
                    {
                      backgroundColor:
                        settings.fontSize === option.value
                          ? theme.primary
                          : theme.backgroundSecondary,
                      borderColor: theme.glassBorder,
                    },
                  ]}
                  onPress={() =>
                    updateSetting("fontSize", option.value as UserSettings["fontSize"])
                  }
                >
                  <ThemedText
                    style={[
                      styles.fontSizeLabel,
                      {
                        fontSize: option.size,
                        color:
                          settings.fontSize === option.value
                            ? "#FFFFFF"
                            : theme.text,
                      },
                    ]}
                  >
                    {option.label}
                  </ThemedText>
                </Pressable>
              ))}
            </View>
          </GlassCard>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).duration(500)}>
          <GlassCard style={styles.section}>
            <SettingRow
              icon="eye"
              title={t("settings.highContrast")}
              value={settings.highContrast}
              onToggle={(value) => updateSetting("highContrast", value)}
            />
            <View style={[styles.divider, { backgroundColor: theme.glassBorder }]} />
            <SettingRow
              icon="volume-2"
              title={t("settings.narrator")}
              value={settings.narratorMode}
              onToggle={(value) => updateSetting("narratorMode", value)}
            />
            <View style={[styles.divider, { backgroundColor: theme.glassBorder }]} />
            <SettingRow
              icon="shield"
              title={t("settings.privacy")}
              description={t("settings.privacyDesc")}
              value={settings.privacyShield}
              onToggle={(value) => updateSetting("privacyShield", value)}
            />
          </GlassCard>
        </Animated.View>
      </KeyboardAwareScrollViewCompat>
    </ThemedView>
  );
}

interface SettingRowProps {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  description?: string;
  value: boolean;
  onToggle: (value: boolean) => void;
}

function SettingRow({ icon, title, description, value, onToggle }: SettingRowProps) {
  const { theme } = useTheme();

  return (
    <View style={styles.settingRow}>
      <View style={[styles.settingIcon, { backgroundColor: theme.glassOverlay }]}>
        <Feather name={icon} size={24} color={theme.primary} />
      </View>
      <View style={styles.settingText}>
        <ThemedText type="body" style={styles.settingTitle}>
          {title}
        </ThemedText>
        {description ? (
          <ThemedText
            type="small"
            style={[styles.settingDesc, { color: theme.textSecondary }]}
          >
            {description}
          </ThemedText>
        ) : null}
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: theme.backgroundTertiary, true: theme.primary }}
        thumbColor="#FFFFFF"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.lg,
  },
  section: {
    padding: Spacing.xl,
  },
  sectionTitle: {
    marginBottom: Spacing.lg,
  },
  languageRow: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  languageButton: {
    flex: 1,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: "center",
  },
  languageText: {
    fontSize: 20,
    fontWeight: "600",
  },
  fontSizeRow: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  fontSizeButton: {
    flex: 1,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: "center",
  },
  fontSizeLabel: {
    fontWeight: "700",
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.sm,
  },
  settingIcon: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontWeight: "500",
  },
  settingDesc: {
    marginTop: 2,
  },
  divider: {
    height: 1,
    marginVertical: Spacing.md,
  },
});

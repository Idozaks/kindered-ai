import React, { useState, useEffect } from "react";
import { StyleSheet, View, Switch, Pressable, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useTranslation } from "react-i18next";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useQuery } from "@tanstack/react-query";

import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { GlassCard } from "@/components/GlassCard";
import { GlassButton } from "@/components/GlassButton";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { Spacing, BorderRadius } from "@/constants/theme";
import { storage, UserSettings } from "@/lib/storage";
import i18n from "@/lib/i18n";
import { MainStackParamList } from "@/navigation/RootStackNavigator";

const PREMIUM_GOLD = "#FFD700";
const PREMIUM_PURPLE = "#8B5CF6";

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const { user, logout, isLoading: authLoading } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [settings, setSettings] = useState<UserSettings>({
    language: "he",
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

  const handleLogout = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsLoggingOut(true);
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

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

        <Animated.View entering={FadeInDown.delay(250).duration(500)}>
          <GlassCard style={styles.section}>
            <ThemedText type="h4" style={styles.sectionTitle}>
              {t("settings.theme") || "ערכת נושא"}
            </ThemedText>
            <ThemeSwitcher />
          </GlassCard>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(350).duration(500)}>
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

        <Animated.View entering={FadeInDown.delay(425).duration(500)}>
          <GlassCard 
            style={StyleSheet.flatten([styles.section, styles.premiumSection])}
            onPress={() => navigation.navigate("Premium")}
            testID="premium-button"
          >
            <View style={styles.premiumContent}>
              <View style={[styles.premiumIcon, { backgroundColor: PREMIUM_GOLD + "20" }]}>
                <Feather name="award" size={28} color={PREMIUM_GOLD} />
              </View>
              <View style={styles.premiumText}>
                <ThemedText type="h4" style={{ color: PREMIUM_PURPLE }}>
                  {t("settings.premium", "דורי פרימיום")}
                </ThemedText>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  {t("settings.premiumDesc", "שדרג לגישה לכל הפיצ'רים")}
                </ThemedText>
              </View>
              <Feather name="chevron-left" size={24} color={PREMIUM_PURPLE} />
            </View>
          </GlassCard>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(450).duration(500)}>
          <GlassCard style={styles.section}>
            <ThemedText type="h4" style={styles.sectionTitle}>
              {t("settings.account")}
            </ThemedText>
            {user ? (
              <View style={styles.accountInfo}>
                <View style={[styles.avatarCircle, { backgroundColor: theme.primary + "20" }]}>
                  <Feather name="user" size={28} color={theme.primary} />
                </View>
                <View style={styles.accountDetails}>
                  <ThemedText type="body" style={styles.accountName}>
                    {user.displayName || user.email.split("@")[0]}
                  </ThemedText>
                  <ThemedText type="small" style={{ color: theme.textSecondary }}>
                    {user.email}
                  </ThemedText>
                </View>
              </View>
            ) : null}
            <GlassButton
              onPress={handleLogout}
              variant="secondary"
              icon={<Feather name="log-out" size={20} color={theme.text} />}
              disabled={isLoggingOut}
              style={styles.logoutButton}
              testID="logout-button"
            >
              {isLoggingOut ? t("settings.loggingOut") : t("settings.logout")}
            </GlassButton>
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
  accountInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  accountDetails: {
    flex: 1,
  },
  accountName: {
    fontWeight: "600",
    marginBottom: 2,
  },
  logoutButton: {
    marginTop: Spacing.sm,
  },
  premiumSection: {
    borderWidth: 2,
    borderColor: "#8B5CF6",
  },
  premiumContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  premiumIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  premiumText: {
    flex: 1,
  },
});

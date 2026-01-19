import React, { useState } from "react";
import { StyleSheet, View, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { Feather } from "@expo/vector-icons";
import Animated, {
  FadeIn,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { GlassCard } from "@/components/GlassCard";
import { GlassButton } from "@/components/GlassButton";
import { FloatingMicButton } from "@/components/FloatingMicButton";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";

export default function GrandchildModeScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [isListening, setIsListening] = useState(false);
  const [isActive, setIsActive] = useState(false);

  const pulseValue = useSharedValue(1);

  React.useEffect(() => {
    if (isActive) {
      pulseValue.value = withRepeat(
        withSequence(
          withTiming(1.05, { duration: 1500 }),
          withTiming(1, { duration: 1500 })
        ),
        -1,
        true
      );
    }
  }, [isActive]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseValue.value }],
  }));

  const handleStartSession = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setIsActive(true);
  };

  const handleMicPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsListening(!isListening);
  };

  return (
    <ThemedView style={styles.container}>
      <View
        style={[
          styles.content,
          {
            paddingTop: headerHeight + Spacing.xl,
            paddingBottom: insets.bottom + 120,
          },
        ]}
      >
        {!isActive ? (
          <Animated.View
            entering={FadeInUp.duration(600)}
            style={styles.introContainer}
          >
            <View
              style={[
                styles.iconCircle,
                { backgroundColor: theme.primary + "20" },
              ]}
            >
              <Feather name="monitor" size={64} color={theme.primary} />
            </View>
            <ThemedText type="h2" style={styles.title}>
              {t("grandchildMode.title")}
            </ThemedText>
            <ThemedText
              type="body"
              style={[styles.description, { color: theme.textSecondary }]}
            >
              {t("grandchildMode.ready")}
            </ThemedText>
            <ThemedText
              type="small"
              style={[styles.hint, { color: theme.textSecondary }]}
            >
              {t("grandchildMode.hint")}
            </ThemedText>
            <GlassButton
              onPress={handleStartSession}
              icon={<Feather name="play" size={24} color="#FFFFFF" />}
              style={styles.startButton}
              testID="start-session-button"
            >
              {t("common.start")}
            </GlassButton>

            {Platform.OS === "web" ? (
              <GlassCard style={styles.webNotice}>
                <View style={styles.noticeRow}>
                  <Feather
                    name="info"
                    size={20}
                    color={theme.warning}
                    style={styles.noticeIcon}
                  />
                  <ThemedText type="small">
                    Run in Expo Go for full screen sharing
                  </ThemedText>
                </View>
              </GlassCard>
            ) : null}
          </Animated.View>
        ) : (
          <Animated.View
            entering={FadeIn.duration(600)}
            style={styles.activeContainer}
          >
            <Animated.View style={[styles.visualizer, pulseStyle]}>
              <View
                style={[
                  styles.visualizerInner,
                  { backgroundColor: theme.primary + "30" },
                ]}
              >
                <View
                  style={[
                    styles.visualizerCore,
                    { backgroundColor: theme.primary },
                  ]}
                >
                  <Feather name="eye" size={48} color="#FFFFFF" />
                </View>
              </View>
            </Animated.View>

            <GlassCard style={styles.statusCard}>
              <View style={styles.statusRow}>
                <View
                  style={[styles.statusDot, { backgroundColor: theme.success }]}
                />
                <ThemedText type="body" style={styles.statusText}>
                  {t("grandchildMode.watching")}
                </ThemedText>
              </View>
              <ThemedText
                type="small"
                style={[styles.statusHint, { color: theme.textSecondary }]}
              >
                {isListening
                  ? t("common.listening")
                  : t("common.tapToSpeak")}
              </ThemedText>
            </GlassCard>

            <GlassButton
              variant="secondary"
              onPress={() => {
                setIsActive(false);
                navigation.goBack();
              }}
              icon={<Feather name="x" size={20} color={theme.danger} />}
              style={styles.endButton}
              testID="end-session-button"
            >
              {t("common.end")}
            </GlassButton>
          </Animated.View>
        )}
      </View>

      {isActive ? (
        <FloatingMicButton
          onPress={handleMicPress}
          isListening={isListening}
          testID="mic-button"
        />
      ) : null}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  introContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  iconCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing["2xl"],
  },
  title: {
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  description: {
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  hint: {
    textAlign: "center",
    marginBottom: Spacing["3xl"],
  },
  startButton: {
    width: "100%",
    maxWidth: 300,
  },
  webNotice: {
    marginTop: Spacing["2xl"],
    padding: Spacing.lg,
  },
  noticeRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  noticeIcon: {
    marginRight: Spacing.sm,
  },
  activeContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  visualizer: {
    marginBottom: Spacing["3xl"],
  },
  visualizerInner: {
    width: 200,
    height: 200,
    borderRadius: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  visualizerCore: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
    ...Shadows.floating,
  },
  statusCard: {
    padding: Spacing.xl,
    alignItems: "center",
    marginBottom: Spacing["2xl"],
    width: "100%",
    maxWidth: 300,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: Spacing.sm,
  },
  statusText: {
    fontWeight: "600",
  },
  statusHint: {
    textAlign: "center",
  },
  endButton: {
    width: "100%",
    maxWidth: 300,
  },
});

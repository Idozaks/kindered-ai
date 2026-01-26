import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import {
  Colors,
  Spacing,
  Typography,
  BorderRadius,
  Shadows,
} from "@/constants/theme";

export default function OnboardingScreen() {
  const { theme } = useTheme();
  const { completeOnboarding, user } = useAuth();
  const insets = useSafeAreaInsets();
  const [isCompleting, setIsCompleting] = useState(false);

  const handleComplete = async () => {
    setIsCompleting(true);
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await completeOnboarding();
    } catch (error) {
      console.error("Error completing onboarding:", error);
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + Spacing["3xl"] }
        ]}
        showsVerticalScrollIndicator={true}
        bounces={true}
      >
        <View style={styles.content}>
          <View style={[styles.iconContainer, { backgroundColor: Colors.light.primary }]}>
            <Feather name="heart" size={80} color="#FFFFFF" />
          </View>
          
          <Text style={[styles.greeting, { color: theme.text }]}>
            {user?.displayName ? `שלום, ${user.displayName}!` : "שלום!"}
          </Text>
          
          <Text style={[styles.title, { color: theme.text }]}>
            ברוכים הבאים
          </Text>
          
          <Text style={[styles.description, { color: theme.textSecondary }]}>
            אנחנו כאן לעזור לך להשתמש בטלפון בקלות ובביטחון
          </Text>

          <View style={styles.features}>
            <View style={styles.featureRow}>
              <View style={[styles.featureIcon, { backgroundColor: "#25D366" }]}>
                <Feather name="message-circle" size={24} color="#FFFFFF" />
              </View>
              <Text style={[styles.featureText, { color: theme.text }]}>
                מדריכי וואטסאפ פשוטים
              </Text>
            </View>
            
            <View style={styles.featureRow}>
              <View style={[styles.featureIcon, { backgroundColor: Colors.light.secondary }]}>
                <Feather name="play-circle" size={24} color="#FFFFFF" />
              </View>
              <Text style={[styles.featureText, { color: theme.text }]}>
                תרגול בטוח ללא דאגות
              </Text>
            </View>
            
            <View style={styles.featureRow}>
              <View style={[styles.featureIcon, { backgroundColor: Colors.light.success }]}>
                <Feather name="mic" size={24} color="#FFFFFF" />
              </View>
              <Text style={[styles.featureText, { color: theme.text }]}>
                עזרה קולית בכל רגע
              </Text>
            </View>
          </View>
        </View>

        <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.xl }]}>
          <Pressable
            style={[
              styles.button,
              { backgroundColor: Colors.light.success },
              isCompleting && styles.buttonDisabled,
            ]}
            onPress={handleComplete}
            disabled={isCompleting}
            testID="button-start"
          >
            <Text style={styles.buttonText}>
              בואו נתחיל!
            </Text>
            <Feather name="arrow-left" size={28} color="#FFFFFF" />
          </Pressable>
        </View>
      </ScrollView>
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
    flexGrow: 1,
  },
  content: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
  },
  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing["2xl"],
    ...Shadows.floating,
  },
  greeting: {
    fontSize: 28,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: 36,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: Spacing.lg,
  },
  description: {
    fontSize: 22,
    textAlign: "center",
    lineHeight: 34,
    marginBottom: Spacing["3xl"],
    paddingHorizontal: Spacing.md,
  },
  features: {
    width: "100%",
    gap: Spacing.lg,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.lg,
    paddingHorizontal: Spacing.md,
  },
  featureIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  featureText: {
    fontSize: 22,
    fontWeight: "500",
    flex: 1,
  },
  footer: {
    paddingHorizontal: Spacing.xl,
    gap: Spacing.md,
  },
  button: {
    height: 72,
    borderRadius: BorderRadius.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.md,
    ...Shadows.floating,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    fontSize: 26,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});

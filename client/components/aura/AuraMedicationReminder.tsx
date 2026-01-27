import React from "react";
import { StyleSheet, View, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, {
  FadeInDown,
  FadeOutUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

export interface Medication {
  id: string;
  name: string;
  dosage?: string;
  scheduledTime: Date;
  taken?: boolean;
}

interface AuraMedicationReminderProps {
  medication: Medication;
  onTake: (medication: Medication) => void;
  onDismiss: (medication: Medication) => void;
}

export function AuraMedicationReminder({
  medication,
  onTake,
  onDismiss,
}: AuraMedicationReminderProps) {
  const { theme } = useTheme();
  const takeScale = useSharedValue(1);
  const dismissScale = useSharedValue(1);

  const takeAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: takeScale.value }],
  }));

  const dismissAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: dismissScale.value }],
  }));

  const handleTake = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onTake(medication);
  };

  const handleDismiss = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onDismiss(medication);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <Animated.View
      entering={FadeInDown.duration(400)}
      exiting={FadeOutUp.duration(300)}
      style={[
        styles.container,
        {
          backgroundColor: theme.glassBg,
          borderColor: theme.warning,
        },
      ]}
    >
      <View style={styles.iconContainer}>
        <View style={[styles.iconCircle, { backgroundColor: theme.warning + "20" }]}>
          <Feather name="clock" size={28} color={theme.warning} />
        </View>
      </View>

      <View style={styles.content}>
        <ThemedText style={[styles.title, { color: theme.text }]}>
          Time to take medication
        </ThemedText>
        <ThemedText style={[styles.medicationName, { color: theme.text }]}>
          {medication.name}
          {medication.dosage ? ` - ${medication.dosage}` : ""}
        </ThemedText>
        <ThemedText style={[styles.time, { color: theme.textSecondary }]}>
          Scheduled: {formatTime(medication.scheduledTime)}
        </ThemedText>
      </View>

      <View style={styles.actions}>
        <Animated.View style={takeAnimatedStyle}>
          <Pressable
            onPress={handleTake}
            onPressIn={() => (takeScale.value = withSpring(0.9))}
            onPressOut={() => (takeScale.value = withSpring(1))}
            style={[styles.takeButton, { backgroundColor: theme.success }]}
            testID={`take-medication-${medication.id}`}
          >
            <Feather name="check" size={24} color="#FFFFFF" />
            <ThemedText style={styles.buttonText}>Take</ThemedText>
          </Pressable>
        </Animated.View>

        <Animated.View style={dismissAnimatedStyle}>
          <Pressable
            onPress={handleDismiss}
            onPressIn={() => (dismissScale.value = withSpring(0.9))}
            onPressOut={() => (dismissScale.value = withSpring(1))}
            style={[styles.dismissButton, { borderColor: theme.border }]}
            testID={`dismiss-medication-${medication.id}`}
          >
            <Feather name="x" size={20} color={theme.textSecondary} />
          </Pressable>
        </Animated.View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    gap: Spacing.md,
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    gap: Spacing.xs,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  medicationName: {
    fontSize: 20,
    fontWeight: "700",
  },
  time: {
    fontSize: 14,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  takeButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  dismissButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
});

import React from "react";
import { StyleSheet, View, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  withTiming,
  FadeIn,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

interface AuraHydrationTrackerProps {
  glasses: number;
  goal?: number;
  onAddGlass: () => void;
  onRemoveGlass?: () => void;
  compact?: boolean;
}

export function AuraHydrationTracker({
  glasses,
  goal = 8,
  onAddGlass,
  onRemoveGlass,
  compact = false,
}: AuraHydrationTrackerProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);
  const waveHeight = useSharedValue(0);

  const progress = Math.min(glasses / goal, 1);
  const progressColor = glasses >= goal ? "#52C41A" : "#00B4D8";

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handleAddGlass = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    scale.value = withSequence(
      withTiming(1.2, { duration: 100 }),
      withSpring(1)
    );
    onAddGlass();
  };

  const handleRemoveGlass = () => {
    if (onRemoveGlass && glasses > 0) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onRemoveGlass();
    }
  };

  if (compact) {
    return (
      <Animated.View entering={FadeIn.duration(300)}>
        <Pressable
          onPress={handleAddGlass}
          onLongPress={handleRemoveGlass}
          style={[
            styles.compactContainer,
            { backgroundColor: progressColor + "20", borderColor: progressColor },
          ]}
          testID="hydration-compact-button"
        >
          <Feather name="droplet" size={20} color={progressColor} />
          <ThemedText style={[styles.compactText, { color: progressColor }]}>
            {glasses}/{goal}
          </ThemedText>
        </Pressable>
      </Animated.View>
    );
  }

  return (
    <Animated.View
      entering={FadeIn.duration(400)}
      style={[
        styles.container,
        {
          backgroundColor: theme.glassBg,
          borderColor: theme.glassBorder,
        },
      ]}
    >
      <View style={styles.header}>
        <View style={[styles.iconCircle, { backgroundColor: progressColor + "20" }]}>
          <Feather name="droplet" size={24} color={progressColor} />
        </View>
        <View style={styles.titleContainer}>
          <ThemedText style={[styles.title, { color: theme.text }]}>
            Water Intake
          </ThemedText>
          <ThemedText style={[styles.subtitle, { color: theme.textSecondary }]}>
            {glasses >= goal ? "Goal reached!" : `${goal - glasses} more to go`}
          </ThemedText>
        </View>
      </View>

      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { backgroundColor: theme.backgroundSecondary }]}>
          <View
            style={[
              styles.progressFill,
              { width: `${progress * 100}%`, backgroundColor: progressColor },
            ]}
          />
        </View>
        <ThemedText style={[styles.progressText, { color: theme.text }]}>
          {glasses} / {goal} glasses
        </ThemedText>
      </View>

      <View style={styles.actions}>
        {onRemoveGlass && glasses > 0 ? (
          <Pressable
            onPress={handleRemoveGlass}
            style={[styles.removeButton, { borderColor: theme.border }]}
            testID="hydration-remove-button"
          >
            <Feather name="minus" size={20} color={theme.textSecondary} />
          </Pressable>
        ) : null}

        <Animated.View style={[styles.addButtonContainer, buttonAnimatedStyle]}>
          <Pressable
            onPress={handleAddGlass}
            style={[styles.addButton, { backgroundColor: progressColor }]}
            testID="hydration-add-button"
          >
            <Feather name="plus" size={24} color="#FFFFFF" />
            <ThemedText style={styles.addButtonText}>Add Glass</ThemedText>
          </Pressable>
        </Animated.View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    gap: Spacing.lg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 14,
  },
  progressContainer: {
    gap: Spacing.sm,
  },
  progressBar: {
    height: 12,
    borderRadius: 6,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 6,
  },
  progressText: {
    fontSize: 14,
    textAlign: "center",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.md,
  },
  removeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  addButtonContainer: {
    flex: 1,
    maxWidth: 200,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.md,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  compactContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    borderWidth: 2,
  },
  compactText: {
    fontSize: 14,
    fontWeight: "600",
  },
});

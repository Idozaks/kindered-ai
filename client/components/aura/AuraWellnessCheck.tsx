import React, { useState } from "react";
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

type MoodLevel = "great" | "good" | "okay" | "not_good" | "bad";

interface MoodOption {
  level: MoodLevel;
  label: string;
  icon: keyof typeof Feather.glyphMap;
  color: string;
}

const moodOptions: MoodOption[] = [
  { level: "great", label: "Great", icon: "sun", color: "#FFD700" },
  { level: "good", label: "Good", icon: "smile", color: "#90EE90" },
  { level: "okay", label: "Okay", icon: "meh", color: "#87CEEB" },
  { level: "not_good", label: "Not great", icon: "frown", color: "#DDA0DD" },
  { level: "bad", label: "Need help", icon: "alert-circle", color: "#FF6B6B" },
];

interface AuraWellnessCheckProps {
  onMoodSelected: (mood: MoodLevel) => void;
  onDismiss?: () => void;
}

function MoodButton({
  option,
  onPress,
  isSelected,
}: {
  option: MoodOption;
  onPress: () => void;
  isSelected: boolean;
}) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPress={handlePress}
        onPressIn={() => (scale.value = withSpring(0.9))}
        onPressOut={() => (scale.value = withSpring(1))}
        style={[
          styles.moodButton,
          { backgroundColor: option.color + "30" },
          isSelected && { backgroundColor: option.color, borderColor: option.color },
        ]}
        testID={`mood-${option.level}`}
      >
        <Feather
          name={option.icon}
          size={28}
          color={isSelected ? "#FFFFFF" : option.color}
        />
        <ThemedText
          style={[
            styles.moodLabel,
            { color: isSelected ? "#FFFFFF" : theme.text },
          ]}
        >
          {option.label}
        </ThemedText>
      </Pressable>
    </Animated.View>
  );
}

export function AuraWellnessCheck({ onMoodSelected, onDismiss }: AuraWellnessCheckProps) {
  const { theme } = useTheme();
  const [selectedMood, setSelectedMood] = useState<MoodLevel | null>(null);

  const handleMoodPress = (mood: MoodLevel) => {
    setSelectedMood(mood);
    setTimeout(() => {
      onMoodSelected(mood);
    }, 300);
  };

  return (
    <Animated.View
      entering={FadeInDown.duration(400)}
      exiting={FadeOutUp.duration(300)}
      style={[
        styles.container,
        {
          backgroundColor: theme.glassBg,
          borderColor: theme.glassBorder,
        },
      ]}
    >
      <View style={styles.header}>
        <View style={[styles.iconCircle, { backgroundColor: theme.primary + "20" }]}>
          <Feather name="heart" size={24} color={theme.primary} />
        </View>
        <View style={styles.titleContainer}>
          <ThemedText style={[styles.title, { color: theme.text }]}>
            How are you feeling?
          </ThemedText>
          <ThemedText style={[styles.subtitle, { color: theme.textSecondary }]}>
            Your wellbeing matters to me
          </ThemedText>
        </View>
        {onDismiss ? (
          <Pressable
            onPress={onDismiss}
            style={styles.closeButton}
            testID="dismiss-wellness-check"
          >
            <Feather name="x" size={20} color={theme.textSecondary} />
          </Pressable>
        ) : null}
      </View>

      <View style={styles.moodGrid}>
        {moodOptions.map((option) => (
          <MoodButton
            key={option.level}
            option={option}
            onPress={() => handleMoodPress(option.level)}
            isSelected={selectedMood === option.level}
          />
        ))}
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
    fontSize: 20,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 14,
  },
  closeButton: {
    padding: Spacing.sm,
  },
  moodGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: Spacing.sm,
  },
  moodButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    minWidth: 80,
    gap: Spacing.xs,
    borderWidth: 2,
    borderColor: "transparent",
  },
  moodLabel: {
    fontSize: 12,
    fontWeight: "600",
  },
});

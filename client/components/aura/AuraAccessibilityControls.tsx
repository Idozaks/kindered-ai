import React from "react";
import { StyleSheet, View, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  FadeIn,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

interface AuraAccessibilityControlsProps {
  onRepeat: () => void;
  onSlowDown: () => void;
  onSimplify: () => void;
}

interface ControlButtonProps {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  onPress: () => void;
  testID: string;
}

function ControlButton({ icon, label, onPress, testID }: ControlButtonProps) {
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
    <Animated.View style={[styles.buttonWrapper, animatedStyle]}>
      <Pressable
        onPress={handlePress}
        onPressIn={() => (scale.value = withSpring(0.9))}
        onPressOut={() => (scale.value = withSpring(1))}
        style={[
          styles.controlButton,
          { backgroundColor: theme.glassBg, borderColor: theme.glassBorder },
        ]}
        testID={testID}
      >
        <Feather name={icon} size={24} color={theme.primary} />
        <ThemedText style={[styles.buttonLabel, { color: theme.text }]}>
          {label}
        </ThemedText>
      </Pressable>
    </Animated.View>
  );
}

export function AuraAccessibilityControls({
  onRepeat,
  onSlowDown,
  onSimplify,
}: AuraAccessibilityControlsProps) {
  return (
    <Animated.View entering={FadeIn.duration(400)} style={styles.container}>
      <ControlButton
        icon="refresh-cw"
        label="Say again"
        onPress={onRepeat}
        testID="aura-repeat-button"
      />
      <ControlButton
        icon="clock"
        label="Speak slower"
        onPress={onSlowDown}
        testID="aura-slowdown-button"
      />
      <ControlButton
        icon="help-circle"
        label="Help me understand"
        onPress={onSimplify}
        testID="aura-simplify-button"
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
    gap: Spacing.sm,
  },
  buttonWrapper: {
    flex: 1,
  },
  controlButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: Spacing.xs,
    minHeight: 72,
  },
  buttonLabel: {
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
});

import React from "react";
import { StyleSheet, Pressable, ViewStyle, View } from "react-native";
import { BlurView } from "expo-blur";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  WithSpringConfig,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";

interface GlassCardProps {
  title?: string;
  description?: string;
  children?: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  icon?: React.ReactNode;
  large?: boolean;
  testID?: string;
}

const springConfig: WithSpringConfig = {
  damping: 20,
  mass: 0.4,
  stiffness: 200,
  overshootClamping: false,
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function GlassCard({
  title,
  description,
  children,
  onPress,
  style,
  icon,
  large = false,
  testID,
}: GlassCardProps) {
  const { theme, isDark } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, springConfig);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, springConfig);
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  };

  return (
    <AnimatedPressable
      testID={testID}
      onPress={onPress ? handlePress : undefined}
      onPressIn={onPress ? handlePressIn : undefined}
      onPressOut={onPress ? handlePressOut : undefined}
      style={[
        styles.card,
        large ? styles.cardLarge : null,
        {
          backgroundColor: theme.glassBg,
          borderColor: theme.glassBorder,
        },
        Shadows.glass,
        animatedStyle,
        style,
      ]}
    >
      <BlurView
        intensity={isDark ? 40 : 60}
        tint={isDark ? "dark" : "light"}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.content}>
        {icon ? <View style={styles.iconContainer}>{icon}</View> : null}
        <View style={styles.textContainer}>
          {title ? (
            <ThemedText type="h4" style={styles.cardTitle}>
              {title}
            </ThemedText>
          ) : null}
          {description ? (
            <ThemedText
              type="small"
              style={[styles.cardDescription, { color: theme.textSecondary }]}
            >
              {description}
            </ThemedText>
          ) : null}
        </View>
        {children}
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: "hidden",
    minHeight: 100,
  },
  cardLarge: {
    minHeight: 160,
    width: 280,
  },
  content: {
    padding: Spacing.xl,
    flex: 1,
  },
  iconContainer: {
    marginBottom: Spacing.md,
  },
  textContainer: {
    flex: 1,
  },
  cardTitle: {
    marginBottom: Spacing.xs,
  },
  cardDescription: {
    opacity: 0.8,
  },
});

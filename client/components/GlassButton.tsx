import React, { ReactNode } from "react";
import { StyleSheet, Pressable, ViewStyle, StyleProp, View } from "react-native";
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
import { BorderRadius, Spacing, Shadows, Typography } from "@/constants/theme";

interface GlassButtonProps {
  onPress?: () => void;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "ghost";
  icon?: ReactNode;
  testID?: string;
}

const springConfig: WithSpringConfig = {
  damping: 20,
  mass: 0.4,
  stiffness: 200,
  overshootClamping: false,
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function GlassButton({
  onPress,
  children,
  style,
  disabled = false,
  variant = "primary",
  icon,
  testID,
}: GlassButtonProps) {
  const { theme, isDark } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (!disabled) {
      scale.value = withSpring(0.96, springConfig);
    }
  };

  const handlePressOut = () => {
    if (!disabled) {
      scale.value = withSpring(1, springConfig);
    }
  };

  const handlePress = () => {
    if (!disabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onPress?.();
    }
  };

  const getBackgroundColor = () => {
    if (disabled) return theme.backgroundSecondary;
    switch (variant) {
      case "primary":
        return theme.primary;
      case "secondary":
        return theme.glassBg;
      case "ghost":
        return "transparent";
      default:
        return theme.primary;
    }
  };

  const getTextColor = () => {
    if (disabled) return theme.textSecondary;
    switch (variant) {
      case "primary":
        return "#FFFFFF";
      case "secondary":
      case "ghost":
        return theme.primary;
      default:
        return "#FFFFFF";
    }
  };

  return (
    <AnimatedPressable
      testID={testID}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={[
        styles.button,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: variant === "ghost" ? "transparent" : theme.glassBorder,
          opacity: disabled ? 0.6 : 1,
        },
        variant === "primary" ? Shadows.glassSmall : null,
        animatedStyle,
        style,
      ]}
    >
      {variant === "secondary" ? (
        <BlurView
          intensity={isDark ? 40 : 60}
          tint={isDark ? "dark" : "light"}
          style={StyleSheet.absoluteFill}
        />
      ) : null}
      <View style={styles.content}>
        {icon ? <View style={styles.icon}>{icon}</View> : null}
        <ThemedText
          style={[
            styles.buttonText,
            { color: getTextColor() },
          ]}
        >
          {children}
        </ThemedText>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 56,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    marginRight: Spacing.sm,
  },
  buttonText: {
    fontSize: Typography.button.fontSize,
    fontWeight: Typography.button.fontWeight,
  },
});

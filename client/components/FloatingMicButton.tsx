import React, { useEffect } from "react";
import { StyleSheet, Pressable, View } from "react-native";
import { BlurView } from "expo-blur";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
  cancelAnimation,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { useTheme } from "@/hooks/useTheme";
import { Shadows, BorderRadius } from "@/constants/theme";

interface FloatingMicButtonProps {
  onPress: () => void;
  isListening?: boolean;
  testID?: string;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function FloatingMicButton({
  onPress,
  isListening = false,
  testID,
}: FloatingMicButtonProps) {
  const { theme, isDark } = useTheme();
  const scale = useSharedValue(1);
  const pulseScale = useSharedValue(1);
  const glowOpacity = useSharedValue(0);

  useEffect(() => {
    if (isListening) {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.15, { duration: 800, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(0.6, { duration: 800 }),
          withTiming(0.3, { duration: 800 })
        ),
        -1,
        true
      );
    } else {
      cancelAnimation(pulseScale);
      cancelAnimation(glowOpacity);
      pulseScale.value = withSpring(1);
      glowOpacity.value = withTiming(0);
    }
  }, [isListening]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const pulseAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: glowOpacity.value,
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.92);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    onPress();
  };

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.glowRing,
          { backgroundColor: theme.primary },
          pulseAnimatedStyle,
        ]}
      />
      <AnimatedPressable
        testID={testID}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.button,
          {
            backgroundColor: theme.primary,
          },
          Shadows.floating,
          animatedStyle,
        ]}
      >
        <BlurView
          intensity={isDark ? 20 : 30}
          tint={isDark ? "dark" : "light"}
          style={[StyleSheet.absoluteFill, { borderRadius: BorderRadius.full }]}
        />
        <View style={styles.iconContainer}>
          <Feather
            name={isListening ? "mic" : "mic"}
            size={32}
            color="#FFFFFF"
          />
        </View>
      </AnimatedPressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 100,
    right: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  glowRing: {
    position: "absolute",
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  button: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
});

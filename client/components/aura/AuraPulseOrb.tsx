import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  Easing,
  cancelAnimation,
  interpolateColor,
} from "react-native-reanimated";

import { AuraColors, BorderRadius } from "@/constants/theme";

export type AuraVoiceState = "idle" | "listening" | "thinking" | "speaking";

interface AuraPulseOrbProps {
  state: AuraVoiceState;
  size?: number;
}

export function AuraPulseOrb({ state, size = 64 }: AuraPulseOrbProps) {
  const pulseScale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.3);
  const colorProgress = useSharedValue(0);

  useEffect(() => {
    cancelAnimation(pulseScale);
    cancelAnimation(glowOpacity);

    switch (state) {
      case "listening":
        colorProgress.value = withSpring(1);
        pulseScale.value = withRepeat(
          withSequence(
            withTiming(1.2, { duration: 600, easing: Easing.inOut(Easing.ease) }),
            withTiming(1, { duration: 600, easing: Easing.inOut(Easing.ease) })
          ),
          -1,
          true
        );
        glowOpacity.value = withRepeat(
          withSequence(
            withTiming(0.8, { duration: 600 }),
            withTiming(0.4, { duration: 600 })
          ),
          -1,
          true
        );
        break;
      case "thinking":
        colorProgress.value = withSpring(2);
        pulseScale.value = withRepeat(
          withSequence(
            withTiming(1.1, { duration: 400, easing: Easing.inOut(Easing.ease) }),
            withTiming(1, { duration: 400, easing: Easing.inOut(Easing.ease) })
          ),
          -1,
          true
        );
        glowOpacity.value = withRepeat(
          withSequence(
            withTiming(0.6, { duration: 400 }),
            withTiming(0.3, { duration: 400 })
          ),
          -1,
          true
        );
        break;
      case "speaking":
        colorProgress.value = withSpring(3);
        pulseScale.value = withRepeat(
          withSequence(
            withTiming(1.15, { duration: 300, easing: Easing.inOut(Easing.ease) }),
            withTiming(1.05, { duration: 300, easing: Easing.inOut(Easing.ease) })
          ),
          -1,
          true
        );
        glowOpacity.value = withRepeat(
          withSequence(
            withTiming(0.7, { duration: 300 }),
            withTiming(0.5, { duration: 300 })
          ),
          -1,
          true
        );
        break;
      default:
        colorProgress.value = withSpring(0);
        pulseScale.value = withSpring(1);
        glowOpacity.value = withTiming(0.2);
    }
  }, [state]);

  const getColor = (s: AuraVoiceState): string => {
    switch (s) {
      case "listening":
        return AuraColors.listening;
      case "thinking":
        return AuraColors.thinking;
      case "speaking":
        return AuraColors.speaking;
      default:
        return AuraColors.idle;
    }
  };

  const orbStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      colorProgress.value,
      [0, 1, 2, 3],
      [AuraColors.idle, AuraColors.listening, AuraColors.thinking, AuraColors.speaking]
    );

    return {
      backgroundColor,
      transform: [{ scale: pulseScale.value }],
    };
  });

  const glowStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      colorProgress.value,
      [0, 1, 2, 3],
      [AuraColors.idle, AuraColors.listening, AuraColors.thinking, AuraColors.speaking]
    );

    return {
      backgroundColor,
      opacity: glowOpacity.value,
      transform: [{ scale: pulseScale.value * 1.5 }],
    };
  });

  return (
    <View style={[styles.container, { width: size * 2, height: size * 2 }]}>
      <Animated.View
        style={[
          styles.glow,
          { width: size, height: size, borderRadius: size / 2 },
          glowStyle,
        ]}
      />
      <Animated.View
        style={[
          styles.orb,
          { width: size, height: size, borderRadius: size / 2 },
          orbStyle,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  glow: {
    position: "absolute",
  },
  orb: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});

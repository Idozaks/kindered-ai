import React, { useEffect, useMemo } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withRepeat,
  withTiming,
  withSpring,
  Easing,
  cancelAnimation,
  interpolate,
  useDerivedValue,
} from "react-native-reanimated";
import Svg, { Path, Defs, RadialGradient, Stop } from "react-native-svg";

import { AuraColors } from "@/constants/theme";

const AnimatedPath = Animated.createAnimatedComponent(Path);

export type AuraVoiceState = "idle" | "listening" | "thinking" | "speaking";

interface LiquidOrbProps {
  state: AuraVoiceState;
  size?: number;
}

function generateBlobPath(
  cx: number,
  cy: number,
  radius: number,
  points: number,
  variance: number,
  phase: number
): string {
  const angleStep = (Math.PI * 2) / points;
  const controlPoints: { x: number; y: number }[] = [];

  for (let i = 0; i < points; i++) {
    const angle = i * angleStep + phase;
    const noise = Math.sin(angle * 3 + phase * 2) * variance;
    const r = radius + noise;
    controlPoints.push({
      x: cx + Math.cos(angle) * r,
      y: cy + Math.sin(angle) * r,
    });
  }

  let path = `M ${controlPoints[0].x} ${controlPoints[0].y}`;

  for (let i = 0; i < points; i++) {
    const p0 = controlPoints[i];
    const p1 = controlPoints[(i + 1) % points];
    const p2 = controlPoints[(i + 2) % points];

    const cp1x = p0.x + (p1.x - controlPoints[(i - 1 + points) % points].x) / 4;
    const cp1y = p0.y + (p1.y - controlPoints[(i - 1 + points) % points].y) / 4;
    const cp2x = p1.x - (p2.x - p0.x) / 4;
    const cp2y = p1.y - (p2.y - p0.y) / 4;

    path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p1.x} ${p1.y}`;
  }

  path += " Z";
  return path;
}

export function LiquidOrb({ state, size = 64 }: LiquidOrbProps) {
  const phase1 = useSharedValue(0);
  const phase2 = useSharedValue(0);
  const phase3 = useSharedValue(0);
  const intensity = useSharedValue(0.1);
  const colorProgress = useSharedValue(0);

  const cx = size / 2;
  const cy = size / 2;
  const baseRadius = size * 0.35;

  useEffect(() => {
    cancelAnimation(phase1);
    cancelAnimation(phase2);
    cancelAnimation(phase3);
    cancelAnimation(intensity);

    const baseSpeed = state === "idle" ? 8000 : state === "listening" ? 3000 : state === "thinking" ? 2000 : 1500;
    const baseIntensity = state === "idle" ? 0.08 : state === "listening" ? 0.15 : state === "thinking" ? 0.12 : 0.18;

    phase1.value = withRepeat(
      withTiming(Math.PI * 2, { duration: baseSpeed, easing: Easing.linear }),
      -1,
      false
    );
    phase2.value = withRepeat(
      withTiming(Math.PI * 2, { duration: baseSpeed * 1.3, easing: Easing.linear }),
      -1,
      false
    );
    phase3.value = withRepeat(
      withTiming(Math.PI * 2, { duration: baseSpeed * 0.7, easing: Easing.linear }),
      -1,
      false
    );

    intensity.value = withSpring(baseIntensity, { damping: 15, stiffness: 100 });

    switch (state) {
      case "listening":
        colorProgress.value = withSpring(1);
        break;
      case "thinking":
        colorProgress.value = withSpring(2);
        break;
      case "speaking":
        colorProgress.value = withSpring(3);
        break;
      default:
        colorProgress.value = withSpring(0);
    }
  }, [state]);

  const currentColor = useDerivedValue(() => {
    const colors = [AuraColors.idle, AuraColors.listening, AuraColors.thinking, AuraColors.speaking];
    const idx = Math.floor(colorProgress.value);
    const nextIdx = Math.min(idx + 1, 3);
    const t = colorProgress.value - idx;
    
    return colors[Math.round(colorProgress.value)] || colors[0];
  });

  const innerPath = useAnimatedProps(() => {
    const variance = baseRadius * intensity.value;
    const path = generateBlobPath(cx, cy, baseRadius, 8, variance, phase1.value);
    return { d: path };
  });

  const middlePath = useAnimatedProps(() => {
    const variance = baseRadius * intensity.value * 0.7;
    const path = generateBlobPath(cx, cy, baseRadius * 1.15, 6, variance, phase2.value);
    return { d: path };
  });

  const outerPath = useAnimatedProps(() => {
    const variance = baseRadius * intensity.value * 0.5;
    const path = generateBlobPath(cx, cy, baseRadius * 1.35, 5, variance, phase3.value);
    return { d: path };
  });

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

  const color = getColor(state);
  const glowColor = color + "40";
  const midColor = color + "80";

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Defs>
          <RadialGradient id="orbGradient" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={color} stopOpacity="1" />
            <Stop offset="70%" stopColor={color} stopOpacity="0.9" />
            <Stop offset="100%" stopColor={color} stopOpacity="0.7" />
          </RadialGradient>
          <RadialGradient id="glowGradient" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={color} stopOpacity="0.4" />
            <Stop offset="100%" stopColor={color} stopOpacity="0" />
          </RadialGradient>
        </Defs>

        <AnimatedPath
          animatedProps={outerPath}
          fill={glowColor}
          opacity={0.3}
        />

        <AnimatedPath
          animatedProps={middlePath}
          fill={midColor}
          opacity={0.5}
        />

        <AnimatedPath
          animatedProps={innerPath}
          fill="url(#orbGradient)"
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
});

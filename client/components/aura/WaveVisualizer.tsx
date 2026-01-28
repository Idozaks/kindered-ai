import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withRepeat,
  withTiming,
  withSpring,
  Easing,
  cancelAnimation,
} from "react-native-reanimated";
import Svg, { Path, Defs, LinearGradient, Stop } from "react-native-svg";

import { AuraColors } from "@/constants/theme";

const AnimatedPath = Animated.createAnimatedComponent(Path);

export type WaveState = "idle" | "listening" | "speaking";

interface WaveVisualizerProps {
  state: WaveState;
  width?: number;
  height?: number;
  color?: string;
}

function generateWavePath(
  width: number,
  height: number,
  amplitude: number,
  frequency: number,
  phase: number,
  yOffset: number
): string {
  const points: string[] = [];
  const steps = 50;

  for (let i = 0; i <= steps; i++) {
    const x = (i / steps) * width;
    const y =
      yOffset +
      Math.sin((i / steps) * Math.PI * frequency + phase) * amplitude +
      Math.sin((i / steps) * Math.PI * frequency * 2 + phase * 1.5) * (amplitude * 0.3);
    
    if (i === 0) {
      points.push(`M ${x} ${y}`);
    } else {
      points.push(`L ${x} ${y}`);
    }
  }

  return points.join(" ");
}

export function WaveVisualizer({
  state,
  width = 200,
  height = 60,
  color,
}: WaveVisualizerProps) {
  const phase1 = useSharedValue(0);
  const phase2 = useSharedValue(0);
  const phase3 = useSharedValue(0);
  const amplitude = useSharedValue(0);

  const baseColor = color || (state === "listening" ? AuraColors.listening : AuraColors.speaking);
  const midY = height / 2;

  useEffect(() => {
    cancelAnimation(phase1);
    cancelAnimation(phase2);
    cancelAnimation(phase3);
    cancelAnimation(amplitude);

    if (state === "idle") {
      amplitude.value = withSpring(2, { damping: 20 });
      phase1.value = withRepeat(
        withTiming(Math.PI * 2, { duration: 4000, easing: Easing.linear }),
        -1,
        false
      );
    } else if (state === "listening") {
      amplitude.value = withSpring(12, { damping: 10 });
      phase1.value = withRepeat(
        withTiming(Math.PI * 2, { duration: 1500, easing: Easing.linear }),
        -1,
        false
      );
      phase2.value = withRepeat(
        withTiming(Math.PI * 2, { duration: 2000, easing: Easing.linear }),
        -1,
        false
      );
      phase3.value = withRepeat(
        withTiming(Math.PI * 2, { duration: 2500, easing: Easing.linear }),
        -1,
        false
      );
    } else if (state === "speaking") {
      amplitude.value = withSpring(18, { damping: 8 });
      phase1.value = withRepeat(
        withTiming(Math.PI * 2, { duration: 800, easing: Easing.linear }),
        -1,
        false
      );
      phase2.value = withRepeat(
        withTiming(Math.PI * 2, { duration: 1200, easing: Easing.linear }),
        -1,
        false
      );
      phase3.value = withRepeat(
        withTiming(Math.PI * 2, { duration: 600, easing: Easing.linear }),
        -1,
        false
      );
    }
  }, [state]);

  const wave1Props = useAnimatedProps(() => {
    const path = generateWavePath(width, height, amplitude.value, 2, phase1.value, midY);
    return { d: path };
  });

  const wave2Props = useAnimatedProps(() => {
    const path = generateWavePath(width, height, amplitude.value * 0.7, 3, phase2.value + Math.PI / 3, midY);
    return { d: path };
  });

  const wave3Props = useAnimatedProps(() => {
    const path = generateWavePath(width, height, amplitude.value * 0.5, 4, phase3.value + Math.PI / 2, midY);
    return { d: path };
  });

  return (
    <View style={[styles.container, { width, height }]}>
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <Defs>
          <LinearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor={baseColor} stopOpacity="0.2" />
            <Stop offset="50%" stopColor={baseColor} stopOpacity="1" />
            <Stop offset="100%" stopColor={baseColor} stopOpacity="0.2" />
          </LinearGradient>
        </Defs>

        <AnimatedPath
          animatedProps={wave3Props}
          stroke={baseColor}
          strokeWidth={2}
          strokeOpacity={0.3}
          fill="none"
          strokeLinecap="round"
        />

        <AnimatedPath
          animatedProps={wave2Props}
          stroke={baseColor}
          strokeWidth={2.5}
          strokeOpacity={0.5}
          fill="none"
          strokeLinecap="round"
        />

        <AnimatedPath
          animatedProps={wave1Props}
          stroke="url(#waveGradient)"
          strokeWidth={3}
          fill="none"
          strokeLinecap="round"
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

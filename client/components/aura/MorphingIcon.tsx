import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withSpring,
  withTiming,
  interpolate,
  Easing,
} from "react-native-reanimated";
import Svg, { Path, Circle, G } from "react-native-svg";

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedG = Animated.createAnimatedComponent(G);

export type IconState = "mic" | "waves" | "speaker" | "stop";

interface MorphingIconProps {
  state: IconState;
  size?: number;
  color?: string;
}

const MIC_PATH = "M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z M19 10v2a7 7 0 0 1-14 0v-2 M12 19v4 M8 23h8";

const SPEAKER_PATH = "M11 5L6 9H2v6h4l5 4V5z M15.54 8.46a5 5 0 0 1 0 7.07";

const STOP_PATH = "M6 6h12v12H6z";

const WAVES_PATHS = [
  "M12 6v12",
  "M8 8v8", 
  "M16 8v8",
  "M4 10v4",
  "M20 10v4",
];

export function MorphingIcon({ state, size = 24, color = "#9B59B6" }: MorphingIconProps) {
  const progress = useSharedValue(0);
  const waveOffset1 = useSharedValue(0);
  const waveOffset2 = useSharedValue(0);
  const waveOffset3 = useSharedValue(0);
  const waveOffset4 = useSharedValue(0);
  const waveOffset5 = useSharedValue(0);

  useEffect(() => {
    switch (state) {
      case "mic":
        progress.value = withSpring(0, { damping: 15, stiffness: 120 });
        break;
      case "waves":
        progress.value = withSpring(1, { damping: 15, stiffness: 120 });
        waveOffset1.value = withTiming(1, { duration: 300, easing: Easing.out(Easing.ease) });
        waveOffset2.value = withTiming(1, { duration: 400, easing: Easing.out(Easing.ease) });
        waveOffset3.value = withTiming(1, { duration: 350, easing: Easing.out(Easing.ease) });
        waveOffset4.value = withTiming(1, { duration: 450, easing: Easing.out(Easing.ease) });
        waveOffset5.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.ease) });
        break;
      case "speaker":
        progress.value = withSpring(2, { damping: 15, stiffness: 120 });
        break;
      case "stop":
        progress.value = withSpring(3, { damping: 15, stiffness: 120 });
        break;
    }
    
    if (state !== "waves") {
      waveOffset1.value = withTiming(0, { duration: 200 });
      waveOffset2.value = withTiming(0, { duration: 200 });
      waveOffset3.value = withTiming(0, { duration: 200 });
      waveOffset4.value = withTiming(0, { duration: 200 });
      waveOffset5.value = withTiming(0, { duration: 200 });
    }
  }, [state]);

  const micOpacity = useAnimatedProps(() => ({
    opacity: interpolate(progress.value, [0, 0.5, 1, 2, 3], [1, 0, 0, 0, 0]),
  }));

  const wavesOpacity = useAnimatedProps(() => ({
    opacity: interpolate(progress.value, [0, 0.5, 1, 1.5, 2, 3], [0, 0, 1, 1, 0, 0]),
  }));

  const speakerOpacity = useAnimatedProps(() => ({
    opacity: interpolate(progress.value, [0, 1, 1.5, 2, 2.5, 3], [0, 0, 0, 1, 1, 0]),
  }));

  const stopOpacity = useAnimatedProps(() => ({
    opacity: interpolate(progress.value, [0, 1, 2, 2.5, 3], [0, 0, 0, 0, 1]),
  }));

  const wave1Props = useAnimatedProps(() => ({
    strokeDashoffset: interpolate(waveOffset1.value, [0, 1], [20, 0]),
  }));

  const wave2Props = useAnimatedProps(() => ({
    strokeDashoffset: interpolate(waveOffset2.value, [0, 1], [20, 0]),
  }));

  const wave3Props = useAnimatedProps(() => ({
    strokeDashoffset: interpolate(waveOffset3.value, [0, 1], [20, 0]),
  }));

  const wave4Props = useAnimatedProps(() => ({
    strokeDashoffset: interpolate(waveOffset4.value, [0, 1], [20, 0]),
  }));

  const wave5Props = useAnimatedProps(() => ({
    strokeDashoffset: interpolate(waveOffset5.value, [0, 1], [20, 0]),
  }));

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <AnimatedG animatedProps={micOpacity}>
          <Path
            d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"
            fill={color}
            stroke={color}
            strokeWidth={0}
          />
          <Path
            d="M19 10v2a7 7 0 0 1-14 0v-2"
            fill="none"
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
          />
          <Path
            d="M12 19v4 M8 23h8"
            fill="none"
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
          />
        </AnimatedG>

        <AnimatedG animatedProps={wavesOpacity}>
          <AnimatedPath
            animatedProps={wave1Props}
            d="M12 6v12"
            stroke={color}
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeDasharray="20"
          />
          <AnimatedPath
            animatedProps={wave2Props}
            d="M8 8v8"
            stroke={color}
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeDasharray="20"
          />
          <AnimatedPath
            animatedProps={wave3Props}
            d="M16 8v8"
            stroke={color}
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeDasharray="20"
          />
          <AnimatedPath
            animatedProps={wave4Props}
            d="M4 10v4"
            stroke={color}
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeDasharray="20"
          />
          <AnimatedPath
            animatedProps={wave5Props}
            d="M20 10v4"
            stroke={color}
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeDasharray="20"
          />
        </AnimatedG>

        <AnimatedG animatedProps={speakerOpacity}>
          <Path
            d="M11 5L6 9H2v6h4l5 4V5z"
            fill={color}
            stroke={color}
            strokeWidth={0}
          />
          <Path
            d="M15.54 8.46a5 5 0 0 1 0 7.07"
            fill="none"
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
          />
          <Path
            d="M19.07 4.93a10 10 0 0 1 0 14.14"
            fill="none"
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
          />
        </AnimatedG>

        <AnimatedG animatedProps={stopOpacity}>
          <Path
            d="M6 6h12v12H6z"
            fill={color}
            stroke={color}
            strokeWidth={0}
          />
        </AnimatedG>
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

import React, { useEffect, useCallback } from "react";
import { StyleSheet, View, Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedProps,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  withSequence,
  Easing,
  runOnJS,
  SharedValue,
} from "react-native-reanimated";
import Svg, { Path, Circle, G, Defs, RadialGradient, Stop } from "react-native-svg";
import * as Haptics from "expo-haptics";

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedG = Animated.createAnimatedComponent(G);

interface StarburstProps {
  visible: boolean;
  onComplete?: () => void;
  size?: number;
  rayCount?: number;
  color?: string;
  secondaryColor?: string;
}

export function Starburst({
  visible,
  onComplete,
  size = 200,
  rayCount = 12,
  color = "#FFD700",
  secondaryColor = "#FF6B6B",
}: StarburstProps) {
  const scale = useSharedValue(0);
  const rotation = useSharedValue(0);
  const rayProgress = useSharedValue(0);
  const opacity = useSharedValue(0);
  const centerPulse = useSharedValue(1);

  const triggerHaptic = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, []);

  const handleComplete = useCallback(() => {
    onComplete?.();
  }, [onComplete]);

  useEffect(() => {
    if (visible) {
      runOnJS(triggerHaptic)();
      
      opacity.value = withTiming(1, { duration: 100 });
      scale.value = withSequence(
        withSpring(1.2, { damping: 8, stiffness: 100 }),
        withSpring(1, { damping: 12, stiffness: 120 })
      );
      rotation.value = withTiming(Math.PI * 2, { duration: 1000, easing: Easing.out(Easing.cubic) });
      rayProgress.value = withSequence(
        withTiming(1, { duration: 400, easing: Easing.out(Easing.cubic) }),
        withDelay(400, withTiming(0, { duration: 300 }))
      );
      centerPulse.value = withSequence(
        withSpring(1.5, { damping: 6 }),
        withSpring(1, { damping: 10 }),
        withSpring(1.3, { damping: 8 }),
        withSpring(0, { damping: 15 })
      );

      const timer = setTimeout(() => {
        opacity.value = withTiming(0, { duration: 300 });
        setTimeout(handleComplete, 300);
      }, 1200);

      return () => clearTimeout(timer);
    } else {
      scale.value = 0;
      opacity.value = 0;
      rotation.value = 0;
      rayProgress.value = 0;
      centerPulse.value = 1;
    }
  }, [visible]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const cx = size / 2;
  const cy = size / 2;

  const rays = Array.from({ length: rayCount }, (_, i) => {
    const angle = (i / rayCount) * Math.PI * 2;
    return { angle, index: i };
  });

  return (
    <Animated.View style={[styles.container, { width: size, height: size }, containerStyle]}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Defs>
          <RadialGradient id="starGlow" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={color} stopOpacity="1" />
            <Stop offset="50%" stopColor={color} stopOpacity="0.6" />
            <Stop offset="100%" stopColor={color} stopOpacity="0" />
          </RadialGradient>
        </Defs>

        {rays.map(({ angle, index }) => (
          <StarRay
            key={index}
            cx={cx}
            cy={cy}
            angle={angle}
            length={size * 0.4}
            progress={rayProgress}
            rotation={rotation}
            color={index % 2 === 0 ? color : secondaryColor}
            delay={index * 30}
          />
        ))}

        <CenterOrb
          cx={cx}
          cy={cy}
          radius={size * 0.08}
          pulse={centerPulse}
          color={color}
        />
      </Svg>
    </Animated.View>
  );
}

interface StarRayProps {
  cx: number;
  cy: number;
  angle: number;
  length: number;
  progress: SharedValue<number>;
  rotation: SharedValue<number>;
  color: string;
  delay: number;
}

function StarRay({ cx, cy, angle, length, progress, rotation, color, delay }: StarRayProps) {
  const animatedProps = useAnimatedProps(() => {
    const currentAngle = angle + rotation.value;
    const rayLength = length * progress.value;
    
    const x1 = cx + Math.cos(currentAngle) * 10;
    const y1 = cy + Math.sin(currentAngle) * 10;
    const x2 = cx + Math.cos(currentAngle) * rayLength;
    const y2 = cy + Math.sin(currentAngle) * rayLength;

    const opacity = progress.value;

    return {
      d: `M ${x1} ${y1} L ${x2} ${y2}`,
      opacity,
    };
  });

  return (
    <AnimatedPath
      animatedProps={animatedProps}
      stroke={color}
      strokeWidth={3}
      strokeLinecap="round"
    />
  );
}

interface CenterOrbProps {
  cx: number;
  cy: number;
  radius: number;
  pulse: SharedValue<number>;
  color: string;
}

function CenterOrb({ cx, cy, radius, pulse, color }: CenterOrbProps) {
  const animatedProps = useAnimatedProps(() => ({
    r: radius * pulse.value,
    opacity: pulse.value > 0.1 ? 1 : 0,
  }));

  return (
    <AnimatedCircle
      animatedProps={animatedProps}
      cx={cx}
      cy={cy}
      fill="url(#starGlow)"
    />
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
});

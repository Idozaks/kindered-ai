import React, { useEffect, useMemo } from "react";
import { StyleSheet, View, Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withRepeat,
  withTiming,
  withDelay,
  Easing,
  useDerivedValue,
  SharedValue,
} from "react-native-reanimated";
import Svg, { Circle, Line, Defs, RadialGradient, Stop } from "react-native-svg";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedLine = Animated.createAnimatedComponent(Line);

interface Particle {
  id: number;
  baseX: number;
  baseY: number;
  radius: number;
  speed: number;
  phase: number;
  amplitude: number;
}

interface ParticleConstellationProps {
  width?: number;
  height?: number;
  particleCount?: number;
  color?: string;
  connectionDistance?: number;
}

export function ParticleConstellation({
  width = Dimensions.get("window").width,
  height = 300,
  particleCount = 20,
  color = "#9B59B6",
  connectionDistance = 100,
}: ParticleConstellationProps) {
  const particles = useMemo(() => {
    const result: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      result.push({
        id: i,
        baseX: Math.random() * width,
        baseY: Math.random() * height,
        radius: 2 + Math.random() * 3,
        speed: 15000 + Math.random() * 10000,
        phase: Math.random() * Math.PI * 2,
        amplitude: 20 + Math.random() * 30,
      });
    }
    return result;
  }, [width, height, particleCount]);

  const time = useSharedValue(0);

  useEffect(() => {
    time.value = withRepeat(
      withTiming(Math.PI * 2, { duration: 20000, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  return (
    <View style={[styles.container, { width, height }]}>
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <Defs>
          <RadialGradient id="particleGlow" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={color} stopOpacity="0.8" />
            <Stop offset="100%" stopColor={color} stopOpacity="0" />
          </RadialGradient>
        </Defs>

        {particles.map((p1, i) =>
          particles.slice(i + 1).map((p2) => (
            <ConnectionLine
              key={`line-${p1.id}-${p2.id}`}
              p1={p1}
              p2={p2}
              time={time}
              color={color}
              maxDistance={connectionDistance}
            />
          ))
        )}

        {particles.map((particle) => (
          <AnimatedParticle
            key={particle.id}
            particle={particle}
            time={time}
            color={color}
          />
        ))}
      </Svg>
    </View>
  );
}

interface AnimatedParticleProps {
  particle: Particle;
  time: SharedValue<number>;
  color: string;
}

function AnimatedParticle({ particle, time, color }: AnimatedParticleProps) {
  const animatedProps = useAnimatedProps(() => {
    const x = particle.baseX + Math.sin(time.value + particle.phase) * particle.amplitude;
    const y = particle.baseY + Math.cos(time.value * 0.7 + particle.phase) * (particle.amplitude * 0.6);
    return {
      cx: x,
      cy: y,
    };
  });

  return (
    <AnimatedCircle
      animatedProps={animatedProps}
      r={particle.radius}
      fill={color}
      opacity={0.6}
    />
  );
}

interface ConnectionLineProps {
  p1: Particle;
  p2: Particle;
  time: SharedValue<number>;
  color: string;
  maxDistance: number;
}

function ConnectionLine({ p1, p2, time, color, maxDistance }: ConnectionLineProps) {
  const animatedProps = useAnimatedProps(() => {
    const x1 = p1.baseX + Math.sin(time.value + p1.phase) * p1.amplitude;
    const y1 = p1.baseY + Math.cos(time.value * 0.7 + p1.phase) * (p1.amplitude * 0.6);
    const x2 = p2.baseX + Math.sin(time.value + p2.phase) * p2.amplitude;
    const y2 = p2.baseY + Math.cos(time.value * 0.7 + p2.phase) * (p2.amplitude * 0.6);

    const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    const opacity = distance < maxDistance ? (1 - distance / maxDistance) * 0.3 : 0;

    return {
      x1,
      y1,
      x2,
      y2,
      opacity,
    };
  });

  return (
    <AnimatedLine
      animatedProps={animatedProps}
      stroke={color}
      strokeWidth={1}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
  },
});

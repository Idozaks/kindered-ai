import React, { useEffect, useMemo } from "react";
import { StyleSheet, View, Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withRepeat,
  withTiming,
  Easing,
  SharedValue,
  interpolateColor,
} from "react-native-reanimated";
import Svg, { Circle, Defs, RadialGradient, Stop, Rect } from "react-native-svg";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface GradientNode {
  id: number;
  baseX: number;
  baseY: number;
  radius: number;
  color: string;
  speed: number;
  phase: number;
  amplitude: number;
}

interface BreathingGradientMeshProps {
  width?: number;
  height?: number;
  colors?: string[];
  nodeCount?: number;
}

const DEFAULT_COLORS = [
  "#9B59B6", // Purple
  "#E91E63", // Pink
  "#3498DB", // Blue
  "#00BCD4", // Cyan
  "#9C27B0", // Deep Purple
];

export function BreathingGradientMesh({
  width = Dimensions.get("window").width,
  height = Dimensions.get("window").height,
  colors = DEFAULT_COLORS,
  nodeCount = 5,
}: BreathingGradientMeshProps) {
  const nodes = useMemo(() => {
    const result: GradientNode[] = [];
    for (let i = 0; i < nodeCount; i++) {
      result.push({
        id: i,
        baseX: (width / (nodeCount + 1)) * (i + 1) + (Math.random() - 0.5) * (width * 0.3),
        baseY: height * 0.3 + Math.random() * height * 0.4,
        radius: Math.max(width, height) * 0.4 + Math.random() * 100,
        color: colors[i % colors.length],
        speed: 8000 + Math.random() * 6000,
        phase: Math.random() * Math.PI * 2,
        amplitude: 30 + Math.random() * 50,
      });
    }
    return result;
  }, [width, height, nodeCount, colors]);

  const time = useSharedValue(0);
  const breathe = useSharedValue(0);

  useEffect(() => {
    time.value = withRepeat(
      withTiming(Math.PI * 2, { duration: 15000, easing: Easing.linear }),
      -1,
      false
    );
    breathe.value = withRepeat(
      withTiming(1, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  return (
    <View style={[styles.container, { width, height }]}>
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <Defs>
          {nodes.map((node) => (
            <RadialGradient key={`grad-${node.id}`} id={`nodeGrad${node.id}`} cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor={node.color} stopOpacity="0.6" />
              <Stop offset="50%" stopColor={node.color} stopOpacity="0.3" />
              <Stop offset="100%" stopColor={node.color} stopOpacity="0" />
            </RadialGradient>
          ))}
        </Defs>

        <Rect x={0} y={0} width={width} height={height} fill="transparent" />

        {nodes.map((node) => (
          <GradientOrb
            key={node.id}
            node={node}
            time={time}
            breathe={breathe}
          />
        ))}
      </Svg>
    </View>
  );
}

interface GradientOrbProps {
  node: GradientNode;
  time: SharedValue<number>;
  breathe: SharedValue<number>;
}

function GradientOrb({ node, time, breathe }: GradientOrbProps) {
  const animatedProps = useAnimatedProps(() => {
    const x = node.baseX + Math.sin(time.value + node.phase) * node.amplitude;
    const y = node.baseY + Math.cos(time.value * 0.7 + node.phase) * (node.amplitude * 0.8);
    const scale = 0.85 + breathe.value * 0.3;
    const r = node.radius * scale;

    return {
      cx: x,
      cy: y,
      r: r,
    };
  });

  return (
    <AnimatedCircle
      animatedProps={animatedProps}
      fill={`url(#nodeGrad${node.id})`}
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

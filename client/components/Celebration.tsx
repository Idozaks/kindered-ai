import React, { useEffect, useState, useCallback } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  withSpring,
  runOnJS,
  Easing,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { ThemedText } from "./ThemedText";
import { useTheme } from "@/hooks/useTheme";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

interface ConfettiPiece {
  id: number;
  x: number;
  color: string;
  delay: number;
  rotation: number;
  size: number;
}

const CONFETTI_COLORS = [
  "#FF6B6B", "#4ECDC4", "#FFE66D", "#95E1D3", 
  "#F38181", "#AA96DA", "#FCBAD3", "#A8D8EA",
  "#FF9F43", "#54A0FF", "#5F27CD", "#00D2D3",
];

const CONFETTI_COUNT = 50;

const ConfettiPieceComponent = ({ piece }: { piece: ConfettiPiece }) => {
  const translateY = useSharedValue(-50);
  const translateX = useSharedValue(0);
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(1);
  const scale = useSharedValue(0);

  useEffect(() => {
    const randomXOffset = (Math.random() - 0.5) * 200;
    const duration = 2000 + Math.random() * 1500;

    scale.value = withDelay(piece.delay, withSpring(1, { damping: 8 }));
    translateY.value = withDelay(
      piece.delay,
      withTiming(SCREEN_HEIGHT + 100, { duration, easing: Easing.out(Easing.quad) })
    );
    translateX.value = withDelay(
      piece.delay,
      withTiming(randomXOffset, { duration, easing: Easing.inOut(Easing.sin) })
    );
    rotate.value = withDelay(
      piece.delay,
      withTiming(piece.rotation + 720, { duration })
    );
    opacity.value = withDelay(
      piece.delay + duration - 500,
      withTiming(0, { duration: 500 })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { translateX: translateX.value },
      { rotate: `${rotate.value}deg` },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  const isCircle = piece.id % 3 === 0;
  const isSquare = piece.id % 3 === 1;

  return (
    <Animated.View
      style={[
        styles.confettiPiece,
        animatedStyle,
        {
          left: piece.x,
          backgroundColor: piece.color,
          width: piece.size,
          height: isSquare ? piece.size : piece.size * 2,
          borderRadius: isCircle ? piece.size / 2 : isSquare ? 2 : 1,
        },
      ]}
    />
  );
};

interface StarburstProps {
  color: string;
  delay: number;
  x: number;
  y: number;
  size: number;
}

const Starburst = ({ color, delay, x, y, size }: StarburstProps) => {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(1);
  const rotate = useSharedValue(0);

  useEffect(() => {
    scale.value = withDelay(
      delay,
      withSequence(
        withSpring(1.2, { damping: 6 }),
        withTiming(0, { duration: 600 })
      )
    );
    rotate.value = withDelay(delay, withTiming(180, { duration: 800 }));
    opacity.value = withDelay(delay + 400, withTiming(0, { duration: 400 }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { rotate: `${rotate.value}deg` }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.starburst,
        animatedStyle,
        { left: x, top: y, width: size, height: size },
      ]}
    >
      <View style={[styles.starburstRay, { backgroundColor: color }]} />
      <View style={[styles.starburstRay, styles.starburstRay2, { backgroundColor: color }]} />
      <View style={[styles.starburstRay, styles.starburstRay3, { backgroundColor: color }]} />
      <View style={[styles.starburstRay, styles.starburstRay4, { backgroundColor: color }]} />
    </Animated.View>
  );
};

interface CelebrationProps {
  visible: boolean;
  onComplete?: () => void;
  message?: string;
  subMessage?: string;
  type?: "confetti" | "starburst" | "both";
}

export function Celebration({
  visible,
  onComplete,
  message = "מזל טוב!",
  subMessage,
  type = "both",
}: CelebrationProps) {
  const { theme } = useTheme();
  const [confettiPieces, setConfettiPieces] = useState<ConfettiPiece[]>([]);
  const [starbursts, setStarbursts] = useState<StarburstProps[]>([]);
  const messageScale = useSharedValue(0);
  const messageOpacity = useSharedValue(0);

  const handleComplete = useCallback(() => {
    if (onComplete) {
      onComplete();
    }
  }, [onComplete]);

  useEffect(() => {
    if (visible) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      if (type === "confetti" || type === "both") {
        const pieces: ConfettiPiece[] = [];
        for (let i = 0; i < CONFETTI_COUNT; i++) {
          pieces.push({
            id: i,
            x: Math.random() * SCREEN_WIDTH,
            color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
            delay: Math.random() * 300,
            rotation: Math.random() * 360,
            size: 6 + Math.random() * 8,
          });
        }
        setConfettiPieces(pieces);
      }

      if (type === "starburst" || type === "both") {
        const bursts: StarburstProps[] = [];
        for (let i = 0; i < 5; i++) {
          bursts.push({
            color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
            delay: i * 100,
            x: SCREEN_WIDTH * 0.2 + Math.random() * SCREEN_WIDTH * 0.6,
            y: SCREEN_HEIGHT * 0.2 + Math.random() * SCREEN_HEIGHT * 0.3,
            size: 40 + Math.random() * 30,
          });
        }
        setStarbursts(bursts);
      }

      messageScale.value = withDelay(
        200,
        withSequence(
          withSpring(1.2, { damping: 6 }),
          withSpring(1, { damping: 10 })
        )
      );
      messageOpacity.value = withDelay(200, withTiming(1, { duration: 300 }));

      const timer = setTimeout(() => {
        messageOpacity.value = withTiming(0, { duration: 300 });
        messageScale.value = withTiming(0.8, { duration: 300 });
        setTimeout(() => runOnJS(handleComplete)(), 300);
      }, 2500);

      return () => clearTimeout(timer);
    } else {
      setConfettiPieces([]);
      setStarbursts([]);
      messageScale.value = 0;
      messageOpacity.value = 0;
    }
  }, [visible]);

  const messageStyle = useAnimatedStyle(() => ({
    transform: [{ scale: messageScale.value }],
    opacity: messageOpacity.value,
  }));

  if (!visible) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      {confettiPieces.map((piece) => (
        <ConfettiPieceComponent key={piece.id} piece={piece} />
      ))}
      {starbursts.map((burst, index) => (
        <Starburst key={index} {...burst} />
      ))}
      <Animated.View style={[styles.messageContainer, messageStyle]}>
        <View style={[styles.messageBubble, { backgroundColor: theme.backgroundDefault }]}>
          <ThemedText type="h2" style={styles.messageText}>
            {message}
          </ThemedText>
          {subMessage ? (
            <ThemedText type="body" style={[styles.subMessageText, { color: theme.textSecondary }]}>
              {subMessage}
            </ThemedText>
          ) : null}
        </View>
      </Animated.View>
    </View>
  );
}

interface CelebrationContextType {
  celebrate: (options?: {
    message?: string;
    subMessage?: string;
    type?: "confetti" | "starburst" | "both";
  }) => void;
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
  },
  confettiPiece: {
    position: "absolute",
    top: 0,
  },
  starburst: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  starburstRay: {
    position: "absolute",
    width: 4,
    height: "100%",
    borderRadius: 2,
  },
  starburstRay2: {
    transform: [{ rotate: "45deg" }],
  },
  starburstRay3: {
    transform: [{ rotate: "90deg" }],
  },
  starburstRay4: {
    transform: [{ rotate: "135deg" }],
  },
  messageContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  messageBubble: {
    paddingHorizontal: 32,
    paddingVertical: 24,
    borderRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  messageText: {
    textAlign: "center",
  },
  subMessageText: {
    textAlign: "center",
    marginTop: 8,
  },
});

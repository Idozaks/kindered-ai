import React, { useRef } from "react";
import {
  StyleSheet,
  ScrollView,
  View,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";

import { GlassCard } from "@/components/GlassCard";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";

interface Tool {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Feather.glyphMap;
  color: string;
}

interface ToolCarouselProps {
  tools: Tool[];
  onToolPress: (toolId: string) => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = 280;
const CARD_SPACING = Spacing.lg;

export function ToolCarousel({ tools, onToolPress }: ToolCarouselProps) {
  const { theme } = useTheme();
  const scrollX = useSharedValue(0);
  const scrollRef = useRef<ScrollView>(null);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrollX.value = event.nativeEvent.contentOffset.x;
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + CARD_SPACING}
        decelerationRate="fast"
        contentContainerStyle={styles.scrollContent}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {tools.map((tool, index) => (
          <CarouselCard
            key={tool.id}
            tool={tool}
            index={index}
            scrollX={scrollX}
            onPress={() => onToolPress(tool.id)}
          />
        ))}
      </ScrollView>
      <View style={styles.pagination}>
        {tools.map((_, index) => (
          <PaginationDot
            key={index}
            index={index}
            scrollX={scrollX}
            activeColor={theme.primary}
            inactiveColor={theme.glassBorder}
          />
        ))}
      </View>
    </View>
  );
}

interface CarouselCardProps {
  tool: Tool;
  index: number;
  scrollX: Animated.SharedValue<number>;
  onPress: () => void;
}

function CarouselCard({ tool, index, scrollX, onPress }: CarouselCardProps) {
  const { theme } = useTheme();
  const inputRange = [
    (index - 1) * (CARD_WIDTH + CARD_SPACING),
    index * (CARD_WIDTH + CARD_SPACING),
    (index + 1) * (CARD_WIDTH + CARD_SPACING),
  ];

  const animatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      scrollX.value,
      inputRange,
      [0.9, 1, 0.9],
      Extrapolation.CLAMP
    );
    const opacity = interpolate(
      scrollX.value,
      inputRange,
      [0.6, 1, 0.6],
      Extrapolation.CLAMP
    );
    return {
      transform: [{ scale }],
      opacity,
    };
  });

  return (
    <Animated.View style={[styles.cardWrapper, animatedStyle]}>
      <GlassCard
        large
        title={tool.title}
        description={tool.description}
        onPress={onPress}
        icon={
          <View style={[styles.iconBg, { backgroundColor: tool.color + "20" }]}>
            <Feather name={tool.icon} size={32} color={tool.color} />
          </View>
        }
        testID={`tool-card-${tool.id}`}
      />
    </Animated.View>
  );
}

interface PaginationDotProps {
  index: number;
  scrollX: Animated.SharedValue<number>;
  activeColor: string;
  inactiveColor: string;
}

function PaginationDot({
  index,
  scrollX,
  activeColor,
  inactiveColor,
}: PaginationDotProps) {
  const inputRange = [
    (index - 1) * (CARD_WIDTH + CARD_SPACING),
    index * (CARD_WIDTH + CARD_SPACING),
    (index + 1) * (CARD_WIDTH + CARD_SPACING),
  ];

  const animatedStyle = useAnimatedStyle(() => {
    const width = interpolate(
      scrollX.value,
      inputRange,
      [8, 24, 8],
      Extrapolation.CLAMP
    );
    const opacity = interpolate(
      scrollX.value,
      inputRange,
      [0.4, 1, 0.4],
      Extrapolation.CLAMP
    );
    return {
      width,
      opacity,
      backgroundColor: activeColor,
    };
  });

  return <Animated.View style={[styles.dot, animatedStyle]} />;
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.xl,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    gap: CARD_SPACING,
  },
  cardWrapper: {
    width: CARD_WIDTH,
  },
  iconBg: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: Spacing.lg,
    gap: Spacing.sm,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
});

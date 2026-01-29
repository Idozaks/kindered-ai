import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, View, ScrollView, Pressable } from "react-native";
import Animated, { FadeIn, FadeOut, useAnimatedStyle, withSpring, useSharedValue } from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

interface AuraLiveTranscriptProps {
  text: string;
  isVisible?: boolean;
}

export function AuraLiveTranscript({ text, isVisible = true }: AuraLiveTranscriptProps) {
  const { theme, isDark } = useTheme();
  const scrollViewRef = useRef<ScrollView>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const expandHeight = useSharedValue(100);

  useEffect(() => {
    if (text && scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [text]);

  const handleExpand = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsExpanded(!isExpanded);
    expandHeight.value = withSpring(isExpanded ? 100 : 250, { damping: 15 });
  };

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    maxHeight: expandHeight.value,
  }));

  if (!isVisible || !text) {
    return null;
  }

  const bgColor = isDark ? "rgba(30, 30, 35, 0.95)" : "rgba(255, 255, 255, 0.98)";
  const textColor = isDark ? "#FFFFFF" : "#1A1A1A";

  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      exiting={FadeOut.duration(300)}
      style={[
        styles.container,
        containerAnimatedStyle,
        {
          backgroundColor: bgColor,
          borderColor: theme.glassBorder,
        },
      ]}
    >
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ThemedText style={[styles.text, { color: textColor }]}>
          {text}
        </ThemedText>
      </ScrollView>
      
      <Pressable
        onPress={handleExpand}
        style={[styles.expandButton, { backgroundColor: theme.primary + "20" }]}
        hitSlop={8}
        testID="transcript-expand-button"
      >
        <Feather
          name={isExpanded ? "chevron-up" : "chevron-down"}
          size={18}
          color={theme.primary}
        />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    paddingBottom: Spacing.xl + 8,
    minHeight: 60,
    position: "relative",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: Spacing.sm,
  },
  text: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: "500",
  },
  expandButton: {
    position: "absolute",
    bottom: 8,
    alignSelf: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
});

import React, { useEffect, useRef } from "react";
import { StyleSheet, View, ScrollView } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

interface AuraLiveTranscriptProps {
  text: string;
  isVisible?: boolean;
}

export function AuraLiveTranscript({ text, isVisible = true }: AuraLiveTranscriptProps) {
  const { theme } = useTheme();
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (text && scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [text]);

  if (!isVisible || !text) {
    return null;
  }

  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      exiting={FadeOut.duration(300)}
      style={[
        styles.container,
        {
          backgroundColor: theme.glassBg,
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
        <ThemedText style={[styles.text, { color: theme.text }]}>
          {text}
        </ThemedText>
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    maxHeight: 100,
    minHeight: 60,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  text: {
    fontSize: 18,
    lineHeight: 26,
  },
});

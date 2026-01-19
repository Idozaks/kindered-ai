import React, { useState, useCallback } from "react";
import { StyleSheet, View, ScrollView, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useTranslation } from "react-i18next";
import Animated, {
  FadeInDown,
  FadeInUp,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { ToolCarousel } from "@/components/ToolCarousel";
import { ToolGrid } from "@/components/ToolGrid";
import { FloatingMicButton } from "@/components/FloatingMicButton";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [isListening, setIsListening] = useState(false);

  const primaryTools = [
    {
      id: "grandchild",
      title: t("tools.grandchild.title"),
      description: t("tools.grandchild.description"),
      icon: "monitor" as const,
      color: theme.primary,
    },
    {
      id: "letter",
      title: t("tools.letter.title"),
      description: t("tools.letter.description"),
      icon: "file-text" as const,
      color: "#F4B942",
    },
  ];

  const secondaryTools = [
    {
      id: "mirror",
      title: t("tools.mirror.title"),
      description: t("tools.mirror.description"),
      icon: "play-circle" as const,
      color: "#9B59B6",
    },
  ];

  const handleToolPress = useCallback(
    (toolId: string) => {
      switch (toolId) {
        case "grandchild":
          navigation.navigate("GrandchildMode");
          break;
        case "letter":
          navigation.navigate("LetterHelper");
          break;
        case "mirror":
          navigation.navigate("MirrorWorld");
          break;
      }
    },
    [navigation]
  );

  const handleMicPress = () => {
    setIsListening(!isListening);
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: headerHeight + Spacing.xl,
            paddingBottom: insets.bottom + 120,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          entering={FadeInDown.delay(100).duration(600)}
          style={styles.header}
        >
          <View style={styles.greetingRow}>
            <Image
              source={require("../../assets/images/icon.png")}
              style={styles.logo}
              resizeMode="contain"
            />
            <View>
              <ThemedText type="h2" style={styles.greeting}>
                {t("dashboard.greeting")}
              </ThemedText>
              <ThemedText
                type="body"
                style={[styles.subtitle, { color: theme.textSecondary }]}
              >
                {t("dashboard.subtitle")}
              </ThemedText>
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(200).duration(600)}>
          <ToolCarousel tools={primaryTools} onToolPress={handleToolPress} />
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(400).duration(600)}>
          <ThemedText
            type="h4"
            style={[styles.sectionTitle, { paddingHorizontal: Spacing.lg }]}
          >
            More Tools
          </ThemedText>
          <ToolGrid tools={secondaryTools} onToolPress={handleToolPress} />
        </Animated.View>
      </ScrollView>

      <FloatingMicButton
        onPress={handleMicPress}
        isListening={isListening}
        testID="floating-mic-button"
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing["2xl"],
  },
  greetingRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  logo: {
    width: 56,
    height: 56,
    marginRight: Spacing.md,
  },
  greeting: {
    marginBottom: Spacing.xs,
  },
  subtitle: {
    opacity: 0.8,
  },
  sectionTitle: {
    marginBottom: Spacing.lg,
  },
});

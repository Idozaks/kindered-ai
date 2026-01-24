import React, { useState, useCallback, useMemo } from "react";
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
import { ToolGrid } from "@/components/ToolGrid";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

// Import tool icons
// @ts-ignore
import monitorIcon from "@/assets/images/monitor-tool.png";
// @ts-ignore
import letterIcon from "@/assets/images/letter-tool.png";
// @ts-ignore
import mirrorIcon from "@/assets/images/mirror-tool.png";
// @ts-ignore
import whatsappIcon from "@/assets/images/whatsapp-tool.png";
// @ts-ignore
import gmailIcon from "@/assets/images/gmail-tool.png";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [isListening, setIsListening] = useState(false);

  // Get random subtitle from the corpus
  const randomSubtitle = useMemo(() => {
    const subtitles = t("dashboard.subtitles", { returnObjects: true }) as string[];
    if (Array.isArray(subtitles) && subtitles.length > 0) {
      const randomIndex = Math.floor(Math.random() * subtitles.length);
      return subtitles[randomIndex];
    }
    return t("dashboard.subtitle");
  }, [t]);

  const tools = [
    {
      id: "grandchild",
      title: t("tools.grandchild.title"),
      description: t("tools.grandchild.description"),
      image: monitorIcon,
      color: theme.primary,
    },
    {
      id: "letter",
      title: t("tools.letter.title"),
      description: t("tools.letter.description"),
      image: letterIcon,
      color: "#F4B942",
    },
    {
      id: "mirror",
      title: t("tools.mirror.title"),
      description: t("tools.mirror.description"),
      image: mirrorIcon,
      color: "#9B59B6",
    },
    {
      id: "whatsapp",
      title: t("tools.whatsapp.title"),
      description: t("tools.whatsapp.description"),
      image: whatsappIcon,
      color: "#25D366",
    },
    {
      id: "gmail",
      title: t("tools.gmail.title"),
      description: t("tools.gmail.description"),
      image: gmailIcon,
      color: "#EA4335",
    },
    {
      id: "grandchildren",
      title: t("tools.grandchildren.title"),
      description: t("tools.grandchildren.description"),
      image: monitorIcon,
      color: "#E91E63",
    },
    {
      id: "websiteHelper",
      title: t("tools.websiteHelper.title"),
      description: t("tools.websiteHelper.description"),
      image: monitorIcon,
      color: "#4285F4",
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
        case "whatsapp":
          navigation.navigate("WhatsAppGuides");
          break;
        case "gmail":
          navigation.navigate("GmailGuides");
          break;
        case "grandchildren":
          navigation.navigate("GrandchildrenGuides");
          break;
        case "websiteHelper":
          navigation.navigate("WebsiteHelper");
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
            paddingBottom: insets.bottom + Spacing.xl,
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
                {randomSubtitle}
              </ThemedText>
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(200).duration(600)}>
          <ThemedText
            type="h4"
            style={[styles.sectionTitle, { paddingHorizontal: Spacing.lg }]}
          >
            Your Tools
          </ThemedText>
          <ToolGrid tools={tools} onToolPress={handleToolPress} />
        </Animated.View>
      </ScrollView>
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

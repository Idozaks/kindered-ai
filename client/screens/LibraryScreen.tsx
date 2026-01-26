import React, { useCallback } from "react";
import { StyleSheet, View, ScrollView, Pressable, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useTranslation } from "react-i18next";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { GlassCard } from "@/components/GlassCard";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Typography } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface LibraryItem {
  id: string;
  titleKey: string;
  descriptionKey: string;
  icon: keyof typeof Feather.glyphMap;
  color: string;
  screen: keyof RootStackParamList;
}

const libraryItems: LibraryItem[] = [
  {
    id: "ai",
    titleKey: "tools.ai.title",
    descriptionKey: "tools.ai.description",
    icon: "cpu",
    color: "#6C63FF",
    screen: "AIGuides",
  },
  {
    id: "whatsapp",
    titleKey: "tools.whatsapp.title",
    descriptionKey: "tools.whatsapp.description",
    icon: "message-circle",
    color: "#25D366",
    screen: "WhatsAppGuides",
  },
  {
    id: "gmail",
    titleKey: "tools.gmail.title",
    descriptionKey: "tools.gmail.description",
    icon: "mail",
    color: "#EA4335",
    screen: "GmailGuides",
  },
  {
    id: "grandchildren",
    titleKey: "tools.grandchildren.title",
    descriptionKey: "tools.grandchildren.description",
    icon: "heart",
    color: "#E91E63",
    screen: "GrandchildrenGuides",
  },
];

export default function LibraryScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();
  const { t } = useTranslation();

  const handleItemPress = useCallback(
    (screen: keyof RootStackParamList) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      navigation.navigate(screen as any);
    },
    [navigation]
  );

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: headerHeight + Spacing.xl,
            paddingBottom: insets.bottom + Spacing["3xl"],
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          entering={FadeInDown.delay(100).duration(500)}
          style={styles.header}
        >
          <View style={[styles.iconContainer, { backgroundColor: theme.primary }]}>
            <Feather name="book-open" size={32} color="#FFFFFF" />
          </View>
          <ThemedText type="body" style={[styles.subtitle, { color: theme.textSecondary }]}>
            {t("library.subtitle")}
          </ThemedText>
        </Animated.View>

        <View style={styles.itemsContainer}>
          {libraryItems.map((item, index) => (
            <Animated.View
              key={item.id}
              entering={FadeInDown.delay(200 + index * 100).duration(500)}
            >
              <GlassCard 
                style={styles.itemCard}
                onPress={() => handleItemPress(item.screen)}
                testID={`library-item-${item.id}`}
              >
                  <View style={[styles.itemIcon, { backgroundColor: item.color + "20" }]}>
                    <Feather name={item.icon} size={28} color={item.color} />
                  </View>
                  <View style={styles.itemContent}>
                    <Text style={[styles.itemTitle, { color: theme.text }]}>
                      {t(item.titleKey)}
                    </Text>
                    <Text style={[styles.itemDescription, { color: theme.textSecondary }]}>
                      {t(item.descriptionKey)}
                    </Text>
                  </View>
                  <Feather name="chevron-left" size={24} color={theme.textSecondary} />
              </GlassCard>
            </Animated.View>
          ))}
        </View>

        <Animated.View
          entering={FadeInDown.delay(600).duration(500)}
          style={styles.comingSoon}
        >
          <ThemedText type="small" style={{ color: theme.textSecondary, textAlign: "center" }}>
            {t("library.comingSoon")}
          </ThemedText>
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
    paddingHorizontal: Spacing.lg,
  },
  header: {
    alignItems: "center",
    marginBottom: Spacing["2xl"],
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: BorderRadius.xl,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
  },
  subtitle: {
    textAlign: "center",
    maxWidth: 280,
  },
  itemsContainer: {
    gap: Spacing.md,
  },
  itemPressable: {
    borderRadius: BorderRadius.lg,
  },
  itemPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  itemCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  itemIcon: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    ...Typography.h4,
    marginBottom: Spacing.xs,
  },
  itemDescription: {
    ...Typography.small,
  },
  comingSoon: {
    marginTop: Spacing["3xl"],
    paddingHorizontal: Spacing.xl,
  },
});

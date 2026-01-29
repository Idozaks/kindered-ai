import React, { useCallback, useEffect, useState } from "react";
import { StyleSheet, View, ScrollView, Text, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useTranslation } from "react-i18next";
import { Feather } from "@expo/vector-icons";
import Animated, { 
  FadeInDown, 
  useAnimatedStyle, 
  useSharedValue, 
  withRepeat, 
  withTiming,
  Easing,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { GlassCard } from "@/components/GlassCard";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Typography } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

const QUIZ_RESULT_KEY = "@dori_quiz_result";

interface QuizResult {
  evaluation: {
    scores: {
      smartphone: number;
      whatsapp: number;
      safety: number;
      overall: number;
    };
    recommendedPath: {
      titleHe: string;
      icon: string;
      color: string;
    };
  };
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

function BreathingChevron({ color }: { color: string }) {
  const opacity = useSharedValue(0.4);
  const scale = useSharedValue(1);
  
  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.9, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
    scale.value = withRepeat(
      withTiming(1.1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);
  
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));
  
  return (
    <Animated.View style={[styles.chevronContainer, animatedStyle]}>
      <Feather name="chevron-left" size={32} color={color} />
    </Animated.View>
  );
}

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
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);

  useEffect(() => {
    const loadQuizResult = async () => {
      try {
        const saved = await AsyncStorage.getItem(QUIZ_RESULT_KEY);
        if (saved) {
          setQuizResult(JSON.parse(saved));
        }
      } catch (error) {
        console.error("Failed to load quiz result:", error);
      }
    };
    loadQuizResult();
  }, []);

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

        {quizResult ? (
          <Animated.View
            entering={FadeInDown.delay(150).duration(500)}
            style={[styles.knowledgeCard, { backgroundColor: theme.glassBg, borderColor: theme.glassBorder }]}
          >
            <View style={styles.knowledgeHeader}>
              <View style={[styles.knowledgeIcon, { backgroundColor: quizResult.evaluation.recommendedPath.color + "20" }]}>
                <Feather 
                  name={quizResult.evaluation.recommendedPath.icon as any} 
                  size={24} 
                  color={quizResult.evaluation.recommendedPath.color} 
                />
              </View>
              <View style={styles.knowledgeHeaderText}>
                <ThemedText type="h4">הרמה שלי</ThemedText>
                <ThemedText type="small" style={{ color: quizResult.evaluation.recommendedPath.color }}>
                  {quizResult.evaluation.recommendedPath.titleHe}
                </ThemedText>
              </View>
            </View>
            <View style={styles.scoresRow}>
              <View style={styles.scoreItem}>
                <Feather name="smartphone" size={16} color={theme.primary} />
                <ThemedText type="small" style={{ color: theme.primary, fontWeight: "600" }}>
                  {quizResult.evaluation.scores.smartphone}%
                </ThemedText>
              </View>
              <View style={styles.scoreItem}>
                <Feather name="message-circle" size={16} color="#25D366" />
                <ThemedText type="small" style={{ color: "#25D366", fontWeight: "600" }}>
                  {quizResult.evaluation.scores.whatsapp}%
                </ThemedText>
              </View>
              <View style={styles.scoreItem}>
                <Feather name="shield" size={16} color="#FF5722" />
                <ThemedText type="small" style={{ color: "#FF5722", fontWeight: "600" }}>
                  {quizResult.evaluation.scores.safety}%
                </ThemedText>
              </View>
            </View>
          </Animated.View>
        ) : (
          <Animated.View entering={FadeInDown.delay(150).duration(500)}>
            <Pressable
              style={[styles.quizPrompt, { backgroundColor: theme.primary + "15", borderColor: theme.primary + "30" }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                navigation.navigate("LearningPathQuiz");
              }}
            >
              <Feather name="clipboard" size={20} color={theme.primary} />
              <ThemedText type="body" style={{ color: theme.primary, flex: 1 }}>
                ענה על שאלון קצר כדי לקבל המלצות מותאמות אישית
              </ThemedText>
              <Feather name="arrow-left" size={20} color={theme.primary} />
            </Pressable>
          </Animated.View>
        )}

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
                  <BreathingChevron color={item.color} />
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
  chevronContainer: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  knowledgeCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.xl,
  },
  knowledgeHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  knowledgeIcon: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  knowledgeHeaderText: {
    flex: 1,
  },
  scoresRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: "rgba(128, 128, 128, 0.1)",
  },
  scoreItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  quizPrompt: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
});

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  I18nManager,
} from "react-native";
import { BlurView } from "expo-blur";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Speech from "expo-speech";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  withTiming,
  withDelay,
  FadeIn,
  FadeOut,
  SlideInRight,
  SlideOutLeft,
  runOnJS,
} from "react-native-reanimated";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useMutation } from "@tanstack/react-query";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { GlassCard } from "@/components/GlassCard";
import { useTheme } from "@/hooks/useTheme";
import { useCelebration } from "@/contexts/CelebrationContext";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { quizQuestions, QuizQuestion } from "@/data/quizQuestions";
import { MainStackParamList } from "@/navigation/RootStackNavigator";
import { apiRequest, getApiUrl } from "@/lib/query-client";

type NavigationProp = NativeStackNavigationProp<MainStackParamList>;

interface QuizAnswer {
  questionId: string;
  category: "smartphone" | "whatsapp" | "safety";
  selectedOption: number;
  isCorrect: boolean;
}

interface EvaluationResult {
  evaluation: {
    id: string;
    scores: {
      smartphone: number;
      whatsapp: number;
      safety: number;
      overall: number;
    };
    recommendedPath: {
      id: string;
      titleHe: string;
      titleEn: string;
      descriptionHe: string;
      icon: string;
      color: string;
      journeys: string[];
    };
    reasoning: string;
    strengths: string[];
    areasToImprove: string[];
  };
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function LearningPathQuizScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { theme, isDark } = useTheme();
  const { celebrate } = useCelebration();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isNarrating, setIsNarrating] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [shuffledQuestions, setShuffledQuestions] = useState<QuizQuestion[]>([]);

  const progressScale = useSharedValue(0);
  const questionOpacity = useSharedValue(1);

  useEffect(() => {
    const shuffled = [...quizQuestions].sort(() => Math.random() - 0.5).slice(0, 5);
    setShuffledQuestions(shuffled);
  }, []);

  const currentQuestion = shuffledQuestions[currentQuestionIndex];

  const evaluateMutation = useMutation({
    mutationFn: async (quizAnswers: QuizAnswer[]) => {
      const response = await apiRequest("POST", "/api/evaluate", { answers: quizAnswers });
      return response.json();
    },
    onSuccess: (data: EvaluationResult) => {
      setResult(data);
      setShowResult(true);
      celebrate({
        message: "סיימת את השאלון!",
        subMessage: `מסלול הלמידה שלך: ${data.evaluation.recommendedPath.titleHe}`,
        type: "both",
      });
    },
    onError: (error) => {
      console.error("Evaluation failed:", error);
    },
  });

  useEffect(() => {
    progressScale.value = withSpring(
      (currentQuestionIndex + 1) / shuffledQuestions.length,
      { damping: 15 }
    );
  }, [currentQuestionIndex, shuffledQuestions.length]);

  const narrateQuestion = useCallback(() => {
    if (!currentQuestion) return;

    setIsNarrating(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const text = `${currentQuestion.questionHe}. ${currentQuestion.optionsHe
      .map((opt, i) => `אפשרות ${i + 1}: ${opt}`)
      .join(". ")}`;

    Speech.speak(text, {
      language: "he-IL",
      rate: 0.85,
      onDone: () => setIsNarrating(false),
      onStopped: () => setIsNarrating(false),
      onError: () => setIsNarrating(false),
    });
  }, [currentQuestion]);

  const stopNarration = useCallback(() => {
    Speech.stop();
    setIsNarrating(false);
  }, []);

  const handleOptionSelect = useCallback(
    (optionIndex: number) => {
      if (!currentQuestion) return;

      setSelectedOption(optionIndex);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const isCorrect = optionIndex === currentQuestion.correctIndex;
      
      if (isCorrect) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      const answer: QuizAnswer = {
        questionId: currentQuestion.id,
        category: currentQuestion.category,
        selectedOption: optionIndex,
        isCorrect,
      };

      setAnswers((prev) => [...prev, answer]);

      setTimeout(() => {
        if (currentQuestionIndex < shuffledQuestions.length - 1) {
          questionOpacity.value = withTiming(0, { duration: 200 }, () => {
            runOnJS(setCurrentQuestionIndex)(currentQuestionIndex + 1);
            runOnJS(setSelectedOption)(null);
            questionOpacity.value = withTiming(1, { duration: 200 });
          });
        } else {
          const allAnswers = [...answers, answer];
          evaluateMutation.mutate(allAnswers);
        }
      }, 800);
    },
    [currentQuestion, currentQuestionIndex, shuffledQuestions.length, answers, evaluateMutation]
  );

  const progressAnimatedStyle = useAnimatedStyle(() => ({
    width: `${progressScale.value * 100}%`,
  }));

  const questionAnimatedStyle = useAnimatedStyle(() => ({
    opacity: questionOpacity.value,
  }));

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "smartphone":
        return "smartphone";
      case "whatsapp":
        return "message-circle";
      case "safety":
        return "shield";
      default:
        return "help-circle";
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "smartphone":
        return "ניווט בסמארטפון";
      case "whatsapp":
        return "שימוש בוואטסאפ";
      case "safety":
        return "בטיחות דיגיטלית";
      default:
        return "";
    }
  };

  if (shuffledQuestions.length === 0) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.primary} />
      </ThemedView>
    );
  }

  if (showResult && result) {
    return (
      <ThemedView style={styles.container}>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: headerHeight + Spacing.xl, paddingBottom: insets.bottom + Spacing.xl },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View entering={FadeIn.duration(500)} style={styles.resultContainer}>
            <View style={[styles.resultHeader, { backgroundColor: result.evaluation.recommendedPath.color + "20" }]}>
              <View style={[styles.resultIconCircle, { backgroundColor: result.evaluation.recommendedPath.color }]}>
                <Feather
                  name={result.evaluation.recommendedPath.icon as any}
                  size={40}
                  color="#FFFFFF"
                />
              </View>
              <ThemedText type="h2" style={styles.resultTitle}>
                {result.evaluation.recommendedPath.titleHe}
              </ThemedText>
              <ThemedText type="body" style={[styles.resultDescription, { color: theme.textSecondary }]}>
                {result.evaluation.recommendedPath.descriptionHe}
              </ThemedText>
            </View>

            <View style={styles.scoresContainer}>
              <ThemedText type="h4" style={styles.sectionTitle}>
                הציונים שלך
              </ThemedText>
              <View style={styles.scoreRow}>
                <View style={styles.scoreItem}>
                  <Feather name="smartphone" size={24} color={theme.primary} />
                  <ThemedText type="h3" style={{ color: theme.primary }}>
                    {result.evaluation.scores.smartphone}%
                  </ThemedText>
                  <ThemedText type="small" style={{ color: theme.textSecondary }}>
                    סמארטפון
                  </ThemedText>
                </View>
                <View style={styles.scoreItem}>
                  <Feather name="message-circle" size={24} color="#25D366" />
                  <ThemedText type="h3" style={{ color: "#25D366" }}>
                    {result.evaluation.scores.whatsapp}%
                  </ThemedText>
                  <ThemedText type="small" style={{ color: theme.textSecondary }}>
                    וואטסאפ
                  </ThemedText>
                </View>
                <View style={styles.scoreItem}>
                  <Feather name="shield" size={24} color="#FF5722" />
                  <ThemedText type="h3" style={{ color: "#FF5722" }}>
                    {result.evaluation.scores.safety}%
                  </ThemedText>
                  <ThemedText type="small" style={{ color: theme.textSecondary }}>
                    בטיחות
                  </ThemedText>
                </View>
              </View>
            </View>

            <View style={styles.reasoningContainer}>
              <ThemedText type="h4" style={styles.sectionTitle}>
                המלצה אישית
              </ThemedText>
              <ThemedText type="body" style={[styles.reasoning, { color: theme.textSecondary }]}>
                {result.evaluation.reasoning}
              </ThemedText>
            </View>

            {result.evaluation.strengths.length > 0 ? (
              <View style={styles.listContainer}>
                <ThemedText type="h4" style={styles.sectionTitle}>
                  החוזקות שלך
                </ThemedText>
                {result.evaluation.strengths.map((strength, index) => (
                  <View key={index} style={styles.listItem}>
                    <Feather name="check-circle" size={20} color={theme.success} />
                    <ThemedText type="body" style={styles.listText}>
                      {strength}
                    </ThemedText>
                  </View>
                ))}
              </View>
            ) : null}

            {result.evaluation.areasToImprove.length > 0 ? (
              <View style={styles.listContainer}>
                <ThemedText type="h4" style={styles.sectionTitle}>
                  תחומים לשיפור
                </ThemedText>
                {result.evaluation.areasToImprove.map((area, index) => (
                  <View key={index} style={styles.listItem}>
                    <Feather name="arrow-up-circle" size={20} color={theme.warning} />
                    <ThemedText type="body" style={styles.listText}>
                      {area}
                    </ThemedText>
                  </View>
                ))}
              </View>
            ) : null}

            <Pressable
              style={[styles.startButton, { backgroundColor: theme.primary }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                navigation.navigate("Dashboard");
              }}
            >
              <ThemedText type="h4" style={styles.startButtonText}>
                התחל ללמוד!
              </ThemedText>
              <Feather name="arrow-left" size={24} color="#FFFFFF" />
            </Pressable>
          </Animated.View>
        </ScrollView>
      </ThemedView>
    );
  }

  if (evaluateMutation.isPending) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          <Animated.View
            entering={FadeIn}
            style={[styles.loadingIcon, { backgroundColor: theme.primary + "20" }]}
          >
            <Feather name="cpu" size={48} color={theme.primary} />
          </Animated.View>
          <ThemedText type="h3" style={styles.loadingTitle}>
            מעבד את התשובות...
          </ThemedText>
          <ThemedText type="body" style={[styles.loadingSubtitle, { color: theme.textSecondary }]}>
            דורי מכינה מסלול למידה מותאם אישית
          </ThemedText>
          <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: Spacing.xl }} />
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: headerHeight + Spacing.lg, paddingBottom: insets.bottom + Spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <ThemedText type="body" style={{ color: theme.textSecondary }}>
              שאלה {currentQuestionIndex + 1} מתוך {shuffledQuestions.length}
            </ThemedText>
            <Pressable
              onPress={isNarrating ? stopNarration : narrateQuestion}
              style={[
                styles.narrateButton,
                { backgroundColor: isNarrating ? theme.primary : theme.glassBg },
              ]}
            >
              <Feather
                name={isNarrating ? "volume-x" : "volume-2"}
                size={24}
                color={isNarrating ? "#FFFFFF" : theme.primary}
              />
            </Pressable>
          </View>
          <View style={[styles.progressBar, { backgroundColor: theme.border }]}>
            <Animated.View
              style={[
                styles.progressFill,
                { backgroundColor: theme.primary },
                progressAnimatedStyle,
              ]}
            />
          </View>
        </View>

        <Animated.View style={[styles.questionSection, questionAnimatedStyle]}>
          <View style={styles.categoryBadge}>
            <Feather name={getCategoryIcon(currentQuestion?.category || "")} size={16} color={theme.primary} />
            <ThemedText type="small" style={{ color: theme.primary, marginStart: Spacing.xs }}>
              {getCategoryLabel(currentQuestion?.category || "")}
            </ThemedText>
          </View>

          <ThemedText type="h2" style={styles.questionText}>
            {currentQuestion?.questionHe}
          </ThemedText>

          <View style={styles.optionsContainer}>
            {currentQuestion?.optionsHe.map((option, index) => {
              const isSelected = selectedOption === index;
              const isCorrect = index === currentQuestion.correctIndex;
              const showCorrectness = selectedOption !== null;

              let optionStyle = {};
              let iconName: any = null;
              let iconColor = "";

              if (showCorrectness) {
                if (isSelected && isCorrect) {
                  optionStyle = { backgroundColor: theme.success + "30", borderColor: theme.success };
                  iconName = "check-circle";
                  iconColor = theme.success;
                } else if (isSelected && !isCorrect) {
                  optionStyle = { backgroundColor: theme.danger + "30", borderColor: theme.danger };
                  iconName = "x-circle";
                  iconColor = theme.danger;
                } else if (isCorrect) {
                  optionStyle = { backgroundColor: theme.success + "20", borderColor: theme.success };
                  iconName = "check-circle";
                  iconColor = theme.success;
                }
              }

              return (
                <AnimatedPressable
                  key={index}
                  entering={FadeIn.delay(index * 100)}
                  onPress={() => selectedOption === null && handleOptionSelect(index)}
                  disabled={selectedOption !== null}
                  style={[
                    styles.optionCard,
                    {
                      backgroundColor: theme.glassBg,
                      borderColor: isSelected ? theme.primary : theme.glassBorder,
                    },
                    optionStyle,
                  ]}
                >
                  <BlurView
                    intensity={isDark ? 30 : 50}
                    tint={isDark ? "dark" : "light"}
                    style={StyleSheet.absoluteFill}
                  />
                  <View style={styles.optionContent}>
                    <View
                      style={[
                        styles.optionNumber,
                        {
                          backgroundColor: isSelected ? theme.primary : theme.primary + "20",
                        },
                      ]}
                    >
                      <ThemedText
                        type="h4"
                        style={{ color: isSelected ? "#FFFFFF" : theme.primary }}
                      >
                        {index + 1}
                      </ThemedText>
                    </View>
                    <ThemedText type="body" style={styles.optionText}>
                      {option}
                    </ThemedText>
                    {iconName ? (
                      <Feather name={iconName} size={24} color={iconColor} />
                    ) : null}
                  </View>
                </AnimatedPressable>
              );
            })}
          </View>

          {selectedOption !== null ? (
            <Animated.View entering={FadeIn} style={styles.explanationContainer}>
              <View style={[styles.explanationCard, { backgroundColor: theme.primary + "15" }]}>
                <Feather name="info" size={20} color={theme.primary} />
                <ThemedText type="body" style={[styles.explanationText, { color: theme.textSecondary }]}>
                  {currentQuestion?.explanationHe}
                </ThemedText>
              </View>
            </Animated.View>
          ) : null}
        </Animated.View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContent: {
    alignItems: "center",
    padding: Spacing["2xl"],
  },
  loadingIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  loadingTitle: {
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  loadingSubtitle: {
    textAlign: "center",
  },
  scrollContent: {
    padding: Spacing.lg,
  },
  progressSection: {
    marginBottom: Spacing.xl,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  narrateButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    ...Shadows.glass,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  questionSection: {
    flex: 1,
  },
  categoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    backgroundColor: "rgba(107, 45, 139, 0.1)",
    marginBottom: Spacing.lg,
  },
  questionText: {
    marginBottom: Spacing.xl,
    textAlign: I18nManager.isRTL ? "right" : "left",
    lineHeight: 36,
  },
  optionsContainer: {
    gap: Spacing.md,
  },
  optionCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    overflow: "hidden",
    ...Shadows.glass,
  },
  optionContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  optionNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  optionText: {
    flex: 1,
    textAlign: I18nManager.isRTL ? "right" : "left",
  },
  explanationContainer: {
    marginTop: Spacing.xl,
  },
  explanationCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    gap: Spacing.md,
  },
  explanationText: {
    flex: 1,
  },
  resultContainer: {
    flex: 1,
  },
  resultHeader: {
    alignItems: "center",
    padding: Spacing["2xl"],
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.xl,
  },
  resultIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.lg,
    ...Shadows.glass,
  },
  resultTitle: {
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  resultDescription: {
    textAlign: "center",
  },
  scoresContainer: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  scoreRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  scoreItem: {
    alignItems: "center",
    gap: Spacing.xs,
  },
  reasoningContainer: {
    marginBottom: Spacing.xl,
  },
  reasoning: {
    lineHeight: 26,
  },
  listContainer: {
    marginBottom: Spacing.xl,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  listText: {
    flex: 1,
  },
  startButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    gap: Spacing.md,
    marginTop: Spacing.lg,
    ...Shadows.glass,
  },
  startButtonText: {
    color: "#FFFFFF",
  },
});

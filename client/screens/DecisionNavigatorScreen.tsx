import React, { useState } from "react";
import { StyleSheet, View, TextInput, FlatList, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useTranslation } from "react-i18next";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInDown, FadeInUp, Layout } from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { GlassCard } from "@/components/GlassCard";
import { GlassButton } from "@/components/GlassButton";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { PathStep } from "@/lib/storage";

interface GeneratedPath {
  title: string;
  steps: PathStep[];
}

const EXAMPLE_PATHS: Record<string, GeneratedPath> = {
  passport: {
    title: "Renew My Passport",
    steps: [
      {
        id: "1",
        title: "Gather your documents",
        description: "Find your current passport, a recent photo, and ID card",
        doriAdvice:
          "Think of it like packing for a trip - you need your travel papers, a nice picture of yourself, and proof of who you are.",
        hasSandbox: false,
      },
      {
        id: "2",
        title: "Fill out the application",
        description: "Complete the renewal form online or on paper",
        doriAdvice:
          "It's like filling out a form at the doctor's office - just your basic information. Take your time, there's no rush.",
        hasSandbox: true,
      },
      {
        id: "3",
        title: "Schedule an appointment",
        description: "Book a time at your local passport office",
        doriAdvice:
          "Just like making a hair appointment - call ahead and pick a time that works for you.",
        hasSandbox: true,
      },
      {
        id: "4",
        title: "Pay the fee",
        description: "Pay the renewal fee online or at the office",
        doriAdvice:
          "It's a one-time payment, like paying for a bus pass. You can use a card or cash at the office.",
        hasSandbox: true,
      },
      {
        id: "5",
        title: "Collect your new passport",
        description: "Pick up your passport or have it mailed to you",
        doriAdvice:
          "Just like getting a package - either go pick it up or wait for the mailman!",
        hasSandbox: false,
      },
    ],
  },
};

import i18n from "@/lib/i18n";
import { apiRequest } from "@/lib/query-client";

export default function DecisionNavigatorScreen() {
  const isRTL = i18n.language === "he";
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [currentPath, setCurrentPath] = useState<GeneratedPath | null>(null);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [expandedStep, setExpandedStep] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!query.trim()) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsLoading(true);

    // Call Gemini AI for structured steps
    try {
      const response = await apiRequest("POST", "/api/ai/decision-help", {
        goal: query,
        language: i18n.language,
      });
      const data = await response.json();
      
      // Use structured JSON if available from Gemini
      if (data.structured?.steps && Array.isArray(data.structured.steps)) {
        const aiSteps = data.structured.steps.map((step: { title: string; description: string; tip: string; icon?: string }, index: number) => ({
          id: String(index + 1),
          title: step.title,
          description: step.description,
          doriAdvice: step.tip,
          hasSandbox: false,
          icon: step.icon || "check-circle",
        }));
        
        setCurrentPath({
          title: query,
          steps: aiSteps,
        });
      } else {
        // Fallback: parse numbered list from plain text response
        const aiSteps = data.response.split('\n')
          .filter((line: string) => line.trim().match(/^\d+\./))
          .map((line: string, index: number) => {
            const content = line.replace(/^\d+\.\s*/, "").trim();
            return {
              id: String(index + 1),
              title: content,
              description: i18n.language === 'he' ? "לחץ למידע נוסף" : "Tap for more details",
              doriAdvice: i18n.language === 'he' 
                ? `זה השלב ה${index + 1}. קח את הזמן, אין לחץ.` 
                : `This is step ${index + 1}. Take your time, no rush.`,
              hasSandbox: false,
              icon: "check-circle",
            };
          });

        if (aiSteps.length > 0) {
          setCurrentPath({
            title: query,
            steps: aiSteps,
          });
        } else {
          // Final fallback with default steps
          setCurrentPath({
            title: query,
            steps: getDefaultSteps(),
          });
        }
      }
    } catch (error) {
      console.error("Failed to get AI steps:", error);
      setCurrentPath({
        title: query,
        steps: getDefaultSteps(),
      });
    }

    setIsLoading(false);
    setCompletedSteps([]);
    setExpandedStep(null);
  };
  
  const getDefaultSteps = (): PathStep[] => [
    {
      id: "1",
      title: i18n.language === 'he' ? "לחקור את האפשרויות" : "Research your options",
      description: i18n.language === 'he' ? "ללמוד מה מעורב בתהליך" : "Learn about what's involved",
      doriAdvice: i18n.language === 'he' ? "התחל בלהבין מה אתה צריך. זה כמו לקרוא מתכון לפני הבישול." : "Start by understanding what you need. It's like reading a recipe before cooking.",
      hasSandbox: false,
    },
    {
      id: "2",
      title: i18n.language === 'he' ? "להכין את החומרים" : "Prepare your materials",
      description: i18n.language === 'he' ? "לאסוף את כל מה שתצטרך" : "Gather everything you'll need",
      doriAdvice: i18n.language === 'he' ? "הכן הכל מראש, כמו להכין בגדים ערב לפני." : "Get everything ready beforehand, like setting out clothes the night before.",
      hasSandbox: false,
    },
    {
      id: "3",
      title: i18n.language === 'he' ? "לקחת את הצעד הראשון" : "Take the first step",
      description: i18n.language === 'he' ? "להתחיל בתהליך" : "Begin the process",
      doriAdvice: i18n.language === 'he' ? "החלק הכי קשה הוא להתחיל. ברגע שמתחילים, השאר מגיע בטבעיות." : "The hardest part is starting. Once you begin, the rest follows naturally.",
      hasSandbox: true,
    },
  ];

  const handleStepComplete = (stepId: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps([...completedSteps, stepId]);
    }
  };

  const handleStepPress = (stepId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpandedStep(expandedStep === stepId ? null : stepId);
  };

  const examples = [
    t("navigator.example1"),
    t("navigator.example2"),
    t("navigator.example3"),
  ];

  return (
    <ThemedView style={styles.container}>
      <View
        style={[
          styles.content,
          {
            paddingTop: headerHeight + Spacing.xl,
          },
        ]}
      >
        {!currentPath ? (
          <Animated.View entering={FadeInDown.duration(500)}>
            <GlassCard style={styles.inputCard}>
              <View
                style={[
                  styles.inputContainer,
                  { backgroundColor: theme.backgroundSecondary },
                ]}
              >
                <Feather
                  name="compass"
                  size={24}
                  color={theme.textSecondary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  placeholder={t("navigator.placeholder")}
                  placeholderTextColor={theme.textSecondary}
                  value={query}
                  onChangeText={setQuery}
                  multiline
                  testID="goal-input"
                />
              </View>
              <GlassButton
                onPress={handleSubmit}
                disabled={!query.trim() || isLoading}
                icon={
                  isLoading ? null : (
                    <Feather name="arrow-right" size={20} color="#FFFFFF" />
                  )
                }
                testID="submit-goal-button"
              >
                {isLoading ? t("common.loading") : t("common.start")}
              </GlassButton>
            </GlassCard>

            <View style={styles.examples}>
              <ThemedText
                type="small"
                style={[styles.examplesTitle, { color: theme.textSecondary }]}
              >
                {t("navigator.examples")}
              </ThemedText>
              {examples.map((example, index) => (
                <Pressable
                  key={index}
                  onPress={() => setQuery(example)}
                  style={({ pressed }) => [
                    styles.exampleChip,
                    {
                      backgroundColor: theme.glassBg,
                      borderColor: theme.glassBorder,
                      opacity: pressed ? 0.7 : 1,
                    },
                  ]}
                >
                  <ThemedText type="small">{example}</ThemedText>
                </Pressable>
              ))}
            </View>
          </Animated.View>
        ) : (
          <Animated.View entering={FadeInUp.duration(500)} style={styles.pathContainer}>
            <ThemedText type="h3" style={styles.pathTitle}>
              {currentPath.title}
            </ThemedText>

            <View style={[styles.progressBar, isRTL && { transform: [{ scaleX: -1 }] }]}>
              <View
                style={[
                  styles.progressFill,
                  {
                    backgroundColor: theme.success,
                    width: `${(completedSteps.length / currentPath.steps.length) * 100}%`,
                  },
                ]}
              />
            </View>
            <ThemedText
              type="small"
              style={[
                styles.progressText,
                { color: theme.textSecondary, textAlign: isRTL ? "right" : "left" },
              ]}
            >
              {completedSteps.length} / {currentPath.steps.length}{" "}
              {isRTL ? "שלבים הושלמו" : "steps completed"}
            </ThemedText>

            <FlatList
              data={currentPath.steps}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{
                paddingBottom: insets.bottom + Spacing.xl,
              }}
              renderItem={({ item, index }) => (
                <StepCard
                  step={item}
                  index={index}
                  isCompleted={completedSteps.includes(item.id)}
                  isExpanded={expandedStep === item.id}
                  onPress={() => handleStepPress(item.id)}
                  onComplete={() => handleStepComplete(item.id)}
                />
              )}
              showsVerticalScrollIndicator={false}
            />

            <GlassButton
              variant="ghost"
              onPress={() => setCurrentPath(null)}
              style={styles.backButton}
            >
              {t("common.back")}
            </GlassButton>
          </Animated.View>
        )}
      </View>
    </ThemedView>
  );
}

interface StepCardProps {
  step: PathStep;
  index: number;
  isCompleted: boolean;
  isExpanded: boolean;
  onPress: () => void;
  onComplete: () => void;
}

function StepCard({
  step,
  index,
  isCompleted,
  isExpanded,
  onPress,
  onComplete,
}: StepCardProps) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const isRTL = i18n.language === "he";

  const handleCardPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const handleCompletePress = (event?: { stopPropagation?: () => void }) => {
    if (event?.stopPropagation) {
      event.stopPropagation();
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onComplete();
  };

  return (
    <Animated.View layout={Layout.springify()} entering={FadeInDown.delay(index * 100)}>
      <GlassCard
        onPress={handleCardPress}
        testID={`step-card-${step.id}`}
        style={StyleSheet.flatten([
          styles.stepCard,
          isCompleted && { borderColor: theme.success, borderWidth: 2 },
          isExpanded && { borderColor: theme.primary, borderWidth: 2 },
        ])}
      >
          <View style={[styles.stepHeader, isRTL && { flexDirection: "row-reverse" }]}>
            <Feather
              name={isExpanded ? "chevron-up" : "chevron-down"}
              size={24}
              color={isExpanded ? theme.primary : theme.textSecondary}
              style={isRTL ? { marginLeft: Spacing.sm } : { marginRight: Spacing.sm }}
            />
            <View style={[styles.stepTextContainer, { alignItems: isRTL ? "flex-end" : "flex-start" }]}>
              <ThemedText
                type="body"
                style={[
                  styles.stepTitle,
                  { textAlign: isRTL ? "right" : "left" },
                  isCompleted && { textDecorationLine: "line-through", color: theme.textSecondary },
                ]}
              >
                {step.title}
              </ThemedText>
              <ThemedText
                type="small"
                style={{ color: theme.textSecondary, textAlign: isRTL ? "right" : "left" }}
              >
                {step.description}
              </ThemedText>
            </View>
            <Pressable 
              onPress={(e) => handleCompletePress(e)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={isRTL ? { marginRight: Spacing.sm } : { marginLeft: Spacing.sm }}
              testID={`complete-checkbox-${step.id}`}
            >
              <View
                style={[
                  styles.stepCheckbox,
                  {
                    backgroundColor: isCompleted ? theme.success : "transparent",
                    borderColor: isCompleted ? theme.success : theme.primary,
                  },
                ]}
              >
                {isCompleted ? (
                  <Feather name="check" size={18} color="#FFFFFF" />
                ) : null}
              </View>
            </Pressable>
          </View>

          {isExpanded ? (
            <Animated.View
              entering={FadeInDown.duration(300)}
              style={styles.expandedContent}
            >
              <View
                style={[
                  styles.tipCard,
                  { backgroundColor: theme.primary + "10", borderLeftColor: theme.primary },
                  isRTL && { borderLeftWidth: 0, borderRightWidth: 4, borderRightColor: theme.primary },
                ]}
              >
                <View style={[styles.tipHeader, isRTL && { flexDirection: "row-reverse" }]}>
                  <Feather name="zap" size={20} color={theme.primary} />
                  <ThemedText
                    type="small"
                    style={[
                      styles.tipLabel,
                      { color: theme.primary },
                      isRTL ? { marginRight: Spacing.sm, marginLeft: 0 } : { marginLeft: Spacing.sm },
                    ]}
                  >
                    {isRTL ? "טיפ מועיל" : "Helpful Tip"}
                  </ThemedText>
                </View>
                <ThemedText 
                  type="body" 
                  style={[styles.tipText, { textAlign: isRTL ? "right" : "left" }]}
                >
                  {step.doriAdvice}
                </ThemedText>
              </View>

              <View style={[styles.stepActions, isRTL && { flexDirection: "row-reverse" }]}>
                {step.hasSandbox ? (
                  <GlassButton
                    variant="secondary"
                    onPress={() => {}}
                    icon={<Feather name="play-circle" size={18} color={theme.primary} />}
                    style={styles.actionButton}
                  >
                    {t("navigator.practiceButton")}
                  </GlassButton>
                ) : null}
                {!isCompleted ? (
                  <GlassButton
                    onPress={handleCompletePress}
                    icon={<Feather name="check" size={18} color="#FFFFFF" />}
                    style={styles.actionButton}
                    testID={`mark-done-${step.id}`}
                  >
                    {isRTL ? "סיימתי שלב זה" : "Mark as Done"}
                  </GlassButton>
                ) : (
                  <View style={[styles.completedBadge, { backgroundColor: theme.success + "20" }]}>
                    <Feather name="check-circle" size={18} color={theme.success} />
                    <ThemedText 
                      type="small" 
                      style={[
                        { color: theme.success, fontWeight: "600" },
                        isRTL ? { marginRight: Spacing.sm } : { marginLeft: Spacing.sm }
                      ]}
                    >
                      {isRTL ? "הושלם!" : "Completed!"}
                    </ThemedText>
                  </View>
                )}
              </View>
            </Animated.View>
          ) : null}
      </GlassCard>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  inputCard: {
    padding: Spacing.xl,
    gap: Spacing.lg,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    minHeight: 100,
  },
  inputIcon: {
    marginTop: 4,
    marginRight: Spacing.md,
  },
  input: {
    flex: 1,
    fontSize: 20,
    lineHeight: 28,
  },
  examples: {
    marginTop: Spacing.xl,
    gap: Spacing.sm,
  },
  examplesTitle: {
    marginBottom: Spacing.sm,
  },
  exampleChip: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  pathContainer: {
    flex: 1,
  },
  pathTitle: {
    marginBottom: Spacing.lg,
    textAlign: "center",
  },
  progressBar: {
    height: 8,
    backgroundColor: "rgba(0,0,0,0.1)",
    borderRadius: 4,
    marginBottom: Spacing.sm,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  progressText: {
    marginBottom: Spacing.xl,
  },
  stepCard: {
    marginBottom: Spacing.md,
    padding: Spacing.lg,
  },
  stepHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  stepNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  stepTextContainer: {
    flex: 1,
  },
  stepTitle: {
    fontWeight: "600",
    marginBottom: 2,
  },
  expandedContent: {
    marginTop: Spacing.lg,
    gap: Spacing.lg,
  },
  adviceCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  adviceHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  adviceLabel: {
    fontWeight: "600",
    marginLeft: Spacing.sm,
  },
  adviceText: {
    lineHeight: 28,
  },
  stepCheckbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  tipCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderLeftWidth: 4,
  },
  tipHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  tipLabel: {
    fontWeight: "700",
  },
  tipText: {
    lineHeight: 26,
    fontSize: 16,
  },
  stepActions: {
    flexDirection: "row",
    gap: Spacing.md,
    flexWrap: "wrap",
  },
  actionButton: {
    flex: 1,
    minWidth: 140,
  },
  completedBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  backButton: {
    marginTop: Spacing.md,
  },
});

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

export default function DecisionNavigatorScreen() {
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

    await new Promise((resolve) => setTimeout(resolve, 1500));

    const lowerQuery = query.toLowerCase();
    if (lowerQuery.includes("passport")) {
      setCurrentPath(EXAMPLE_PATHS.passport);
    } else {
      setCurrentPath({
        title: query,
        steps: [
          {
            id: "1",
            title: "Research your options",
            description: "Learn about what's involved",
            doriAdvice:
              "Start by understanding what you need. It's like reading a recipe before cooking.",
            hasSandbox: false,
          },
          {
            id: "2",
            title: "Prepare your materials",
            description: "Gather everything you'll need",
            doriAdvice:
              "Get everything ready beforehand, like setting out clothes the night before.",
            hasSandbox: false,
          },
          {
            id: "3",
            title: "Take the first step",
            description: "Begin the process",
            doriAdvice:
              "The hardest part is starting. Once you begin, the rest follows naturally.",
            hasSandbox: true,
          },
        ],
      });
    }

    setIsLoading(false);
    setCompletedSteps([]);
    setExpandedStep(null);
  };

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

            <View style={styles.progressBar}>
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
              style={[styles.progressText, { color: theme.textSecondary }]}
            >
              {completedSteps.length} / {currentPath.steps.length} steps completed
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

  return (
    <Animated.View layout={Layout.springify()} entering={FadeInDown.delay(index * 100)}>
      <Pressable onPress={onPress}>
        <GlassCard
          style={[
            styles.stepCard,
            isCompleted && { borderColor: theme.success, borderWidth: 2 },
          ]}
        >
          <View style={styles.stepHeader}>
            <View
              style={[
                styles.stepNumber,
                {
                  backgroundColor: isCompleted
                    ? theme.success
                    : theme.primary + "20",
                },
              ]}
            >
              {isCompleted ? (
                <Feather name="check" size={20} color="#FFFFFF" />
              ) : (
                <ThemedText style={{ color: theme.primary, fontWeight: "700" }}>
                  {index + 1}
                </ThemedText>
              )}
            </View>
            <View style={styles.stepTextContainer}>
              <ThemedText
                type="body"
                style={[
                  styles.stepTitle,
                  isCompleted && { textDecorationLine: "line-through" },
                ]}
              >
                {step.title}
              </ThemedText>
              <ThemedText
                type="small"
                style={{ color: theme.textSecondary }}
              >
                {step.description}
              </ThemedText>
            </View>
            <Feather
              name={isExpanded ? "chevron-up" : "chevron-down"}
              size={24}
              color={theme.textSecondary}
            />
          </View>

          {isExpanded ? (
            <Animated.View
              entering={FadeInDown.duration(300)}
              style={styles.expandedContent}
            >
              <View
                style={[
                  styles.adviceCard,
                  { backgroundColor: theme.secondary + "15" },
                ]}
              >
                <View style={styles.adviceHeader}>
                  <Feather name="message-circle" size={18} color={theme.secondary} />
                  <ThemedText
                    type="small"
                    style={[styles.adviceLabel, { color: theme.secondary }]}
                  >
                    {t("navigator.doriAdvice")}
                  </ThemedText>
                </View>
                <ThemedText type="body" style={styles.adviceText}>
                  {step.doriAdvice}
                </ThemedText>
              </View>

              <View style={styles.stepActions}>
                {step.hasSandbox ? (
                  <GlassButton
                    variant="secondary"
                    onPress={() => {}}
                    icon={<Feather name="play-circle" size={18} color={theme.primary} />}
                    style={styles.sandboxButton}
                  >
                    {t("navigator.practiceButton")}
                  </GlassButton>
                ) : null}
                {!isCompleted ? (
                  <GlassButton
                    onPress={onComplete}
                    icon={<Feather name="check" size={18} color="#FFFFFF" />}
                    testID={`complete-step-${step.id}`}
                  >
                    {t("common.done")}
                  </GlassButton>
                ) : null}
              </View>
            </Animated.View>
          ) : null}
        </GlassCard>
      </Pressable>
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
  stepActions: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  sandboxButton: {
    flex: 1,
  },
  backButton: {
    marginTop: Spacing.md,
  },
});

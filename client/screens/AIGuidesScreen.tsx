import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  Pressable,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import Animated, {
  FadeInDown,
  FadeInRight,
  FadeIn,
  SlideInRight,
  SlideOutLeft,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { useTranslation } from "react-i18next";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { GlassButton } from "@/components/GlassButton";
import { GlassCard } from "@/components/GlassCard";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Typography, Colors } from "@/constants/theme";
import { aiJourneys, Journey } from "@/data/aiJourneys";
import { useJourneyProgress, useAllProgress } from "@/hooks/useJourneyProgress";
import { useCelebration } from "@/contexts/CelebrationContext";

const AI_PURPLE = "#6C63FF";
const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function AIGuidesScreen() {
  const { t, i18n } = useTranslation();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const [selectedJourney, setSelectedJourney] = useState<Journey | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [showTrainerNotes, setShowTrainerNotes] = useState(false);
  const stepStartTime = useRef<number>(Date.now());
  const isHebrew = i18n.language === "he";

  const { allProgress } = useAllProgress();
  const { celebrate } = useCelebration();
  const { 
    progress, 
    updateProgress, 
    recordStepCompletion,
  } = useJourneyProgress(selectedJourney?.id ? `ai-${selectedJourney.id}` : null);

  useEffect(() => {
    if (selectedJourney && progress.currentStep > 0 && !progress.completed) {
      setCurrentStep(progress.currentStep);
    }
  }, [selectedJourney, progress]);

  useEffect(() => {
    stepStartTime.current = Date.now();
  }, [currentStep, selectedJourney]);

  const getJourneyProgress = useCallback((journeyId: string) => {
    return allProgress.find(p => p.journeyId === `ai-${journeyId}`);
  }, [allProgress]);

  const handleSelectJourney = useCallback((journey: Journey) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedJourney(journey);
    const savedProgress = allProgress.find(p => p.journeyId === `ai-${journey.id}`);
    if (savedProgress && savedProgress.currentStep > 0 && !savedProgress.completed) {
      setCurrentStep(savedProgress.currentStep);
    } else {
      setCurrentStep(0);
    }
  }, [allProgress]);

  const handleBack = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  const handleNext = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (selectedJourney && currentStep < selectedJourney.steps.length - 1) {
      const timeSpent = Math.round((Date.now() - stepStartTime.current) / 1000);
      const nextStep = currentStep + 1;
      
      try {
        await recordStepCompletion(currentStep, timeSpent);
        await updateProgress(nextStep, false);
      } catch (error) {
        console.log("Progress tracking error (non-critical):", error);
      }
      
      setCurrentStep(nextStep);
    }
  }, [selectedJourney, currentStep, recordStepCompletion, updateProgress]);

  const handleFinish = useCallback(async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    const journeyTitle = selectedJourney ? (isHebrew ? selectedJourney.titleHe : selectedJourney.title) : "";
    
    if (selectedJourney) {
      const timeSpent = Math.round((Date.now() - stepStartTime.current) / 1000);
      try {
        await recordStepCompletion(currentStep, timeSpent);
        await updateProgress(selectedJourney.steps.length, true);
      } catch (error) {
        console.log("Progress tracking error (non-critical):", error);
      }
    }
    
    celebrate({
      message: isHebrew ? "כל הכבוד!" : "Well Done!",
      subMessage: isHebrew ? `סיימת: ${journeyTitle}` : `Completed: ${journeyTitle}`,
      type: "both",
    });
    
    setTimeout(() => {
      setSelectedJourney(null);
      setCurrentStep(0);
    }, 2800);
  }, [selectedJourney, currentStep, recordStepCompletion, updateProgress, celebrate, isHebrew]);

  const handleBackToList = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (selectedJourney && currentStep > 0) {
      try {
        await updateProgress(currentStep, false);
      } catch (error) {
        console.log("Progress tracking error (non-critical):", error);
      }
    }
    
    setSelectedJourney(null);
    setCurrentStep(0);
  }, [selectedJourney, currentStep, updateProgress]);

  const toggleTrainerNotes = useCallback(() => {
    setShowTrainerNotes((prev) => !prev);
  }, []);

  const renderJourneyList = () => (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={[
        styles.listContent,
        {
          paddingTop: headerHeight + Spacing.xl,
          paddingBottom: insets.bottom + Spacing["3xl"],
        },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.header}>
        <View style={[styles.headerIcon, { backgroundColor: AI_PURPLE }]}>
          <Feather name="cpu" size={32} color="#FFFFFF" />
        </View>
        <ThemedText type="body" style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
          {t("tools.ai.stepByStep")}
        </ThemedText>
      </Animated.View>

      <View style={styles.journeyList}>
        {aiJourneys.map((journey, index) => {
          const journeyProgress = getJourneyProgress(journey.id);
          const isCompleted = journeyProgress?.completed;
          const hasProgress = journeyProgress && journeyProgress.currentStep > 0 && !isCompleted;
          
          return (
            <Animated.View
              key={journey.id}
              entering={FadeInDown.delay(200 + index * 100).duration(500)}
            >
              <GlassCard 
                style={styles.journeyCard}
                onPress={() => handleSelectJourney(journey)}
                testID={`ai-journey-${journey.id}`}
              >
                  <View style={[styles.journeyIcon, { backgroundColor: AI_PURPLE + "20" }]}>
                    <Feather name={journey.icon as any} size={28} color={AI_PURPLE} />
                  </View>
                  <View style={styles.journeyContent}>
                    <View style={styles.journeyTitleRow}>
                      <ThemedText type="h4" style={styles.journeyTitle}>
                        {isHebrew ? journey.titleHe : journey.title}
                      </ThemedText>
                      {isCompleted ? (
                        <View style={[styles.completedBadge, { backgroundColor: Colors.light.success + "20" }]}>
                          <Feather name="check" size={14} color={Colors.light.success} />
                        </View>
                      ) : null}
                    </View>
                    <ThemedText type="small" style={{ color: theme.textSecondary }}>
                      {isHebrew ? journey.descriptionHe : journey.description}
                    </ThemedText>
                    <View style={styles.journeyMeta}>
                      <ThemedText type="small" style={{ color: theme.textSecondary }}>
                        {t("tools.ai.steps", { count: journey.steps.length })}
                      </ThemedText>
                      {hasProgress ? (
                        <View style={[styles.progressBadge, { backgroundColor: AI_PURPLE + "20" }]}>
                          <ThemedText type="small" style={{ color: AI_PURPLE }}>
                            {t("tools.ai.inProgress")}
                          </ThemedText>
                        </View>
                      ) : null}
                    </View>
                  </View>
                  <Feather name="chevron-left" size={24} color={theme.textSecondary} />
              </GlassCard>
            </Animated.View>
          );
        })}
      </View>
    </ScrollView>
  );

  const renderStepView = () => {
    if (!selectedJourney) return null;
    const step = selectedJourney.steps[currentStep];
    const isLastStep = currentStep === selectedJourney.steps.length - 1;

    return (
      <Animated.View
        entering={SlideInRight.duration(300)}
        exiting={SlideOutLeft.duration(300)}
        style={styles.stepContainer}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.stepContent,
            {
              paddingTop: headerHeight + Spacing.lg,
              paddingBottom: insets.bottom + 120,
            },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <Pressable onPress={handleBackToList} style={styles.backButton}>
            <Feather name="arrow-right" size={20} color={theme.text} />
            <ThemedText type="body" style={styles.backButtonText}>
              {t("tools.ai.back")}
            </ThemedText>
          </Pressable>

          <Animated.View entering={FadeIn.delay(100).duration(400)}>
            <View style={styles.stepProgress}>
              <ThemedText type="small" style={{ color: AI_PURPLE }}>
                {t("tools.ai.stepCount", {
                  current: currentStep + 1,
                  total: selectedJourney.steps.length,
                })}
              </ThemedText>
              <View style={styles.progressDots}>
                {selectedJourney.steps.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.progressDot,
                      {
                        backgroundColor:
                          index <= currentStep ? AI_PURPLE : theme.border,
                      },
                    ]}
                  />
                ))}
              </View>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInRight.delay(200).duration(400)}>
            <GlassCard style={styles.stepCard}>
              <View style={[styles.stepIconContainer, { backgroundColor: AI_PURPLE + "15" }]}>
                <Feather name={selectedJourney.icon as any} size={40} color={AI_PURPLE} />
              </View>
              <ThemedText type="h3" style={styles.stepTitle}>
                {isHebrew ? selectedJourney.titleHe : selectedJourney.title}
              </ThemedText>
              <ThemedText type="body" style={[styles.stepText, { color: theme.text }]}>
                {isHebrew ? step.textHe : step.text}
              </ThemedText>
            </GlassCard>
          </Animated.View>

          {(step.trainerNote || step.trainerNoteHe) ? (
            <Animated.View entering={FadeInDown.delay(300).duration(400)}>
              <Pressable onPress={toggleTrainerNotes} style={styles.trainerToggle}>
                <Feather
                  name={showTrainerNotes ? "eye" : "eye-off"}
                  size={16}
                  color={theme.textSecondary}
                />
                <ThemedText type="small" style={{ color: theme.textSecondary, marginLeft: 8 }}>
                  {showTrainerNotes
                    ? t("tools.ai.trainerNotesVisible")
                    : t("tools.ai.showTrainerNotes")}
                </ThemedText>
              </Pressable>
              {showTrainerNotes ? (
                <GlassCard style={styles.trainerCard}>
                  <ThemedText type="small" style={{ color: AI_PURPLE }}>
                    {t("tools.ai.trainer")}
                  </ThemedText>
                  <ThemedText type="body" style={{ color: theme.textSecondary, marginTop: 4 }}>
                    {isHebrew ? step.trainerNoteHe : step.trainerNote}
                  </ThemedText>
                </GlassCard>
              ) : null}
            </Animated.View>
          ) : null}
        </ScrollView>

        <View
          style={[
            styles.navigationBar,
            {
              paddingBottom: insets.bottom + Spacing.md,
              backgroundColor: theme.backgroundRoot,
              borderTopColor: theme.border,
            },
          ]}
        >
          <GlassButton
            onPress={handleBack}
            variant="secondary"
            style={currentStep === 0 ? styles.navButtonHidden : styles.navButton}
            disabled={currentStep === 0}
          >
            {t("tools.ai.back")}
          </GlassButton>
          <GlassButton
            onPress={isLastStep ? handleFinish : handleNext}
            style={styles.navButton}
          >
            {isLastStep ? t("tools.ai.finish") : t("tools.ai.next")}
          </GlassButton>
        </View>
      </Animated.View>
    );
  };

  return (
    <ThemedView style={styles.container}>
      {selectedJourney ? renderStepView() : renderJourneyList()}
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
  listContent: {
    paddingHorizontal: Spacing.lg,
  },
  header: {
    alignItems: "center",
    marginBottom: Spacing["2xl"],
  },
  headerIcon: {
    width: 72,
    height: 72,
    borderRadius: BorderRadius.xl,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
  },
  headerSubtitle: {
    textAlign: "center",
    maxWidth: 280,
  },
  journeyList: {
    gap: Spacing.md,
  },
  journeyPressable: {
    borderRadius: BorderRadius.lg,
  },
  journeyPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  journeyCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  journeyIcon: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  journeyContent: {
    flex: 1,
  },
  journeyTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: 2,
  },
  journeyTitle: {
    flex: 1,
  },
  completedBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  journeyMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  progressBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  stepContainer: {
    flex: 1,
  },
  stepContent: {
    paddingHorizontal: Spacing.lg,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  backButtonText: {
    fontWeight: "600",
  },
  stepProgress: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  progressDots: {
    flexDirection: "row",
    gap: 6,
    marginTop: Spacing.sm,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  stepCard: {
    padding: Spacing.xl,
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  stepIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
  },
  stepTitle: {
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  stepText: {
    ...Typography.body,
    fontSize: 20,
    lineHeight: 32,
    textAlign: "center",
  },
  trainerToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.sm,
  },
  trainerCard: {
    padding: Spacing.md,
    marginTop: Spacing.sm,
    borderWidth: 1,
  },
  navigationBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    gap: Spacing.md,
  },
  navButton: {
    flex: 1,
  },
  navButtonHidden: {
    opacity: 0,
  },
});

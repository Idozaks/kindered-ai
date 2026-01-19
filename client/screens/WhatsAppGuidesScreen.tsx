import React, { useState, useCallback } from "react";
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
  FadeOutLeft,
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
import { Spacing, BorderRadius, Typography } from "@/constants/theme";
import { whatsappJourneys, Journey } from "@/data/whatsappJourneys";

const WHATSAPP_GREEN = "#25D366";
const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function WhatsAppGuidesScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const [selectedJourney, setSelectedJourney] = useState<Journey | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [showTrainerNotes, setShowTrainerNotes] = useState(false);

  const handleSelectJourney = useCallback((journey: Journey) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedJourney(journey);
    setCurrentStep(0);
  }, []);

  const handleBack = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  const handleNext = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (selectedJourney && currentStep < selectedJourney.steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  }, [selectedJourney, currentStep]);

  const handleFinish = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setSelectedJourney(null);
    setCurrentStep(0);
  }, []);

  const handleBackToList = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedJourney(null);
    setCurrentStep(0);
  }, []);

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
      <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
        <View style={[styles.iconCircle, { backgroundColor: WHATSAPP_GREEN }]}>
          <Feather name="message-circle" size={32} color="#FFFFFF" />
        </View>
        <ThemedText type="h2" style={styles.title}>
          {t("tools.whatsapp.title")}
        </ThemedText>
        <ThemedText
          type="body"
          style={[styles.subtitle, { color: theme.textSecondary }]}
        >
          {t("tools.whatsapp.stepByStep")}
        </ThemedText>
      </Animated.View>

      <View style={styles.journeyList}>
        {whatsappJourneys.map((journey, index) => (
          <Animated.View
            key={journey.id}
            entering={FadeInDown.delay(100 + index * 50).duration(400)}
          >
            <GlassCard
              style={styles.journeyCard}
              onPress={() => handleSelectJourney(journey)}
              testID={`journey-${journey.id}`}
              icon={
                <View
                  style={[
                    styles.journeyNumber,
                    { backgroundColor: WHATSAPP_GREEN + "20" },
                  ]}
                >
                  <ThemedText
                    style={[styles.journeyNumberText, { color: WHATSAPP_GREEN }]}
                  >
                    {index + 1}
                  </ThemedText>
                </View>
              }
            >
              <View style={styles.journeyTextContainer}>
                <ThemedText type="h4" style={styles.journeyTitle}>
                  {journey.titleHe || journey.title}
                </ThemedText>
                <ThemedText
                  type="small"
                  style={[styles.journeyDescription, { color: theme.textSecondary }]}
                >
                  {journey.descriptionHe || journey.description}
                </ThemedText>
                <View style={styles.stepCountRow}>
                  <Feather
                    name="list"
                    size={14}
                    color={theme.textSecondary}
                  />
                  <ThemedText
                    style={[styles.stepCount, { color: theme.textSecondary }]}
                  >
                    {t("tools.whatsapp.steps", { count: journey.steps.length })}
                  </ThemedText>
                </View>
              </View>
              <Feather
                name="chevron-right"
                size={24}
                color={theme.textSecondary}
              />
            </GlassCard>
          </Animated.View>
        ))}
      </View>

      <Animated.View
        entering={FadeInDown.delay(500).duration(400)}
        style={styles.trainerToggleContainer}
      >
        <Pressable
          onPress={toggleTrainerNotes}
          style={[
            styles.trainerToggle,
            { backgroundColor: theme.backgroundSecondary },
          ]}
          testID="toggle-trainer-notes"
        >
          <Feather
            name={showTrainerNotes ? "eye" : "eye-off"}
            size={20}
            color={theme.textSecondary}
          />
          <ThemedText
            style={[styles.trainerToggleText, { color: theme.textSecondary }]}
          >
            {showTrainerNotes ? t("tools.whatsapp.trainerNotesVisible") : t("tools.whatsapp.showTrainerNotes")}
          </ThemedText>
        </Pressable>
      </Animated.View>
    </ScrollView>
  );

  const renderStepper = () => {
    if (!selectedJourney) return null;

    const step = selectedJourney.steps[currentStep];
    const isFirstStep = currentStep === 0;
    const isLastStep = currentStep === selectedJourney.steps.length - 1;

    return (
      <View
        style={[
          styles.stepperContainer,
          {
            paddingTop: headerHeight + Spacing.lg,
            paddingBottom: insets.bottom + Spacing.lg,
          },
        ]}
      >
        <Animated.View entering={FadeIn.duration(300)} style={styles.stepperHeader}>
          <Pressable
            onPress={handleBackToList}
            style={styles.backToListButton}
            hitSlop={12}
            testID="back-to-list"
          >
            <Feather name="x" size={24} color={theme.text} />
          </Pressable>
          <View style={styles.stepperTitleContainer}>
            <ThemedText type="h4" numberOfLines={1}>
              {selectedJourney.titleHe || selectedJourney.title}
            </ThemedText>
          </View>
          <View style={styles.spacer} />
        </Animated.View>

        <View style={styles.progressContainer}>
          <View
            style={[styles.progressBar, { backgroundColor: theme.backgroundSecondary }]}
          >
            <Animated.View
              style={[
                styles.progressFill,
                {
                  backgroundColor: WHATSAPP_GREEN,
                  width: `${((currentStep + 1) / selectedJourney.steps.length) * 100}%`,
                },
              ]}
            />
          </View>
          <ThemedText
            style={[styles.progressText, { color: theme.textSecondary }]}
          >
            {t("tools.whatsapp.stepCount", { current: currentStep + 1, total: selectedJourney.steps.length })}
          </ThemedText>
        </View>

        <View style={styles.stepContentContainer}>
          <Animated.View
            key={currentStep}
            entering={SlideInRight.duration(300)}
            exiting={SlideOutLeft.duration(200)}
            style={styles.stepContent}
          >
            <GlassCard style={styles.stepCard}>
              <View style={styles.stepNumberBadge}>
                <View
                  style={[
                    styles.stepBadge,
                    { backgroundColor: WHATSAPP_GREEN },
                  ]}
                >
                  <ThemedText style={styles.stepBadgeText}>
                    {currentStep + 1}
                  </ThemedText>
                </View>
              </View>
              <ThemedText type="body" style={styles.stepText}>
                {step.textHe || step.text}
              </ThemedText>
              {showTrainerNotes && (step.trainerNoteHe || step.trainerNote) ? (
                <Animated.View
                  entering={FadeIn.duration(200)}
                  style={[
                    styles.trainerNote,
                    { backgroundColor: theme.backgroundSecondary },
                  ]}
                >
                  <Feather
                    name="info"
                    size={16}
                    color={theme.primary}
                    style={styles.trainerIcon}
                  />
                  <ThemedText
                    type="small"
                    style={[styles.trainerNoteText, { color: theme.textSecondary }]}
                  >
                    {t("tools.whatsapp.trainer")}{step.trainerNoteHe || step.trainerNote}
                  </ThemedText>
                </Animated.View>
              ) : null}
            </GlassCard>
          </Animated.View>
        </View>

        <View style={styles.navigationButtons}>
          <GlassButton
            onPress={handleBack}
            variant="secondary"
            disabled={isFirstStep}
            style={styles.navButton}
            testID="button-back"
          >
            {t("tools.whatsapp.back")}
          </GlassButton>
          {isLastStep ? (
            <GlassButton
              onPress={handleFinish}
              style={[styles.navButton, { backgroundColor: WHATSAPP_GREEN }]}
              testID="button-finish"
            >
              {t("tools.whatsapp.finish")}
            </GlassButton>
          ) : (
            <GlassButton
              onPress={handleNext}
              style={[styles.navButton, { backgroundColor: WHATSAPP_GREEN }]}
              testID="button-next"
            >
              {t("tools.whatsapp.next")}
            </GlassButton>
          )}
        </View>
      </View>
    );
  };

  return (
    <ThemedView style={styles.container}>
      {selectedJourney ? renderStepper() : renderJourneyList()}
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
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
  },
  title: {
    textAlign: "center",
    marginBottom: Spacing.xs,
  },
  subtitle: {
    textAlign: "center",
  },
  journeyList: {
    gap: Spacing.md,
  },
  journeyCard: {
    flexDirection: "row",
    alignItems: "center",
  },
  journeyNumber: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  journeyNumberText: {
    fontSize: 20,
    fontWeight: "700",
  },
  journeyTextContainer: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  journeyTitle: {
    marginBottom: 2,
  },
  journeyDescription: {
    marginBottom: Spacing.xs,
  },
  stepCountRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  stepCount: {
    fontSize: 14,
  },
  trainerToggleContainer: {
    marginTop: Spacing["2xl"],
    alignItems: "center",
  },
  trainerToggle: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  trainerToggleText: {
    fontSize: 16,
  },
  stepperContainer: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  stepperHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  backToListButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  stepperTitleContainer: {
    flex: 1,
    alignItems: "center",
  },
  spacer: {
    width: 44,
  },
  progressContainer: {
    marginBottom: Spacing.xl,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: Spacing.sm,
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  progressText: {
    textAlign: "center",
    fontSize: 16,
  },
  stepContentContainer: {
    flex: 1,
    justifyContent: "center",
  },
  stepContent: {
    width: "100%",
  },
  stepCard: {
    minHeight: 200,
  },
  stepNumberBadge: {
    marginBottom: Spacing.lg,
  },
  stepBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  stepBadgeText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  stepText: {
    fontSize: 22,
    lineHeight: 32,
  },
  trainerNote: {
    marginTop: Spacing.lg,
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  trainerIcon: {
    marginRight: Spacing.sm,
    marginTop: 2,
  },
  trainerNoteText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
  },
  navigationButtons: {
    flexDirection: "row",
    gap: Spacing.md,
    marginTop: Spacing.xl,
  },
  navButton: {
    flex: 1,
  },
});

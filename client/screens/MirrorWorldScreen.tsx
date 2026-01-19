import React, { useState } from "react";
import { StyleSheet, View, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInDown, FadeInUp, ZoomIn } from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { GlassCard } from "@/components/GlassCard";
import { GlassButton } from "@/components/GlassButton";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

interface PracticeTask {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Feather.glyphMap;
  color: string;
  steps: string[];
}

const PRACTICE_TASKS: PracticeTask[] = [
  {
    id: "grocery",
    title: "Order Groceries",
    description: "Learn to order food online",
    icon: "shopping-cart",
    color: "#52C41A",
    steps: [
      "Open the grocery app",
      "Search for items you need",
      "Add items to your cart",
      "Review your cart",
      "Complete checkout",
    ],
  },
  {
    id: "videocall",
    title: "Make a Video Call",
    description: "Practice calling family and friends",
    icon: "video",
    color: "#5B9BD5",
    steps: [
      "Open the video call app",
      "Find your contact",
      "Tap the video call button",
      "Wait for them to answer",
      "End the call when finished",
    ],
  },
  {
    id: "email",
    title: "Send an Email",
    description: "Write and send messages",
    icon: "mail",
    color: "#F4B942",
    steps: [
      "Open your email app",
      "Tap 'Compose' or the + button",
      "Enter the recipient's email",
      "Write your message",
      "Tap Send",
    ],
  },
];

export default function MirrorWorldScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [selectedTask, setSelectedTask] = useState<PracticeTask | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState(false);

  const handleSelectTask = (task: PracticeTask) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedTask(task);
    setCurrentStep(0);
    setCompleted(false);
  };

  const handleNextStep = () => {
    if (!selectedTask) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (currentStep < selectedTask.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setCompleted(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handleRestart = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setCurrentStep(0);
    setCompleted(false);
  };

  const handleBack = () => {
    setSelectedTask(null);
    setCurrentStep(0);
    setCompleted(false);
  };

  return (
    <ThemedView style={styles.container}>
      {!selectedTask ? (
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
          <Animated.View entering={FadeInDown.duration(500)}>
            <View style={styles.header}>
              <View
                style={[
                  styles.iconCircle,
                  { backgroundColor: "#9B59B6" + "20" },
                ]}
              >
                <Feather name="play-circle" size={48} color="#9B59B6" />
              </View>
              <ThemedText type="h2" style={styles.title}>
                {t("mirrorWorld.title")}
              </ThemedText>
              <ThemedText
                type="body"
                style={[styles.subtitle, { color: theme.textSecondary }]}
              >
                {t("mirrorWorld.intro")}
              </ThemedText>
            </View>

            <ThemedText type="h4" style={styles.sectionTitle}>
              {t("mirrorWorld.selectTask")}
            </ThemedText>

            {PRACTICE_TASKS.map((task, index) => (
              <Animated.View
                key={task.id}
                entering={FadeInUp.delay(index * 100).duration(400)}
                style={styles.taskCardWrapper}
              >
                <GlassCard
                  onPress={() => handleSelectTask(task)}
                  style={styles.taskCard}
                  icon={
                    <View
                      style={[
                        styles.taskIcon,
                        { backgroundColor: task.color + "20" },
                      ]}
                    >
                      <Feather name={task.icon} size={28} color={task.color} />
                    </View>
                  }
                  title={task.title}
                  description={task.description}
                  testID={`task-${task.id}`}
                />
              </Animated.View>
            ))}
          </Animated.View>
        </ScrollView>
      ) : completed ? (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.completedScrollContent,
            {
              paddingTop: headerHeight + Spacing.xl,
              paddingBottom: insets.bottom + Spacing.xl,
            },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            entering={ZoomIn.duration(500)}
            style={styles.completedContainer}
          >
            <View
              style={[
                styles.successCircle,
                { backgroundColor: theme.success + "20" },
              ]}
            >
              <Feather name="check-circle" size={80} color={theme.success} />
            </View>
            <ThemedText type="h2" style={styles.successTitle}>
              {t("mirrorWorld.success")}
            </ThemedText>
            <ThemedText
              type="body"
              style={[styles.successSubtitle, { color: theme.textSecondary }]}
            >
              You completed: {selectedTask.title}
            </ThemedText>

            <View style={styles.completedActions}>
              <GlassButton
                variant="secondary"
                onPress={handleRestart}
                icon={<Feather name="refresh-cw" size={20} color={theme.primary} />}
                style={styles.actionButton}
              >
                {t("mirrorWorld.tryAgain")}
              </GlassButton>
              <GlassButton
                onPress={handleBack}
                icon={<Feather name="arrow-left" size={20} color="#FFFFFF" />}
                style={styles.actionButton}
              >
                {t("common.back")}
              </GlassButton>
            </View>
          </Animated.View>
        </ScrollView>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.practiceScrollContent,
            {
              paddingTop: headerHeight + Spacing.xl,
              paddingBottom: insets.bottom + Spacing.xl,
            },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View entering={FadeInUp.duration(500)} style={styles.practiceContainer}>
            <View style={styles.practiceHeader}>
              <View
                style={[
                  styles.practiceIcon,
                  { backgroundColor: selectedTask.color + "20" },
                ]}
              >
                <Feather
                  name={selectedTask.icon}
                  size={32}
                  color={selectedTask.color}
                />
              </View>
              <ThemedText type="h3">{selectedTask.title}</ThemedText>
            </View>

            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      backgroundColor: selectedTask.color,
                      width: `${((currentStep + 1) / selectedTask.steps.length) * 100}%`,
                    },
                  ]}
                />
              </View>
              <ThemedText
                type="small"
                style={{ color: theme.textSecondary }}
              >
                Step {currentStep + 1} of {selectedTask.steps.length}
              </ThemedText>
            </View>

            <GlassCard style={styles.stepCard}>
              <View style={styles.stepNumberContainer}>
                <View
                  style={[
                    styles.stepNumber,
                    { backgroundColor: selectedTask.color },
                  ]}
                >
                  <ThemedText style={styles.stepNumberText}>
                    {currentStep + 1}
                  </ThemedText>
                </View>
              </View>
              <ThemedText type="h4" style={styles.stepText}>
                {selectedTask.steps[currentStep]}
              </ThemedText>
              <View
                style={[
                  styles.mockScreen,
                  { backgroundColor: theme.backgroundSecondary },
                ]}
              >
                <Feather
                  name={selectedTask.icon}
                  size={64}
                  color={theme.textSecondary}
                  style={{ opacity: 0.3 }}
                />
                <ThemedText
                  type="small"
                  style={{ color: theme.textSecondary, marginTop: Spacing.md }}
                >
                  Simulated screen area
                </ThemedText>
              </View>
            </GlassCard>

            <View style={styles.practiceActions}>
              <GlassButton
                variant="ghost"
                onPress={handleBack}
                style={styles.backButton}
              >
                {t("common.back")}
              </GlassButton>
              <GlassButton
                onPress={handleNextStep}
                icon={<Feather name="arrow-right" size={20} color="#FFFFFF" />}
                style={styles.nextButton}
                testID="next-step-button"
              >
                {currentStep < selectedTask.steps.length - 1
                  ? t("common.next")
                  : t("common.done")}
              </GlassButton>
            </View>
          </Animated.View>
        </ScrollView>
      )}
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
  practiceScrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
  },
  completedScrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
  },
  header: {
    alignItems: "center",
    marginBottom: Spacing["2xl"],
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
  },
  title: {
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  subtitle: {
    textAlign: "center",
  },
  sectionTitle: {
    marginBottom: Spacing.lg,
  },
  taskCardWrapper: {
    marginBottom: Spacing.md,
  },
  taskCard: {
    flexDirection: "row",
    alignItems: "center",
  },
  taskIcon: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  practiceContainer: {
    flex: 1,
  },
  practiceHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  practiceIcon: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.lg,
  },
  progressContainer: {
    marginBottom: Spacing.xl,
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
  stepCard: {
    flex: 1,
    padding: Spacing.xl,
    alignItems: "center",
  },
  stepNumberContainer: {
    marginBottom: Spacing.lg,
  },
  stepNumber: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  stepNumberText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "700",
  },
  stepText: {
    textAlign: "center",
    marginBottom: Spacing.xl,
  },
  mockScreen: {
    flex: 1,
    width: "100%",
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 200,
  },
  practiceActions: {
    flexDirection: "row",
    gap: Spacing.md,
    marginTop: Spacing.xl,
  },
  backButton: {
    flex: 1,
  },
  nextButton: {
    flex: 2,
  },
  completedContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  successCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing["2xl"],
  },
  successTitle: {
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  successSubtitle: {
    textAlign: "center",
    marginBottom: Spacing["3xl"],
  },
  completedActions: {
    width: "100%",
    gap: Spacing.md,
  },
  actionButton: {
    width: "100%",
  },
});

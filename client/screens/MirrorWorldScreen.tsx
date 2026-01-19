import React, { useState, useMemo } from "react";
import { StyleSheet, View, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useTranslation } from "react-i18next";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInDown, FadeInUp, ZoomIn } from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { GlassCard } from "@/components/GlassCard";
import { GlassButton } from "@/components/GlassButton";
import { 
  VideoCallSimulation, 
  GrocerySimulation, 
  EmailSimulation,
  WhatsAppSimulation,
  BankSimulation,
  DoctorSimulation,
  SettingsSimulation,
  TaxiSimulation,
  PhotosSimulation,
  CalendarSimulation,
} from "@/components/PracticeSimulations";
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

export default function MirrorWorldScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const { t } = useTranslation();

  const PRACTICE_TASKS: PracticeTask[] = useMemo(() => [
    {
      id: "grocery",
      title: t("mirrorWorld.tasks.grocery"),
      description: t("mirrorWorld.intro"),
      icon: "shopping-cart",
      color: "#52C41A",
      steps: [
        t("mirrorWorld.tasks.groceryStep1"),
        t("mirrorWorld.tasks.groceryStep2"),
        t("mirrorWorld.tasks.groceryStep3"),
        t("mirrorWorld.tasks.groceryStep4"),
        t("mirrorWorld.tasks.groceryStep5"),
      ],
    },
    {
      id: "videocall",
      title: t("mirrorWorld.tasks.videocall"),
      description: t("mirrorWorld.intro"),
      icon: "video",
      color: "#5B9BD5",
      steps: [
        t("mirrorWorld.tasks.videoStep1"),
        t("mirrorWorld.tasks.videoStep2"),
        t("mirrorWorld.tasks.videoStep3"),
        t("mirrorWorld.tasks.videoStep4"),
        t("mirrorWorld.tasks.videoStep5"),
      ],
    },
    {
      id: "email",
      title: t("mirrorWorld.tasks.email"),
      description: t("mirrorWorld.intro"),
      icon: "mail",
      color: "#F4B942",
      steps: [
        t("mirrorWorld.tasks.emailStep1"),
        t("mirrorWorld.tasks.emailStep2"),
        t("mirrorWorld.tasks.emailStep3"),
        t("mirrorWorld.tasks.emailStep4"),
        t("mirrorWorld.tasks.emailStep5"),
      ],
    },
    {
      id: "whatsapp",
      title: t("mirrorWorld.tasks.whatsapp"),
      description: t("mirrorWorld.intro"),
      icon: "message-circle",
      color: "#25D366",
      steps: [
        t("mirrorWorld.tasks.whatsappStep1"),
        t("mirrorWorld.tasks.whatsappStep2"),
        t("mirrorWorld.tasks.whatsappStep3"),
        t("mirrorWorld.tasks.whatsappStep4"),
        t("mirrorWorld.tasks.whatsappStep5"),
      ],
    },
    {
      id: "bank",
      title: t("mirrorWorld.tasks.bank"),
      description: t("mirrorWorld.intro"),
      icon: "credit-card",
      color: "#1E88E5",
      steps: [
        t("mirrorWorld.tasks.bankStep1"),
        t("mirrorWorld.tasks.bankStep2"),
        t("mirrorWorld.tasks.bankStep3"),
        t("mirrorWorld.tasks.bankStep4"),
        t("mirrorWorld.tasks.bankStep5"),
      ],
    },
    {
      id: "doctor",
      title: t("mirrorWorld.tasks.doctor"),
      description: t("mirrorWorld.intro"),
      icon: "heart",
      color: "#E91E63",
      steps: [
        t("mirrorWorld.tasks.doctorStep1"),
        t("mirrorWorld.tasks.doctorStep2"),
        t("mirrorWorld.tasks.doctorStep3"),
        t("mirrorWorld.tasks.doctorStep4"),
      ],
    },
    {
      id: "settings",
      title: t("mirrorWorld.tasks.settings"),
      description: t("mirrorWorld.intro"),
      icon: "settings",
      color: "#9B59B6",
      steps: [
        t("mirrorWorld.tasks.settingsStep1"),
        t("mirrorWorld.tasks.settingsStep2"),
        t("mirrorWorld.tasks.settingsStep3"),
        t("mirrorWorld.tasks.settingsStep4"),
      ],
    },
    {
      id: "taxi",
      title: t("mirrorWorld.tasks.taxi"),
      description: t("mirrorWorld.intro"),
      icon: "navigation",
      color: "#FF9500",
      steps: [
        t("mirrorWorld.tasks.taxiStep1"),
        t("mirrorWorld.tasks.taxiStep2"),
        t("mirrorWorld.tasks.taxiStep3"),
        t("mirrorWorld.tasks.taxiStep4"),
        t("mirrorWorld.tasks.taxiStep5"),
        t("mirrorWorld.tasks.taxiStep6"),
        t("mirrorWorld.tasks.taxiStep7"),
      ],
    },
    {
      id: "photos",
      title: t("mirrorWorld.tasks.photos"),
      description: t("mirrorWorld.intro"),
      icon: "image",
      color: "#52C41A",
      steps: [
        t("mirrorWorld.tasks.photosStep1"),
        t("mirrorWorld.tasks.photosStep2"),
        t("mirrorWorld.tasks.photosStep3"),
        t("mirrorWorld.tasks.photosStep4"),
        t("mirrorWorld.tasks.photosStep5"),
        t("mirrorWorld.tasks.photosStep6"),
        t("mirrorWorld.tasks.photosStep7"),
      ],
    },
    {
      id: "calendar",
      title: t("mirrorWorld.tasks.calendar"),
      description: t("mirrorWorld.intro"),
      icon: "calendar",
      color: "#FF3B30",
      steps: [
        t("mirrorWorld.tasks.calendarStep1"),
        t("mirrorWorld.tasks.calendarStep2"),
        t("mirrorWorld.tasks.calendarStep3"),
        t("mirrorWorld.tasks.calendarStep4"),
        t("mirrorWorld.tasks.calendarStep5"),
        t("mirrorWorld.tasks.calendarStep6"),
        t("mirrorWorld.tasks.calendarStep7"),
      ],
    },
  ], [t]);

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

  const renderSimulation = () => {
    if (!selectedTask) return null;

    switch (selectedTask.id) {
      case "videocall":
        return (
          <VideoCallSimulation 
            stepIndex={currentStep} 
            onComplete={handleNextStep} 
          />
        );
      case "grocery":
        return (
          <GrocerySimulation 
            stepIndex={currentStep} 
            onComplete={handleNextStep} 
          />
        );
      case "email":
        return (
          <EmailSimulation 
            stepIndex={currentStep} 
            onComplete={handleNextStep} 
          />
        );
      case "whatsapp":
        return (
          <WhatsAppSimulation 
            stepIndex={currentStep} 
            onComplete={handleNextStep} 
          />
        );
      case "bank":
        return (
          <BankSimulation 
            stepIndex={currentStep} 
            onComplete={handleNextStep} 
          />
        );
      case "doctor":
        return (
          <DoctorSimulation 
            stepIndex={currentStep} 
            onComplete={handleNextStep} 
          />
        );
      case "settings":
        return (
          <SettingsSimulation 
            stepIndex={currentStep} 
            onComplete={handleNextStep} 
          />
        );
      case "taxi":
        return (
          <TaxiSimulation 
            stepIndex={currentStep} 
            onComplete={handleNextStep} 
          />
        );
      case "photos":
        return (
          <PhotosSimulation 
            stepIndex={currentStep} 
            onComplete={handleNextStep} 
          />
        );
      case "calendar":
        return (
          <CalendarSimulation 
            stepIndex={currentStep} 
            onComplete={handleNextStep} 
          />
        );
      default:
        return null;
    }
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
              {t("mirrorWorld.completedTask", { task: selectedTask.title })}
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
                {t("mirrorWorld.stepProgress", { current: currentStep + 1, total: selectedTask.steps.length })}
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
              <View style={styles.simulationArea}>
                {renderSimulation()}
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
  stepCard: {
    flex: 1,
    padding: Spacing.lg,
    alignItems: "center",
    minHeight: 400,
  },
  stepNumberContainer: {
    marginBottom: Spacing.md,
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
    marginBottom: Spacing.lg,
  },
  simulationArea: {
    flex: 1,
    width: "100%",
    minHeight: 280,
  },
  practiceActions: {
    flexDirection: "row",
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  backButton: {
    flex: 1,
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

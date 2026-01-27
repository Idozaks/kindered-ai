import React, { useState, useEffect } from "react";
import { StyleSheet, View, Pressable, Dimensions, ScrollView } from "react-native";
import { BlurView } from "expo-blur";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutDown,
} from "react-native-reanimated";

import { useTheme } from "@/hooks/useTheme";
import { useAura } from "@/contexts/AuraContext";
import { Spacing, BorderRadius } from "@/constants/theme";

import { AuraPulseOrb } from "./AuraPulseOrb";
import { AuraLiveTranscript } from "./AuraLiveTranscript";
import { AuraCircleContacts, CircleContact } from "./AuraCircleContacts";
import { AuraSOSButton } from "./AuraSOSButton";
import { AuraMedicationReminder, Medication } from "./AuraMedicationReminder";
import { AuraWellnessCheck } from "./AuraWellnessCheck";
import { AuraHydrationTracker } from "./AuraHydrationTracker";
import { AuraAccessibilityControls } from "./AuraAccessibilityControls";
import { AuraHandshakeModal } from "./AuraHandshakeModal";
import { ThemedText } from "@/components/ThemedText";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

interface AuraFloatingDashboardProps {
  onMicPress?: () => void;
}

export function AuraFloatingDashboard({ onMicPress }: AuraFloatingDashboardProps) {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const aura = useAura();

  const [isExpanded, setIsExpanded] = useState(false);
  const [showWellnessCheck, setShowWellnessCheck] = useState(false);
  const [activeMedication, setActiveMedication] = useState<Medication | null>(null);
  const [showHandshake, setShowHandshake] = useState(false);

  useEffect(() => {
    if (!aura.handshakeCompleted && aura.mode !== "handshake") {
      const timer = setTimeout(() => {
        setShowHandshake(true);
        aura.startHandshake();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [aura.handshakeCompleted, aura.mode]);

  useEffect(() => {
    if (aura.handshakeStep === "complete") {
      setShowHandshake(false);
    }
  }, [aura.handshakeStep]);

  const expandProgress = useSharedValue(0);
  const orbScale = useSharedValue(1);

  useEffect(() => {
    if (aura.mode === "crisis") {
      setIsExpanded(true);
      expandProgress.value = withSpring(1);
    }
  }, [aura.mode]);

  useEffect(() => {
    const now = new Date();
    const hour = now.getHours();

    if ((hour === 9 || hour === 18) && !aura.lastMoodCheck) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (!aura.lastMoodCheck || new Date(aura.lastMoodCheck) < today) {
        setTimeout(() => setShowWellnessCheck(true), 2000);
      }
    }
  }, [aura.lastMoodCheck]);

  useEffect(() => {
    if (aura.medications.length > 0) {
      const now = new Date();
      const upcomingMed = aura.medications.find((med) => {
        const scheduleTime = new Date(med.scheduledTime);
        const diff = scheduleTime.getTime() - now.getTime();
        const minutes = diff / (1000 * 60);
        return minutes >= -15 && minutes <= 15 && !med.taken;
      });

      if (upcomingMed) {
        setActiveMedication(upcomingMed);
      }
    }
  }, [aura.medications]);

  const handleOrbPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    aura.recordInteraction();

    if (onMicPress) {
      onMicPress();
    } else {
      if (aura.voiceState === "idle") {
        aura.setVoiceState("listening");
        aura.speak(aura.getGreeting());
      } else {
        aura.setVoiceState("idle");
      }
    }
  };

  const handleExpandToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsExpanded(!isExpanded);
    expandProgress.value = withSpring(isExpanded ? 0 : 1);
  };

  const handleRepeat = () => {
    aura.repeatLastMessage();
  };

  const handleSlowDown = () => {
    aura.slowDownSpeech();
    aura.speak("I'll speak slower now.");
  };

  const handleSimplify = () => {
    aura.speak("Let me explain that more simply.");
  };

  const handleMoodSelected = (mood: string) => {
    aura.markMoodCheckComplete();
    setShowWellnessCheck(false);

    if (mood === "bad" || mood === "not_good") {
      aura.speak("I'm sorry you're not feeling well. Would you like me to call someone from your Circle?");
    } else {
      aura.speak("Thank you for sharing. I'm here if you need anything.");
    }
  };

  const handleMedicationTake = (medication: Medication) => {
    aura.speak(`Got it, I've noted that you took ${medication.name}.`);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setActiveMedication(null);
  };

  const handleMedicationDismiss = (medication: Medication) => {
    setActiveMedication(null);
  };

  const primaryContact = aura.contacts.find((c) => c.isPrimary) || aura.contacts[0];

  const expandedStyle = useAnimatedStyle(() => ({
    height: expandProgress.value * (SCREEN_HEIGHT * 0.7) + 200,
  }));

  const orbAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: orbScale.value }],
  }));

  if (!aura.isVisible) {
    return null;
  }

  const isCrisisMode = aura.mode === "crisis";

  return (
    <Animated.View
      entering={SlideInDown.duration(400)}
      exiting={SlideOutDown.duration(300)}
      style={[
        styles.container,
        { bottom: insets.bottom + 20 },
        expandedStyle,
      ]}
    >
      <BlurView
        intensity={isDark ? 40 : 60}
        tint={isDark ? "dark" : "light"}
        style={[
          styles.blurContainer,
          {
            backgroundColor: isCrisisMode
              ? "rgba(220, 20, 60, 0.15)"
              : theme.glassBg,
            borderColor: isCrisisMode
              ? "rgba(220, 20, 60, 0.5)"
              : theme.glassBorder,
          },
        ]}
      >
        <View style={styles.header}>
          <Pressable
            onPress={handleExpandToggle}
            style={styles.expandButton}
            testID="aura-expand-toggle"
          >
            <Feather
              name={isExpanded ? "chevron-down" : "chevron-up"}
              size={24}
              color={theme.textSecondary}
            />
          </Pressable>

          <Animated.View style={orbAnimatedStyle}>
            <Pressable onPress={handleOrbPress} testID="aura-orb-button">
              <AuraPulseOrb state={aura.voiceState} size={isExpanded ? 80 : 56} />
            </Pressable>
          </Animated.View>

          <View style={styles.quickActions}>
            <AuraHydrationTracker
              glasses={aura.hydrationGlasses}
              goal={aura.hydrationGoal}
              onAddGlass={aura.addHydrationGlass}
              onRemoveGlass={aura.removeHydrationGlass}
              compact
            />
          </View>
        </View>

        <AuraLiveTranscript
          text={aura.transcript}
          isVisible={aura.voiceState !== "idle" || aura.transcript.length > 0}
        />

        {isExpanded ? (
          <ScrollView
            style={styles.expandedContent}
            contentContainerStyle={styles.expandedContentContainer}
            showsVerticalScrollIndicator={false}
          >
            {isCrisisMode ? (
              <Animated.View
                entering={FadeIn.duration(300)}
                style={styles.crisisContainer}
              >
                <ThemedText style={[styles.crisisTitle, { color: "#DC143C" }]}>
                  Emergency Mode Activated
                </ThemedText>
                <View style={styles.crisisActions}>
                  <AuraSOSButton
                    primaryContact={primaryContact}
                    expanded
                    onSOSActivated={(location) => {
                      console.log("SOS activated", location);
                    }}
                  />
                </View>
                <AuraCircleContacts contacts={aura.contacts} />
                <Pressable
                  onPress={() => aura.setMode("normal")}
                  style={[styles.cancelCrisis, { borderColor: theme.border }]}
                  testID="cancel-crisis-button"
                >
                  <ThemedText style={{ color: theme.textSecondary }}>
                    I'm okay, cancel emergency
                  </ThemedText>
                </Pressable>
              </Animated.View>
            ) : (
              <>
                {activeMedication ? (
                  <AuraMedicationReminder
                    medication={activeMedication}
                    onTake={handleMedicationTake}
                    onDismiss={handleMedicationDismiss}
                  />
                ) : null}

                {showWellnessCheck ? (
                  <AuraWellnessCheck
                    onMoodSelected={handleMoodSelected}
                    onDismiss={() => setShowWellnessCheck(false)}
                  />
                ) : null}

                <View style={styles.section}>
                  <AuraCircleContacts contacts={aura.contacts} />
                </View>

                <View style={styles.section}>
                  <AuraSOSButton primaryContact={primaryContact} />
                </View>

                <View style={styles.section}>
                  <AuraHydrationTracker
                    glasses={aura.hydrationGlasses}
                    goal={aura.hydrationGoal}
                    onAddGlass={aura.addHydrationGlass}
                    onRemoveGlass={aura.removeHydrationGlass}
                  />
                </View>

                <View style={styles.section}>
                  <AuraAccessibilityControls
                    onRepeat={handleRepeat}
                    onSlowDown={handleSlowDown}
                    onSimplify={handleSimplify}
                  />
                </View>
              </>
            )}
          </ScrollView>
        ) : null}

        {aura.pinnedAnswers.filter(p => p.repeatCount >= 3).length > 0 ? (
          <View style={styles.pinnedSection}>
            {aura.pinnedAnswers.filter(p => p.repeatCount >= 3).map(pinned => (
              <Animated.View 
                key={pinned.id}
                entering={FadeIn.duration(300)}
                style={[styles.pinnedCard, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}
              >
                <View style={styles.pinnedHeader}>
                  <Feather name="pin" size={14} color={theme.textSecondary} />
                  <ThemedText style={[styles.pinnedQuestion, { color: theme.textSecondary }]}>
                    {pinned.question}
                  </ThemedText>
                  <Pressable onPress={() => aura.removePinnedAnswer(pinned.id)} hitSlop={8}>
                    <Feather name="x" size={16} color={theme.textSecondary} />
                  </Pressable>
                </View>
                <ThemedText style={[styles.pinnedAnswer, { color: theme.text }]}>
                  {pinned.answer}
                </ThemedText>
              </Animated.View>
            ))}
          </View>
        ) : null}
      </BlurView>

      <AuraHandshakeModal 
        visible={showHandshake && !aura.handshakeCompleted}
        onClose={() => {
          setShowHandshake(false);
          aura.completeHandshake();
        }}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: Spacing.lg,
    right: Spacing.lg,
    minHeight: 140,
    zIndex: 1000,
  },
  blurContainer: {
    flex: 1,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: Spacing.lg,
    gap: Spacing.md,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  expandButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  quickActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  expandedContent: {
    flex: 1,
  },
  expandedContentContainer: {
    gap: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  section: {
    gap: Spacing.sm,
  },
  crisisContainer: {
    gap: Spacing.xl,
    alignItems: "center",
  },
  crisisTitle: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
  },
  crisisActions: {
    width: "100%",
    alignItems: "center",
  },
  cancelCrisis: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  pinnedSection: {
    marginTop: Spacing.md,
    gap: Spacing.sm,
  },
  pinnedCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  pinnedHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  pinnedQuestion: {
    flex: 1,
    fontSize: 14,
  },
  pinnedAnswer: {
    fontSize: 16,
    lineHeight: 22,
  },
});

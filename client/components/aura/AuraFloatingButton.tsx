import React, { useState, useEffect } from "react";
import { StyleSheet, View, Pressable, Dimensions, Modal, Platform } from "react-native";
import { BlurView } from "expo-blur";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

import { useTheme } from "@/hooks/useTheme";
import { useAura } from "@/contexts/AuraContext";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { Spacing, BorderRadius, AuraColors } from "@/constants/theme";
import { AuraPulseOrb } from "./AuraPulseOrb";
import { AuraHandshakeModal } from "./AuraHandshakeModal";
import { ThemedText } from "@/components/ThemedText";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const BUTTON_SIZE = 64;

interface AuraFloatingButtonProps {
  onPress?: () => void;
}

export function AuraFloatingButton({ onPress }: AuraFloatingButtonProps) {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const aura = useAura();

  const [showHandshake, setShowHandshake] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  
  const { 
    isListening, 
    transcript: speechTranscript, 
    error: speechError, 
    startListening, 
    stopListening,
    isSupported: isSpeechSupported,
  } = useSpeechRecognition("he-IL");

  useEffect(() => {
    if (speechTranscript && !isListening) {
      aura.setTranscript(speechTranscript);
      handleUserSpeech(speechTranscript);
    }
  }, [speechTranscript, isListening]);

  useEffect(() => {
    if (isListening) {
      aura.setVoiceState("listening");
    } else if (aura.voiceState === "listening") {
      aura.setVoiceState("idle");
    }
  }, [isListening]);

  const handleUserSpeech = async (text: string) => {
    if (!text.trim()) return;
    
    aura.recordInteraction();
    
    if (aura.checkForCrisisKeywords(text)) {
      aura.speak("אני רואה שמשהו לא בסדר. האם לחייג לעזרה?");
      return;
    }

    aura.setVoiceState("thinking");
    
    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          context: {
            userName: aura.userName,
            userGender: aura.userGender,
            currentScreen: aura.currentScreen,
          },
        }),
      });
      
      const data = await response.json();
      if (data.response) {
        aura.speak(data.response);
      } else {
        aura.speak("סליחה, לא הבנתי. אפשר לנסות שוב?");
      }
    } catch (error) {
      console.error("AI chat error:", error);
      aura.speak("משהו השתבש. נסה שוב בבקשה.");
    }
  };

  const handleTalkToMe = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    if (Platform.OS !== "web") {
      aura.speak("כרגע זיהוי דיבור עובד רק דרך הדפדפן. נסה דרך האפליקציה באינטרנט.");
      return;
    }
    
    if (!isSpeechSupported) {
      aura.speak("הדפדפן שלך לא תומך בזיהוי דיבור. נסה דפדפן Chrome.");
      return;
    }
    
    if (isListening) {
      stopListening();
    } else {
      aura.speak("אני מקשיבה...");
      setTimeout(() => {
        startListening();
      }, 1500);
    }
  };

  React.useEffect(() => {
    if (!aura.handshakeCompleted && aura.mode !== "handshake") {
      const timer = setTimeout(() => {
        setShowHandshake(true);
        aura.startHandshake();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [aura.handshakeCompleted, aura.mode]);

  React.useEffect(() => {
    if (aura.handshakeStep === "complete") {
      setShowHandshake(false);
    }
  }, [aura.handshakeStep]);

  const translateX = useSharedValue(SCREEN_WIDTH - BUTTON_SIZE - 20);
  const translateY = useSharedValue(SCREEN_HEIGHT - BUTTON_SIZE - 150);
  const contextX = useSharedValue(0);
  const contextY = useSharedValue(0);
  const scale = useSharedValue(1);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (onPress) {
      onPress();
    } else {
      setIsOpen(true);
    }
  };

  const panGesture = Gesture.Pan()
    .onStart(() => {
      contextX.value = translateX.value;
      contextY.value = translateY.value;
      scale.value = withSpring(1.1);
    })
    .onUpdate((event) => {
      const newX = contextX.value + event.translationX;
      const newY = contextY.value + event.translationY;
      
      translateX.value = Math.max(10, Math.min(newX, SCREEN_WIDTH - BUTTON_SIZE - 10));
      translateY.value = Math.max(insets.top + 10, Math.min(newY, SCREEN_HEIGHT - BUTTON_SIZE - insets.bottom - 10));
    })
    .onEnd(() => {
      scale.value = withSpring(1);
      if (translateX.value < SCREEN_WIDTH / 2) {
        translateX.value = withSpring(10);
      } else {
        translateX.value = withSpring(SCREEN_WIDTH - BUTTON_SIZE - 10);
      }
    });

  const tapGesture = Gesture.Tap()
    .onEnd(() => {
      runOnJS(handlePress)();
    });

  const composedGesture = Gesture.Race(panGesture, tapGesture);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  if (!aura.isVisible) {
    return null;
  }

  return (
    <>
      <GestureDetector gesture={composedGesture}>
        <Animated.View style={[styles.container, animatedStyle]} testID="aura-floating-button">
          <BlurView
            intensity={80}
            tint={isDark ? "dark" : "light"}
            style={styles.blurContainer}
          >
            <View style={[styles.button, { borderColor: theme.glassBorder }]}>
              <AuraPulseOrb state={aura.voiceState} size={48} />
            </View>
          </BlurView>
        </Animated.View>
      </GestureDetector>

      <AuraHandshakeModal
        visible={showHandshake}
        onClose={() => setShowHandshake(false)}
      />

      <Modal
        visible={isOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <BlurView intensity={80} tint="dark" style={styles.modalContent}>
            <View style={[styles.modalHeader, { borderBottomColor: theme.glassBorder }]}>
              <View style={styles.orbSmall}>
                <AuraPulseOrb state={aura.voiceState} size={40} />
              </View>
              <View style={styles.headerText}>
                <ThemedText style={[styles.title, { color: theme.text }]}>
                  {aura.userName ? `שלום, ${aura.userName}` : "אורה"}
                </ThemedText>
                <ThemedText style={[styles.subtitle, { color: theme.textSecondary }]}>
                  איך אפשר לעזור?
                </ThemedText>
              </View>
              <Pressable
                style={styles.closeButton}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setIsOpen(false);
                }}
              >
                <Feather name="x" size={24} color={theme.textSecondary} />
              </Pressable>
            </View>

            <View style={styles.quickActions}>
              <Pressable
                style={[
                  styles.actionButton, 
                  { 
                    backgroundColor: isListening ? AuraColors.speaking : theme.glassBg, 
                    borderColor: isListening ? AuraColors.speaking : theme.glassBorder 
                  }
                ]}
                onPress={handleTalkToMe}
              >
                <Feather 
                  name={isListening ? "mic-off" : "mic"} 
                  size={28} 
                  color={isListening ? "#fff" : theme.primary} 
                />
                <ThemedText style={[styles.actionText, { color: isListening ? "#fff" : theme.text }]}>
                  {isListening ? "הפסק הקלטה" : "דבר איתי"}
                </ThemedText>
              </Pressable>

              <Pressable
                style={[styles.actionButton, { backgroundColor: theme.glassBg, borderColor: theme.glassBorder }]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  aura.repeatLastMessage();
                }}
              >
                <Feather name="repeat" size={28} color={theme.primary} />
                <ThemedText style={[styles.actionText, { color: theme.text }]}>חזור שוב</ThemedText>
              </Pressable>

              <Pressable
                style={[styles.actionButton, { backgroundColor: theme.glassBg, borderColor: theme.glassBorder }]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  aura.slowDownSpeech();
                  aura.speak("אדבר לאט יותר");
                }}
              >
                <Feather name="volume-1" size={28} color={theme.primary} />
                <ThemedText style={[styles.actionText, { color: theme.text }]}>לאט יותר</ThemedText>
              </Pressable>
            </View>

            {isListening ? (
              <View style={[styles.transcriptBox, { backgroundColor: AuraColors.listening + "20", borderColor: AuraColors.listening }]}>
                <ThemedText style={[styles.listeningText, { color: AuraColors.listening }]}>
                  {speechTranscript || "מקשיבה... דבר עכשיו"}
                </ThemedText>
              </View>
            ) : speechError ? (
              <View style={[styles.transcriptBox, { backgroundColor: "#FF6B6B20", borderColor: "#FF6B6B" }]}>
                <ThemedText style={[styles.transcriptText, { color: "#FF6B6B" }]}>
                  {speechError}
                </ThemedText>
              </View>
            ) : aura.transcript ? (
              <View style={[styles.transcriptBox, { backgroundColor: theme.glassBg, borderColor: theme.glassBorder }]}>
                <ThemedText style={[styles.transcriptText, { color: theme.text }]}>
                  {aura.transcript}
                </ThemedText>
              </View>
            ) : null}
          </BlurView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    zIndex: 1000,
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
  },
  blurContainer: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    overflow: "hidden",
  },
  button: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderRadius: BUTTON_SIZE / 2,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    paddingBottom: 40,
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderBottomWidth: 1,
  },
  orbSmall: {
    marginRight: Spacing.md,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
    textAlign: "right",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "right",
    marginTop: 2,
  },
  closeButton: {
    padding: Spacing.sm,
  },
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  actionButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  actionText: {
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
  },
  transcriptBox: {
    margin: Spacing.lg,
    marginTop: 0,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  transcriptText: {
    fontSize: 18,
    lineHeight: 28,
    textAlign: "right",
  },
  listeningText: {
    fontSize: 18,
    lineHeight: 28,
    textAlign: "right",
    fontWeight: "500",
  },
});

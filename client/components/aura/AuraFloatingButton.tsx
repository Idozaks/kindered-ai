import React, { useState, useEffect, useRef } from "react";
import { StyleSheet, View, Pressable, Dimensions, Modal, Platform, TextInput, ScrollView, KeyboardAvoidingView, ActivityIndicator } from "react-native";
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
import { useNativeVoice, VoiceState } from "@/hooks/useNativeVoice";
import { Spacing, BorderRadius, AuraColors, Colors } from "@/constants/theme";
import { LiquidOrb } from "./LiquidOrb";
import { WaveVisualizer } from "./WaveVisualizer";
import { AuraHandshakeModal } from "./AuraHandshakeModal";
import { ThemedText } from "@/components/ThemedText";
import { getApiUrl } from "@/lib/query-client";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

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
  const [textInput, setTextInput] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const sendTextMessage = async (message: string) => {
    if (!message.trim()) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: message.trim(),
    };
    
    setChatMessages(prev => [...prev, userMessage]);
    setTextInput("");
    setIsTyping(true);
    aura.setVoiceState("thinking");
    
    try {
      const baseUrl = getApiUrl();
      const response = await fetch(new URL("/api/ai/grandchild-help", baseUrl).href, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: message.trim(),
          context: aura.currentScreen,
          language: "he",
          history: chatMessages.map(m => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });
      
      const data = await response.json();
      
      let aiResponse = data.answer || data.response || "סליחה, לא הצלחתי לענות. נסה שוב.";
      if (aiResponse.includes("---SUGGESTIONS---")) {
        aiResponse = aiResponse.split("---SUGGESTIONS---")[0].trim();
      }
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: aiResponse,
      };
      
      setChatMessages(prev => [...prev, assistantMessage]);
      aura.setTranscript(aiResponse);
      aura.speak(aiResponse);
      aura.recordInteraction();
    } catch (error) {
      console.error("Text chat error:", error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "סליחה, משהו השתבש. נסה שוב בבקשה.",
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
      aura.setVoiceState("idle");
    }
    
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const { 
    state: voiceState,
    transcript: speechTranscript, 
    error: speechError, 
    startListening, 
    stopListening,
    isSupported: isSpeechSupported,
    isListening,
    isProcessing,
    isSpeaking,
    cancel,
  } = useNativeVoice({
    userName: aura.userName || undefined,
    userGender: aura.userGender || undefined,
    context: aura.currentScreen,
    autoListen: true,
  });

  const prevVoiceStateRef = React.useRef<VoiceState>("idle");
  const prevTranscriptRef = React.useRef<string>("");

  useEffect(() => {
    if (prevVoiceStateRef.current !== voiceState) {
      prevVoiceStateRef.current = voiceState;
      const stateMap: Record<VoiceState, typeof aura.voiceState> = {
        idle: "idle",
        listening: "listening",
        processing: "thinking",
        speaking: "speaking",
      };
      aura.setVoiceState(stateMap[voiceState]);
    }
  }, [voiceState]);

  useEffect(() => {
    if (speechTranscript && speechTranscript !== prevTranscriptRef.current) {
      prevTranscriptRef.current = speechTranscript;
      aura.setTranscript(speechTranscript);
      aura.recordInteraction();
    }
  }, [speechTranscript]);

  const handleTalkToMe = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    if (isListening) {
      stopListening();
    } else if (isSpeaking || isProcessing) {
      cancel();
    } else {
      startListening();
    }
  };

  const getButtonLabel = () => {
    if (isListening) return "הפסק הקלטה";
    if (isProcessing) return "מעבד...";
    if (isSpeaking) return "מדברת...";
    return "דבר איתי";
  };

  const getButtonIcon = () => {
    if (isListening) return "mic-off";
    if (isProcessing) return "loader";
    if (isSpeaking) return "volume-2";
    return "mic";
  };

  const isActive = isListening || isProcessing || isSpeaking;

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
          <Pressable 
            onPress={handlePress}
            testID="aura-orb-pressable"
            accessibilityLabel="פתח את דורי"
            accessibilityRole="button"
          >
            <BlurView
              intensity={80}
              tint={isDark ? "dark" : "light"}
              style={styles.blurContainer}
            >
              <View style={[styles.button, { borderColor: theme.glassBorder }]}>
                <LiquidOrb state={aura.voiceState} size={48} />
              </View>
            </BlurView>
          </Pressable>
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
        <KeyboardAvoidingView 
          style={styles.modalOverlay} 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <BlurView intensity={80} tint="dark" style={styles.modalContent}>
            <View style={[styles.modalHeader, { borderBottomColor: theme.glassBorder }]}>
              <View style={styles.orbSmall}>
                <LiquidOrb state={aura.voiceState} size={40} />
              </View>
              <View style={styles.headerText}>
                <ThemedText style={[styles.title, { color: theme.text }]}>
                  {aura.userName ? `שלום, ${aura.userName}` : "דורי"}
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

            {/* Chat Messages Area */}
            <ScrollView 
              ref={scrollViewRef}
              style={styles.chatContainer}
              contentContainerStyle={styles.chatContent}
              showsVerticalScrollIndicator={false}
            >
              {chatMessages.length === 0 ? (
                <View style={styles.emptyChat}>
                  <Feather name="message-circle" size={48} color={theme.textSecondary} />
                  <ThemedText style={[styles.emptyChatText, { color: theme.textSecondary }]}>
                    דבר או כתוב לי משהו
                  </ThemedText>
                </View>
              ) : (
                chatMessages.map((msg) => (
                  <View
                    key={msg.id}
                    style={[
                      styles.messageBubble,
                      msg.role === "user" ? styles.userBubble : styles.assistantBubble,
                      { backgroundColor: msg.role === "user" ? AuraColors.speaking + "30" : theme.glassBg }
                    ]}
                  >
                    <ThemedText style={[styles.messageText, { color: theme.text }]}>
                      {msg.content}
                    </ThemedText>
                  </View>
                ))
              )}
              {isTyping ? (
                <View style={[styles.messageBubble, styles.assistantBubble, { backgroundColor: theme.glassBg }]}>
                  <ActivityIndicator size="small" color={AuraColors.thinking} />
                  <ThemedText style={[styles.messageText, { color: theme.textSecondary, marginLeft: Spacing.sm }]}>
                    חושבת...
                  </ThemedText>
                </View>
              ) : null}
            </ScrollView>

            {/* Voice Status Indicator */}
            {isListening ? (
              <View style={[styles.voiceStatus, { backgroundColor: AuraColors.listening + "20", borderColor: AuraColors.listening }]}>
                <WaveVisualizer state="listening" width={120} height={30} />
                <ThemedText style={[styles.voiceStatusText, { color: AuraColors.listening }]}>
                  מקשיבה...
                </ThemedText>
              </View>
            ) : isProcessing ? (
              <View style={[styles.voiceStatus, { backgroundColor: AuraColors.thinking + "20", borderColor: AuraColors.thinking }]}>
                <WaveVisualizer state="idle" width={120} height={30} color={AuraColors.thinking} />
                <ThemedText style={[styles.voiceStatusText, { color: AuraColors.thinking }]}>
                  מעבדת...
                </ThemedText>
              </View>
            ) : isSpeaking ? (
              <View style={[styles.voiceStatus, { backgroundColor: AuraColors.speaking + "20", borderColor: AuraColors.speaking }]}>
                <WaveVisualizer state="speaking" width={120} height={30} />
                <ThemedText style={[styles.voiceStatusText, { color: AuraColors.speaking }]}>
                  מדברת...
                </ThemedText>
              </View>
            ) : null}

            {/* Input Area - Text + Voice */}
            <View style={[styles.inputContainer, { borderTopColor: theme.glassBorder }]}>
              <TextInput
                style={[styles.textInput, { backgroundColor: theme.glassBg, borderColor: theme.glassBorder, color: theme.text }]}
                placeholder="כתוב הודעה..."
                placeholderTextColor={theme.textSecondary}
                value={textInput}
                onChangeText={setTextInput}
                onSubmitEditing={() => sendTextMessage(textInput)}
                returnKeyType="send"
                multiline={false}
                editable={!isTyping && !isListening}
              />
              
              {textInput.trim() ? (
                <Pressable
                  style={[styles.sendButton, { backgroundColor: AuraColors.speaking }]}
                  onPress={() => sendTextMessage(textInput)}
                  disabled={isTyping}
                >
                  <Feather name="send" size={22} color="#fff" />
                </Pressable>
              ) : (
                <Pressable
                  style={[
                    styles.sendButton, 
                    { backgroundColor: isActive ? AuraColors.speaking : theme.glassBg }
                  ]}
                  onPress={handleTalkToMe}
                >
                  <Feather 
                    name={getButtonIcon() as any} 
                    size={22} 
                    color={isActive ? "#fff" : theme.primary} 
                  />
                </Pressable>
              )}
            </View>
          </BlurView>
        </KeyboardAvoidingView>
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
    paddingBottom: 20,
    overflow: "hidden",
    maxHeight: SCREEN_HEIGHT * 0.75,
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
  chatContainer: {
    flex: 1,
    minHeight: 200,
    maxHeight: 300,
  },
  chatContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  emptyChat: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.xl * 2,
    gap: Spacing.md,
  },
  emptyChatText: {
    fontSize: 18,
    textAlign: "center",
  },
  messageBubble: {
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
    maxWidth: "85%",
    flexDirection: "row",
    alignItems: "center",
  },
  userBubble: {
    alignSelf: "flex-end",
  },
  assistantBubble: {
    alignSelf: "flex-start",
  },
  messageText: {
    fontSize: 17,
    lineHeight: 24,
    textAlign: "right",
  },
  voiceStatus: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: Spacing.lg,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  voiceStatusText: {
    fontSize: 16,
    fontWeight: "500",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderTopWidth: 1,
    gap: Spacing.sm,
  },
  textInput: {
    flex: 1,
    height: 48,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    fontSize: 18,
    textAlign: "right",
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  listeningText: {
    fontSize: 18,
    lineHeight: 28,
    textAlign: "right",
    fontWeight: "500",
  },
});

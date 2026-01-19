import React, { useState, useRef } from "react";
import { StyleSheet, View, Platform, ScrollView, TextInput, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { Feather } from "@expo/vector-icons";
import Animated, {
  FadeIn,
  FadeInUp,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { useMutation } from "@tanstack/react-query";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { GlassCard } from "@/components/GlassCard";
import { GlassButton } from "@/components/GlassButton";
import { FloatingMicButton } from "@/components/FloatingMicButton";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { apiRequest } from "@/lib/query-client";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export default function GrandchildModeScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { t } = useTranslation();
  const scrollRef = useRef<ScrollView>(null);
  
  const [isActive, setIsActive] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const pulseValue = useSharedValue(1);

  React.useEffect(() => {
    if (isActive) {
      pulseValue.value = withRepeat(
        withSequence(
          withTiming(1.05, { duration: 1500 }),
          withTiming(1, { duration: 1500 })
        ),
        -1,
        true
      );
    }
  }, [isActive]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseValue.value }],
  }));

  const aiMutation = useMutation({
    mutationFn: async (question: string) => {
      const response = await apiRequest("POST", "/api/ai/grandchild-help", {
        question,
        context: "helping a senior with technology",
        language: t("common.loading") === "טוען..." ? "he" : "en",
        history: messages.slice(-4).map(m => ({ role: m.role, content: m.content })),
      });
      return response.json();
    },
    onSuccess: (data) => {
      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: data.response || t("grandchildMode.errorMessage"),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setSuggestions(data.suggestions || []);
      setIsTyping(false);
      setTimeout(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      }, 100);
    },
    onError: () => {
      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: t("grandchildMode.errorMessage"),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setSuggestions([]);
      setIsTyping(false);
    },
  });

  const QUICK_QUESTIONS = [
    t("grandchildMode.questionPhoto"),
    t("grandchildMode.questionWhatsApp"),
    t("grandchildMode.questionButton"),
    t("grandchildMode.questionConfused"),
  ];

  const handleStartSession = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setIsActive(true);
    const welcomeMessage: Message = {
      id: "welcome",
      role: "assistant",
      content: t("grandchildMode.welcomeMessage"),
    };
    setMessages([welcomeMessage]);
    setSuggestions(QUICK_QUESTIONS);
  };

  const handleSendMessage = (text: string) => {
    if (!text.trim()) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text.trim(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setSuggestions([]);
    setInputText("");
    setIsTyping(true);
    
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 100);
    
    aiMutation.mutate(text.trim());
  };

  const handleQuickQuestion = (question: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    handleSendMessage(question);
  };

  const handleMicPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    handleSendMessage("I need help with something on my screen");
  };

  return (
    <ThemedView style={styles.container}>
      {!isActive ? (
        <View
          style={[
            styles.content,
            {
              paddingTop: headerHeight + Spacing.xl,
              paddingBottom: insets.bottom + Spacing.xl,
            },
          ]}
        >
          <Animated.View
            entering={FadeInUp.duration(600)}
            style={styles.introContainer}
          >
            <View
              style={[
                styles.iconCircle,
                { backgroundColor: theme.primary + "20" },
              ]}
            >
              <Feather name="monitor" size={64} color={theme.primary} />
            </View>
            <ThemedText type="h2" style={styles.title}>
              {t("grandchildMode.title")}
            </ThemedText>
            <ThemedText
              type="body"
              style={[styles.description, { color: theme.textSecondary }]}
            >
              {t("grandchildMode.ready")}
            </ThemedText>
            <ThemedText
              type="small"
              style={[styles.hint, { color: theme.textSecondary }]}
            >
              {t("grandchildMode.hint")}
            </ThemedText>
            <GlassButton
              onPress={handleStartSession}
              icon={<Feather name="play" size={24} color="#FFFFFF" />}
              style={styles.startButton}
              testID="start-session-button"
            >
              {t("common.start")}
            </GlassButton>
          </Animated.View>
        </View>
      ) : (
        <View style={[styles.chatContainer, { paddingTop: headerHeight }]}>
          <ScrollView
            ref={scrollRef}
            style={styles.messageList}
            contentContainerStyle={[
              styles.messageContent,
              { paddingBottom: Spacing.lg },
            ]}
            showsVerticalScrollIndicator={false}
          >
            {messages.map((message, index) => (
              <Animated.View
                key={message.id}
                entering={FadeInDown.delay(0).duration(300)}
                style={[
                  styles.messageBubble,
                  message.role === "user"
                    ? [styles.userBubble, { backgroundColor: theme.primary }]
                    : [styles.assistantBubble, { backgroundColor: theme.card }],
                ]}
              >
                {message.role === "assistant" ? (
                  <View style={styles.assistantHeader}>
                    <View style={[styles.assistantAvatar, { backgroundColor: theme.primary + "20" }]}>
                      <Feather name="heart" size={16} color={theme.primary} />
                    </View>
                    <ThemedText type="small" style={{ color: theme.textSecondary, fontWeight: "600" }}>
                      {t("grandchildMode.assistantName")}
                    </ThemedText>
                  </View>
                ) : null}
                <ThemedText
                  type="body"
                  style={[
                    styles.messageText,
                    message.role === "user" ? { color: "#FFFFFF" } : {},
                  ]}
                >
                  {message.content}
                </ThemedText>
              </Animated.View>
            ))}
            
            {isTyping ? (
              <Animated.View
                entering={FadeIn.duration(200)}
                style={[styles.typingIndicator, { backgroundColor: theme.card }]}
              >
                <View style={styles.typingDots}>
                  <View style={[styles.dot, { backgroundColor: theme.primary }]} />
                  <View style={[styles.dot, { backgroundColor: theme.primary, opacity: 0.7 }]} />
                  <View style={[styles.dot, { backgroundColor: theme.primary, opacity: 0.4 }]} />
                </View>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  {t("grandchildMode.thinking")}
                </ThemedText>
              </Animated.View>
            ) : null}
            
            {messages.length >= 1 ? (
              <Animated.View 
                entering={FadeInUp.delay(300).duration(400)}
                style={styles.quickQuestions}
              >
                {suggestions.length > 0 && (
                  <ThemedText type="small" style={[styles.quickLabel, { color: theme.textSecondary }]}>
                    {t("grandchildMode.commonQuestions")}
                  </ThemedText>
                )}
                {suggestions.map((question, index) => (
                  <Pressable
                    key={`${question}-${index}`}
                    style={[styles.quickButton, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}
                    onPress={() => handleQuickQuestion(question)}
                  >
                    <Feather name="help-circle" size={16} color={theme.primary} />
                    <ThemedText type="body" style={styles.quickText}>{question}</ThemedText>
                  </Pressable>
                ))}
              </Animated.View>
            ) : null}
          </ScrollView>

          <View style={[styles.inputArea, { paddingBottom: insets.bottom + Spacing.md, backgroundColor: theme.background }]}>
            <View style={[styles.inputRow, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <TextInput
                style={[styles.textInput, { color: theme.text, textAlign: t("common.loading") === "טוען..." ? "right" : "left" }]}
                placeholder={t("grandchildMode.inputPlaceholder")}
                placeholderTextColor={theme.textSecondary}
                value={inputText}
                onChangeText={setInputText}
                onSubmitEditing={() => handleSendMessage(inputText)}
                multiline
              />
              <Pressable
                style={[styles.sendButton, { backgroundColor: inputText.trim() ? theme.primary : theme.backgroundSecondary }]}
                onPress={() => handleSendMessage(inputText)}
                disabled={!inputText.trim()}
              >
                <Feather name="send" size={20} color={inputText.trim() ? "#FFFFFF" : theme.textSecondary} />
              </Pressable>
            </View>
            
            <Pressable
              style={[styles.endSessionBtn, { borderColor: theme.danger }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                setIsActive(false);
                setMessages([]);
                navigation.goBack();
              }}
            >
              <Feather name="x" size={16} color={theme.danger} />
              <ThemedText type="small" style={{ color: theme.danger, marginLeft: Spacing.xs }}>
                {t("grandchildMode.endSession")}
              </ThemedText>
            </Pressable>
          </View>
        </View>
      )}

      {isActive ? (
        <FloatingMicButton
          onPress={handleMicPress}
          isListening={false}
          testID="mic-button"
        />
      ) : null}
    </ThemedView>
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
  introContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  iconCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing["2xl"],
  },
  title: {
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  description: {
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  hint: {
    textAlign: "center",
    marginBottom: Spacing["3xl"],
  },
  startButton: {
    width: "100%",
    maxWidth: 300,
  },
  chatContainer: {
    flex: 1,
  },
  messageList: {
    flex: 1,
  },
  messageContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  messageBubble: {
    maxWidth: "85%",
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
  },
  userBubble: {
    alignSelf: "flex-end",
    borderBottomRightRadius: BorderRadius.sm,
  },
  assistantBubble: {
    alignSelf: "flex-start",
    borderBottomLeftRadius: BorderRadius.sm,
  },
  assistantHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  assistantAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.sm,
  },
  messageText: {
    lineHeight: 24,
  },
  typingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignSelf: "flex-start",
    marginBottom: Spacing.md,
  },
  typingDots: {
    flexDirection: "row",
    marginRight: Spacing.sm,
    gap: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  quickQuestions: {
    marginTop: Spacing.lg,
  },
  quickLabel: {
    marginBottom: Spacing.md,
  },
  quickButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  quickText: {
    marginLeft: Spacing.sm,
  },
  inputArea: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  textInput: {
    flex: 1,
    fontSize: 18,
    maxHeight: 100,
    paddingVertical: Spacing.sm,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: Spacing.sm,
  },
  endSessionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    marginTop: Spacing.sm,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
  },
});

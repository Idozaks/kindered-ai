import React, { useState, useRef } from "react";
import { StyleSheet, View, Platform, ScrollView, TextInput, Pressable, Image, Linking } from "react-native";
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
import * as ImagePicker from "expo-image-picker";

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
  imageUri?: string;
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
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [cameraPermission, requestCameraPermission] = ImagePicker.useCameraPermissions();

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

  const uriToBase64 = async (uri: string): Promise<string> => {
    const response = await fetch(uri);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        const base64 = result.split(",")[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const aiMutation = useMutation({
    mutationFn: async ({ question, imageUri }: { question: string; imageUri?: string }) => {
      let imageBase64: string | undefined;
      if (imageUri) {
        imageBase64 = await uriToBase64(imageUri);
      }
      const response = await apiRequest("POST", "/api/ai/grandchild-help", {
        question,
        context: "helping a senior with technology",
        language: t("common.loading") === "טוען..." ? "he" : "en",
        history: messages.slice(-4).map(m => ({ role: m.role, content: m.content })),
        imageBase64,
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

  const handleSendMessage = (text: string, imageUri?: string) => {
    if (!text.trim() && !imageUri) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text.trim() || (t("common.loading") === "טוען..." ? "שלחתי תמונה" : "I sent an image"),
      imageUri,
    };
    setMessages((prev) => [...prev, userMessage]);
    setSuggestions([]);
    setInputText("");
    setAttachedImage(null);
    setIsTyping(true);
    
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 100);
    
    aiMutation.mutate({ question: text.trim(), imageUri });
  };

  const handlePickImage = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.7,
      base64: false,
    });

    if (!result.canceled && result.assets[0]) {
      setAttachedImage(result.assets[0].uri);
    }
  };

  const handleOpenCamera = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (!cameraPermission) return;

    if (!cameraPermission.granted) {
      if (cameraPermission.status === "denied" && !cameraPermission.canAskAgain) {
        if (Platform.OS !== "web") {
          try {
            await Linking.openSettings();
          } catch (error) {
          }
        }
        return;
      }
      const permission = await requestCameraPermission();
      if (!permission.granted) return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.7,
      base64: false,
    });

    if (!result.canceled && result.assets[0]) {
      setAttachedImage(result.assets[0].uri);
    }
  };

  const handleRemoveImage = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setAttachedImage(null);
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
                {message.imageUri ? (
                  <Image
                    source={{ uri: message.imageUri }}
                    style={styles.messageImage}
                    resizeMode="cover"
                  />
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
            {attachedImage ? (
              <View style={styles.attachedImageContainer}>
                <Image source={{ uri: attachedImage }} style={styles.attachedImage} resizeMode="cover" />
                <Pressable 
                  style={[styles.removeImageBtn, { backgroundColor: theme.danger }]} 
                  onPress={handleRemoveImage}
                  testID="remove-image-button"
                >
                  <Feather name="x" size={16} color="#FFFFFF" />
                </Pressable>
              </View>
            ) : null}
            
            <View style={styles.attachmentButtons}>
              <Pressable 
                style={[styles.attachmentBtn, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]} 
                onPress={handleOpenCamera}
                testID="camera-button"
              >
                <Feather name="camera" size={22} color={theme.primary} />
                <ThemedText type="small" style={{ color: theme.textSecondary, marginLeft: Spacing.xs }}>
                  {t("common.loading") === "טוען..." ? "מצלמה" : "Camera"}
                </ThemedText>
              </Pressable>
              <Pressable 
                style={[styles.attachmentBtn, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]} 
                onPress={handlePickImage}
                testID="gallery-button"
              >
                <Feather name="image" size={22} color={theme.primary} />
                <ThemedText type="small" style={{ color: theme.textSecondary, marginLeft: Spacing.xs }}>
                  {t("common.loading") === "טוען..." ? "גלריה" : "Gallery"}
                </ThemedText>
              </Pressable>
            </View>
            
            <View style={[styles.inputRow, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <TextInput
                style={[styles.textInput, { color: theme.text, textAlign: t("common.loading") === "טוען..." ? "right" : "left" }]}
                placeholder={t("grandchildMode.inputPlaceholder")}
                placeholderTextColor={theme.textSecondary}
                value={inputText}
                onChangeText={setInputText}
                onSubmitEditing={() => handleSendMessage(inputText, attachedImage || undefined)}
                multiline
              />
              <Pressable
                style={[styles.sendButton, { backgroundColor: (inputText.trim() || attachedImage) ? theme.primary : theme.backgroundSecondary }]}
                onPress={() => handleSendMessage(inputText, attachedImage || undefined)}
                disabled={!inputText.trim() && !attachedImage}
                testID="send-button"
              >
                <Feather name="send" size={20} color={(inputText.trim() || attachedImage) ? "#FFFFFF" : theme.textSecondary} />
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
  messageImage: {
    width: "100%",
    height: 180,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
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
  attachedImageContainer: {
    position: "relative",
    marginBottom: Spacing.md,
    alignSelf: "flex-start",
  },
  attachedImage: {
    width: 120,
    height: 120,
    borderRadius: BorderRadius.md,
  },
  removeImageBtn: {
    position: "absolute",
    top: -8,
    right: -8,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  attachmentButtons: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  attachmentBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
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

import React, { useState, useCallback } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Image,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInDown, FadeIn } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { useTranslation } from "react-i18next";

import { ThemedText } from "@/components/ThemedText";
import { GlassCard } from "@/components/GlassCard";
import { GlassButton } from "@/components/GlassButton";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { getApiUrl } from "@/lib/query-client";
import { InteractionType } from "@/data/aiJourneys";

const AI_PURPLE = "#6C63FF";

interface AIInteractiveDemoProps {
  type: InteractionType;
  prompt: string;
  promptHe?: string;
  onComplete?: () => void;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface QuizQuestion {
  question: string;
  questionHe: string;
  options: string[];
  optionsHe: string[];
  correctIndex: number;
}

const safetyQuizQuestions: QuizQuestion[] = [
  {
    question: "Should you share your password with AI?",
    questionHe: "האם כדאי לשתף את הסיסמה שלך עם בינה מלאכותית?",
    options: ["Yes, AI is safe", "No, never share passwords"],
    optionsHe: ["כן, בינה מלאכותית בטוחה", "לא, לעולם לא לשתף סיסמאות"],
    correctIndex: 1,
  },
  {
    question: "If AI gives medical advice, you should:",
    questionHe: "אם בינה מלאכותית נותנת עצה רפואית, אתה צריך:",
    options: ["Follow it exactly", "Check with your doctor first"],
    optionsHe: ["לעקוב בדיוק", "לבדוק עם הרופא שלך קודם"],
    correctIndex: 1,
  },
  {
    question: "What's the best thing to do if AI's answer seems strange?",
    questionHe: "מה הדבר הטוב ביותר לעשות אם התשובה של הבינה המלאכותית נראית מוזרה?",
    options: ["Trust it anyway", "Ask a family member to check"],
    optionsHe: ["לסמוך עליה בכל זאת", "לבקש מבן משפחה לבדוק"],
    correctIndex: 1,
  },
];

export function AIInteractiveDemo({ type, prompt, promptHe, onComplete }: AIInteractiveDemoProps) {
  const { t, i18n } = useTranslation();
  const { theme } = useTheme();
  const isHebrew = i18n.language === "he";

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [documentImage, setDocumentImage] = useState<string | null>(null);
  const [documentAnalysis, setDocumentAnalysis] = useState<any>(null);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizComplete, setQuizComplete] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const currentPrompt = isHebrew && promptHe ? promptHe : prompt;

  const sendChatMessage = useCallback(async () => {
    if (!input.trim() || loading) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      const response = await fetch(new URL("/api/ai/grandchild-help", getApiUrl()).toString(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: userMessage,
          context: "learning about AI",
          language: i18n.language,
          history: messages,
        }),
      });

      const data = await response.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.response }]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: isHebrew ? "סליחה, נסה שוב." : "Sorry, please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages, i18n.language, isHebrew]);

  const sendQuestionPractice = useCallback(async () => {
    if (!input.trim() || loading) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const userQuestion = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userQuestion }]);
    setLoading(true);

    try {
      const feedbackPrompt = isHebrew
        ? `המשתמש שואל: "${userQuestion}"

תן משוב קצר וחיובי על השאלה שלהם (2-3 משפטים). אם השאלה טובה, שבח אותם! אם יש מקום לשיפור, הצע בעדינות איך להפוך אותה לספציפית יותר. תמיד היה מעודד.`
        : `The user asks: "${userQuestion}"

Give brief, positive feedback on their question (2-3 sentences). If it's a good question, praise them! If there's room for improvement, gently suggest how to make it more specific. Always be encouraging.`;

      const response = await fetch(new URL("/api/ai/grandchild-help", getApiUrl()).toString(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: feedbackPrompt,
          context: "teaching how to ask good questions",
          language: i18n.language,
        }),
      });

      const data = await response.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.response }]);
    } catch (error) {
      console.error("Question practice error:", error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: isHebrew ? "שאלה טובה! המשך לתרגל." : "Good question! Keep practicing." },
      ]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, i18n.language, isHebrew]);

  const generateImage = useCallback(async () => {
    if (!input.trim() || loading) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const description = input.trim();
    setInput("");
    setLoading(true);
    setGeneratedImage(null);

    try {
      const enhancedPrompt = `Create a beautiful, colorful, and cheerful image: ${description}. Make it bright, positive, and suitable for all ages. High quality digital art style.`;

      const response = await fetch(new URL("/api/generate-image", getApiUrl()).toString(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: enhancedPrompt }),
      });

      const data = await response.json();
      if (data.b64_json) {
        setGeneratedImage(`data:${data.mimeType || "image/png"};base64,${data.b64_json}`);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      console.error("Image generation error:", error);
    } finally {
      setLoading(false);
    }
  }, [input, loading]);

  const pickDocument = useCallback(async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        base64: true,
        quality: 0.7,
      });

      if (!result.canceled && result.assets[0]) {
        setDocumentImage(result.assets[0].uri);
        analyzeDocument(result.assets[0].base64!);
      }
    } catch (error) {
      console.error("Image picker error:", error);
    }
  }, []);

  const takePhoto = useCallback(async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        base64: true,
        quality: 0.7,
      });

      if (!result.canceled && result.assets[0]) {
        setDocumentImage(result.assets[0].uri);
        analyzeDocument(result.assets[0].base64!);
      }
    } catch (error) {
      console.error("Camera error:", error);
    }
  }, []);

  const analyzeDocument = useCallback(async (base64: string) => {
    setLoading(true);
    setDocumentAnalysis(null);

    try {
      const response = await fetch(new URL("/api/ai/letter-analyze", getApiUrl()).toString(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64 }),
      });

      const data = await response.json();
      setDocumentAnalysis(data);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error("Document analysis error:", error);
      setDocumentAnalysis({
        type: isHebrew ? "מסמך" : "Document",
        summary: isHebrew ? "לא הצלחתי לקרוא את המסמך. נסה שוב." : "Could not read the document. Please try again.",
        urgency: "low",
      });
    } finally {
      setLoading(false);
    }
  }, [isHebrew]);

  const handleQuizAnswer = useCallback((answerIndex: number) => {
    if (showFeedback) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedAnswer(answerIndex);
    setShowFeedback(true);

    const isCorrect = answerIndex === safetyQuizQuestions[quizIndex].correctIndex;
    if (isCorrect) {
      setQuizScore((prev) => prev + 1);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }

    setTimeout(() => {
      if (quizIndex < safetyQuizQuestions.length - 1) {
        setQuizIndex((prev) => prev + 1);
        setSelectedAnswer(null);
        setShowFeedback(false);
      } else {
        setQuizComplete(true);
      }
    }, 1500);
  }, [quizIndex, showFeedback]);

  const renderChatDemo = () => (
    <View style={styles.container}>
      <GlassCard style={styles.promptCard}>
        <Feather name="message-circle" size={24} color={AI_PURPLE} />
        <ThemedText type="body" style={styles.promptText}>
          {currentPrompt}
        </ThemedText>
      </GlassCard>

      <ScrollView style={styles.messagesContainer} contentContainerStyle={styles.messagesContent}>
        {messages.map((msg, index) => (
          <Animated.View
            key={index}
            entering={FadeInDown.delay(index * 100).duration(300)}
            style={[
              styles.messageBubble,
              msg.role === "user" ? styles.userBubble : styles.assistantBubble,
              { backgroundColor: msg.role === "user" ? AI_PURPLE : theme.card },
            ]}
          >
            <ThemedText
              type="body"
              style={{ color: msg.role === "user" ? "#FFFFFF" : theme.text, fontSize: 18 }}
            >
              {msg.content}
            </ThemedText>
          </Animated.View>
        ))}
        {loading ? (
          <View style={[styles.messageBubble, styles.assistantBubble, { backgroundColor: theme.card }]}>
            <ActivityIndicator color={AI_PURPLE} />
          </View>
        ) : null}
      </ScrollView>

      <View style={[styles.inputContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <TextInput
          style={[styles.input, { color: theme.text }]}
          placeholder={isHebrew ? "הקלד שאלה..." : "Type a question..."}
          placeholderTextColor={theme.textSecondary}
          value={input}
          onChangeText={setInput}
          multiline
          maxLength={500}
        />
        <Pressable
          onPress={type === "question-practice" ? sendQuestionPractice : sendChatMessage}
          style={[styles.sendButton, { backgroundColor: AI_PURPLE }]}
          disabled={!input.trim() || loading}
        >
          <Feather name="send" size={20} color="#FFFFFF" />
        </Pressable>
      </View>
    </View>
  );

  const renderImageGeneration = () => (
    <View style={styles.container}>
      <GlassCard style={styles.promptCard}>
        <Feather name="image" size={24} color={AI_PURPLE} />
        <ThemedText type="body" style={styles.promptText}>
          {currentPrompt}
        </ThemedText>
      </GlassCard>

      {generatedImage ? (
        <Animated.View entering={FadeIn.duration(500)} style={styles.imageContainer}>
          <Image source={{ uri: generatedImage }} style={styles.generatedImage} resizeMode="contain" />
          <GlassButton
            onPress={() => {
              setGeneratedImage(null);
              setInput("");
            }}
            variant="secondary"
            style={styles.tryAgainButton}
          >
            {isHebrew ? "נסה עוד תמונה" : "Try another"}
          </GlassButton>
        </Animated.View>
      ) : (
        <>
          <View style={[styles.inputContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder={isHebrew ? "תאר את התמונה שאתה רוצה..." : "Describe the picture you want..."}
              placeholderTextColor={theme.textSecondary}
              value={input}
              onChangeText={setInput}
              multiline
              maxLength={300}
            />
          </View>
          <GlassButton onPress={generateImage} disabled={!input.trim() || loading} style={styles.generateButton}>
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Feather name="zap" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                {isHebrew ? "צור תמונה" : "Create Picture"}
              </>
            )}
          </GlassButton>
        </>
      )}
    </View>
  );

  const renderDocumentReader = () => (
    <View style={styles.container}>
      <GlassCard style={styles.promptCard}>
        <Feather name="file-text" size={24} color={AI_PURPLE} />
        <ThemedText type="body" style={styles.promptText}>
          {currentPrompt}
        </ThemedText>
      </GlassCard>

      {documentImage ? (
        <View style={styles.documentContainer}>
          <Image source={{ uri: documentImage }} style={styles.documentPreview} resizeMode="contain" />
          {loading ? (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color={AI_PURPLE} />
              <ThemedText type="body" style={{ marginTop: Spacing.md, color: theme.text }}>
                {isHebrew ? "קורא את המסמך..." : "Reading the document..."}
              </ThemedText>
            </View>
          ) : documentAnalysis ? (
            <Animated.View entering={FadeInDown.duration(400)}>
              <GlassCard style={styles.analysisCard}>
                <View style={styles.analysisHeader}>
                  <ThemedText type="h4" style={{ color: AI_PURPLE }}>
                    {documentAnalysis.type}
                  </ThemedText>
                  <View
                    style={[
                      styles.urgencyBadge,
                      {
                        backgroundColor:
                          documentAnalysis.urgency === "high"
                            ? Colors.light.danger + "20"
                            : documentAnalysis.urgency === "medium"
                            ? Colors.light.warning + "20"
                            : Colors.light.success + "20",
                      },
                    ]}
                  >
                    <ThemedText
                      type="small"
                      style={{
                        color:
                          documentAnalysis.urgency === "high"
                            ? Colors.light.danger
                            : documentAnalysis.urgency === "medium"
                            ? Colors.light.warning
                            : Colors.light.success,
                      }}
                    >
                      {documentAnalysis.urgency === "high"
                        ? isHebrew
                          ? "דחוף"
                          : "Urgent"
                        : documentAnalysis.urgency === "medium"
                        ? isHebrew
                          ? "לטפל השבוע"
                          : "This week"
                        : isHebrew
                        ? "לא דחוף"
                        : "Not urgent"}
                    </ThemedText>
                  </View>
                </View>
                <ThemedText type="body" style={{ fontSize: 18, lineHeight: 28, marginTop: Spacing.md }}>
                  {documentAnalysis.summary}
                </ThemedText>
              </GlassCard>
              <GlassButton
                onPress={() => {
                  setDocumentImage(null);
                  setDocumentAnalysis(null);
                }}
                variant="secondary"
                style={styles.tryAgainButton}
              >
                {isHebrew ? "צלם מסמך אחר" : "Try another document"}
              </GlassButton>
            </Animated.View>
          ) : null}
        </View>
      ) : (
        <View style={styles.photoButtons}>
          <GlassButton onPress={takePhoto} style={styles.photoButton}>
            <Feather name="camera" size={24} color="#FFFFFF" style={{ marginRight: 8 }} />
            {isHebrew ? "צלם תמונה" : "Take Photo"}
          </GlassButton>
          <GlassButton onPress={pickDocument} variant="secondary" style={styles.photoButton}>
            <Feather name="image" size={24} color={AI_PURPLE} style={{ marginRight: 8 }} />
            {isHebrew ? "בחר מהגלריה" : "Choose from Gallery"}
          </GlassButton>
        </View>
      )}
    </View>
  );

  const renderSafetyQuiz = () => {
    if (quizComplete) {
      const passed = quizScore >= 2;
      return (
        <Animated.View entering={FadeIn.duration(500)} style={styles.container}>
          <GlassCard style={{...styles.quizResultCard, backgroundColor: passed ? Colors.light.success + "10" : Colors.light.warning + "10" }}>
            <Feather
              name={passed ? "award" : "refresh-cw"}
              size={48}
              color={passed ? Colors.light.success : Colors.light.warning}
            />
            <ThemedText type="h3" style={{ textAlign: "center", marginTop: Spacing.lg }}>
              {passed
                ? isHebrew
                  ? "מעולה! קיבלת את תג הבטיחות!"
                  : "Excellent! You earned your Safety Badge!"
                : isHebrew
                ? "כמעט! בוא ננסה שוב."
                : "Almost! Let's try again."}
            </ThemedText>
            <ThemedText type="body" style={{ textAlign: "center", marginTop: Spacing.sm, color: theme.textSecondary }}>
              {isHebrew ? `ניקוד: ${quizScore}/${safetyQuizQuestions.length}` : `Score: ${quizScore}/${safetyQuizQuestions.length}`}
            </ThemedText>
            {!passed ? (
              <GlassButton
                onPress={() => {
                  setQuizIndex(0);
                  setQuizScore(0);
                  setQuizComplete(false);
                  setSelectedAnswer(null);
                  setShowFeedback(false);
                }}
                style={{ marginTop: Spacing.xl }}
              >
                {isHebrew ? "נסה שוב" : "Try Again"}
              </GlassButton>
            ) : null}
          </GlassCard>
        </Animated.View>
      );
    }

    const currentQuestion = safetyQuizQuestions[quizIndex];
    const options = isHebrew ? currentQuestion.optionsHe : currentQuestion.options;
    const question = isHebrew ? currentQuestion.questionHe : currentQuestion.question;

    return (
      <View style={styles.container}>
        <GlassCard style={styles.quizCard}>
          <View style={styles.quizProgress}>
            <ThemedText type="small" style={{ color: AI_PURPLE }}>
              {isHebrew ? `שאלה ${quizIndex + 1}/${safetyQuizQuestions.length}` : `Question ${quizIndex + 1}/${safetyQuizQuestions.length}`}
            </ThemedText>
          </View>
          <ThemedText type="h4" style={styles.questionText}>
            {question}
          </ThemedText>
          <View style={styles.optionsContainer}>
            {options.map((option, index) => {
              const isCorrect = index === currentQuestion.correctIndex;
              const isSelected = selectedAnswer === index;
              let bgColor = theme.card;
              let textColor = theme.text;

              if (showFeedback) {
                if (isCorrect) {
                  bgColor = Colors.light.success + "30";
                  textColor = Colors.light.success;
                } else if (isSelected && !isCorrect) {
                  bgColor = Colors.light.danger + "30";
                  textColor = Colors.light.danger;
                }
              } else if (isSelected) {
                bgColor = AI_PURPLE + "20";
              }

              return (
                <Pressable
                  key={index}
                  onPress={() => handleQuizAnswer(index)}
                  style={[styles.optionButton, { backgroundColor: bgColor, borderColor: showFeedback && isCorrect ? Colors.light.success : theme.border }]}
                  disabled={showFeedback}
                >
                  <ThemedText type="body" style={{ color: textColor, fontSize: 18 }}>
                    {option}
                  </ThemedText>
                  {showFeedback && isCorrect ? <Feather name="check" size={20} color={Colors.light.success} /> : null}
                  {showFeedback && isSelected && !isCorrect ? <Feather name="x" size={20} color={Colors.light.danger} /> : null}
                </Pressable>
              );
            })}
          </View>
        </GlassCard>
      </View>
    );
  };

  switch (type) {
    case "chat-demo":
    case "question-practice":
      return renderChatDemo();
    case "image-generation":
      return renderImageGeneration();
    case "document-reader":
      return renderDocumentReader();
    case "safety-quiz":
      return renderSafetyQuiz();
    default:
      return null;
  }
}

const styles = StyleSheet.create({
  container: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  promptCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  promptText: {
    flex: 1,
    fontSize: 16,
  },
  messagesContainer: {
    maxHeight: 250,
    marginBottom: Spacing.md,
  },
  messagesContent: {
    gap: Spacing.sm,
  },
  messageBubble: {
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    maxWidth: "85%",
  },
  userBubble: {
    alignSelf: "flex-end",
    borderBottomRightRadius: BorderRadius.xs,
  },
  assistantBubble: {
    alignSelf: "flex-start",
    borderBottomLeftRadius: BorderRadius.xs,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 18,
    maxHeight: 100,
    minHeight: 44,
    paddingVertical: 8,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  imageContainer: {
    alignItems: "center",
  },
  generatedImage: {
    width: "100%",
    height: 250,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
  },
  generateButton: {
    marginTop: Spacing.md,
  },
  tryAgainButton: {
    marginTop: Spacing.md,
  },
  documentContainer: {
    alignItems: "center",
  },
  documentPreview: {
    width: "100%",
    height: 200,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
  },
  loadingOverlay: {
    alignItems: "center",
    padding: Spacing.xl,
  },
  analysisCard: {
    padding: Spacing.lg,
    marginTop: Spacing.md,
  },
  analysisHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  urgencyBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  photoButtons: {
    gap: Spacing.md,
  },
  photoButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  quizCard: {
    padding: Spacing.xl,
  },
  quizProgress: {
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  questionText: {
    textAlign: "center",
    marginBottom: Spacing.xl,
  },
  optionsContainer: {
    gap: Spacing.md,
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  quizResultCard: {
    padding: Spacing.xl,
    alignItems: "center",
  },
});

export default AIInteractiveDemo;

import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
  FlatList,
  Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
} from "react-native-reanimated";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import {
  Colors,
  Spacing,
  Typography,
  BorderRadius,
  Shadows,
} from "@/constants/theme";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface OnboardingStep {
  id: string;
  icon: keyof typeof Feather.glyphMap;
  title: string;
  titleHe: string;
  description: string;
  descriptionHe: string;
  color: string;
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: "welcome",
    icon: "heart",
    title: "Welcome to Kindred AI",
    titleHe: "ברוכים הבאים ל-Kindred AI",
    description: "Your patient, friendly digital companion - like having a helpful grandchild always by your side.",
    descriptionHe: "המלווה הדיגיטלי הסבלני והידידותי שלך - כמו נכד עוזר שתמיד לצידך.",
    color: Colors.light.primary,
  },
  {
    id: "whatsapp",
    icon: "message-circle",
    title: "Learn WhatsApp",
    titleHe: "למד וואטסאפ",
    description: "Step-by-step guides with pictures to help you send messages, make calls, and stay connected with family.",
    descriptionHe: "מדריכים צעד אחר צעד עם תמונות שיעזרו לך לשלוח הודעות, לבצע שיחות ולהישאר בקשר עם המשפחה.",
    color: "#25D366",
  },
  {
    id: "practice",
    icon: "play-circle",
    title: "Safe Practice Zone",
    titleHe: "אזור תרגול בטוח",
    description: "Practice any digital task without worry - nothing you do here affects the real world.",
    descriptionHe: "תרגל כל משימה דיגיטלית בלי דאגה - שום דבר שתעשה כאן לא משפיע על העולם האמיתי.",
    color: Colors.light.secondary,
  },
  {
    id: "help",
    icon: "help-circle",
    title: "Help Anytime",
    titleHe: "עזרה בכל עת",
    description: "Just ask! Use the microphone button to speak your question and get clear, patient answers.",
    descriptionHe: "פשוט תשאל! השתמש בכפתור המיקרופון לדבר את השאלה שלך ולקבל תשובות ברורות וסבלניות.",
    color: Colors.light.success,
  },
];

export default function OnboardingScreen() {
  const { theme } = useTheme();
  const { completeOnboarding, user } = useAuth();
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isCompleting, setIsCompleting] = useState(false);
  const scrollX = useSharedValue(0);

  const handleNext = () => {
    if (currentIndex < onboardingSteps.length - 1) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleComplete = async () => {
    setIsCompleting(true);
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await completeOnboarding();
    } catch (error) {
      console.error("Error completing onboarding:", error);
    } finally {
      setIsCompleting(false);
    }
  };

  const isLastStep = currentIndex === onboardingSteps.length - 1;

  const renderStep = ({ item, index }: { item: OnboardingStep; index: number }) => (
    <View style={[styles.stepContainer, { width: SCREEN_WIDTH }]}>
      <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
        <Feather name={item.icon} size={72} color="#FFFFFF" />
      </View>
      
      <Text style={[styles.title, { color: theme.text }]}>
        {item.titleHe}
      </Text>
      <Text style={[styles.titleEnglish, { color: theme.textSecondary }]}>
        {item.title}
      </Text>
      
      <Text style={[styles.description, { color: theme.text }]}>
        {item.descriptionHe}
      </Text>
      <Text style={[styles.descriptionEnglish, { color: theme.textSecondary }]}>
        {item.description}
      </Text>
    </View>
  );

  const renderDots = () => (
    <View style={styles.dotsContainer}>
      {onboardingSteps.map((_, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            {
              backgroundColor: index === currentIndex ? theme.primary : theme.border,
              width: index === currentIndex ? 24 : 10,
            },
          ]}
        />
      ))}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.lg }]}>
        {user?.displayName ? (
          <Text style={[styles.greeting, { color: theme.text }]}>
            שלום, {user.displayName}!
          </Text>
        ) : null}
      </View>

      <FlatList
        ref={flatListRef}
        data={onboardingSteps}
        renderItem={renderStep}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        onScroll={(event) => {
          scrollX.value = event.nativeEvent.contentOffset.x;
        }}
        scrollEventThrottle={16}
      />

      {renderDots()}

      <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.xl }]}>
        <Pressable
          style={[
            styles.button,
            { backgroundColor: isLastStep ? Colors.light.success : theme.primary },
            isCompleting && styles.buttonDisabled,
          ]}
          onPress={isLastStep ? handleComplete : handleNext}
          disabled={isCompleting}
          testID={isLastStep ? "button-start" : "button-next"}
        >
          <Text style={styles.buttonText}>
            {isLastStep ? "בואו נתחיל!" : "הבא"}
          </Text>
          {isLastStep ? null : (
            <Feather name="arrow-left" size={24} color="#FFFFFF" />
          )}
        </Pressable>

        {!isLastStep ? (
          <Pressable
            style={styles.skipButton}
            onPress={handleComplete}
            testID="button-skip"
          >
            <Text style={[styles.skipText, { color: theme.textSecondary }]}>
              דלג
            </Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
  },
  greeting: {
    ...Typography.h3,
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  stepContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing["3xl"],
  },
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: BorderRadius["2xl"],
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing["3xl"],
    ...Shadows.floating,
  },
  title: {
    ...Typography.h2,
    textAlign: "center",
    marginBottom: Spacing.xs,
  },
  titleEnglish: {
    ...Typography.body,
    textAlign: "center",
    marginBottom: Spacing.xl,
  },
  description: {
    ...Typography.body,
    textAlign: "center",
    lineHeight: 32,
    marginBottom: Spacing.sm,
  },
  descriptionEnglish: {
    ...Typography.small,
    textAlign: "center",
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.sm,
    marginVertical: Spacing.xl,
  },
  dot: {
    height: 10,
    borderRadius: 5,
  },
  footer: {
    paddingHorizontal: Spacing.xl,
    gap: Spacing.md,
  },
  button: {
    height: 64,
    borderRadius: BorderRadius.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    ...Shadows.floating,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    ...Typography.button,
    color: "#FFFFFF",
  },
  skipButton: {
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  skipText: {
    ...Typography.body,
  },
});

import React, { useState, useEffect, useRef } from "react";
import { StyleSheet, View, TextInput, FlatList, Pressable, Dimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useTranslation } from "react-i18next";
import { Feather } from "@expo/vector-icons";
import Animated, { 
  FadeInDown, 
  FadeInUp, 
  FadeIn,
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withSequence,
  withTiming,
  withDelay,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { GlassCard } from "@/components/GlassCard";
import { GlassButton } from "@/components/GlassButton";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { PathStep } from "@/lib/storage";

interface ExtendedStep extends PathStep {
  icon?: string;
  difficulty?: "easy" | "medium" | "hard";
  estimatedMinutes?: number;
  subtasks?: { id: string; title: string; completed: boolean }[];
}

interface GeneratedPath {
  title: string;
  steps: ExtendedStep[];
}

import i18n from "@/lib/i18n";
import { apiRequest } from "@/lib/query-client";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;

export default function DecisionNavigatorScreen() {
  const isRTL = i18n.language === "he";
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [currentPath, setCurrentPath] = useState<GeneratedPath | null>(null);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [expandedStep, setExpandedStep] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [subtaskStates, setSubtaskStates] = useState<Record<string, boolean>>({});
  const [showCelebration, setShowCelebration] = useState(false);

  const allCompleted = currentPath && completedSteps.length === currentPath.steps.length;

  useEffect(() => {
    if (allCompleted && !showCelebration) {
      setShowCelebration(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [allCompleted]);

  const handleSubmit = async () => {
    if (!query.trim()) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsLoading(true);

    try {
      const response = await apiRequest("POST", "/api/ai/decision-help", {
        goal: query,
        language: i18n.language,
      });
      const data = await response.json();
      
      if (data.structured?.steps && Array.isArray(data.structured.steps)) {
        const aiSteps: ExtendedStep[] = data.structured.steps.map((step: any, index: number) => ({
          id: String(index + 1),
          title: step.title,
          description: step.description,
          doriAdvice: step.tip,
          hasSandbox: false,
          icon: step.icon || "check-circle",
          difficulty: ["easy", "medium", "hard"][index % 3] as "easy" | "medium" | "hard",
          estimatedMinutes: [5, 15, 30, 10, 20][index % 5],
          subtasks: generateSubtasks(step.description, index),
        }));
        
        setCurrentPath({ title: query, steps: aiSteps });
      } else {
        setCurrentPath({ title: query, steps: getDefaultSteps() });
      }
    } catch (error) {
      console.error("Failed to get AI steps:", error);
      setCurrentPath({ title: query, steps: getDefaultSteps() });
    }

    setIsLoading(false);
    setCompletedSteps([]);
    setExpandedStep(null);
    setSubtaskStates({});
    setShowCelebration(false);
  };

  const generateSubtasks = (description: string, index: number): { id: string; title: string; completed: boolean }[] => {
    const hebrewSubtasks = [
      [{ id: "1-1", title: "בדקתי מה נדרש", completed: false }, { id: "1-2", title: "הכנתי רשימה", completed: false }],
      [{ id: "2-1", title: "מילאתי טופס", completed: false }, { id: "2-2", title: "בדקתי שהכל נכון", completed: false }, { id: "2-3", title: "שמרתי עותק", completed: false }],
      [{ id: "3-1", title: "בחרתי תאריך", completed: false }, { id: "3-2", title: "קיבלתי אישור", completed: false }],
    ];
    const englishSubtasks = [
      [{ id: "1-1", title: "Checked requirements", completed: false }, { id: "1-2", title: "Made a list", completed: false }],
      [{ id: "2-1", title: "Filled out form", completed: false }, { id: "2-2", title: "Reviewed details", completed: false }, { id: "2-3", title: "Saved a copy", completed: false }],
      [{ id: "3-1", title: "Picked a date", completed: false }, { id: "3-2", title: "Got confirmation", completed: false }],
    ];
    const subtasks = isRTL ? hebrewSubtasks : englishSubtasks;
    return subtasks[index % subtasks.length].map(s => ({ ...s, id: `${index}-${s.id}` }));
  };

  const getDefaultSteps = (): ExtendedStep[] => [
    {
      id: "1",
      title: isRTL ? "לחקור את האפשרויות" : "Research your options",
      description: isRTL ? "ללמוד מה מעורב בתהליך" : "Learn about what's involved",
      doriAdvice: isRTL ? "התחל בלהבין מה אתה צריך." : "Start by understanding what you need.",
      hasSandbox: false,
      difficulty: "easy",
      estimatedMinutes: 10,
      subtasks: generateSubtasks("", 0),
    },
  ];

  const handleStepComplete = (stepId: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps([...completedSteps, stepId]);
    }
  };

  const handleStepPress = (stepId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpandedStep(expandedStep === stepId ? null : stepId);
  };

  const handleSubtaskToggle = (subtaskId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSubtaskStates(prev => ({ ...prev, [subtaskId]: !prev[subtaskId] }));
  };

  const progressPercentage = currentPath ? (completedSteps.length / currentPath.steps.length) * 100 : 0;

  const getEncouragingMessage = () => {
    if (!currentPath) return "";
    const progress = completedSteps.length / currentPath.steps.length;
    if (progress === 0) return isRTL ? "בואו נתחיל! אתה יכול לעשות את זה" : "Let's begin! You've got this";
    if (progress < 0.5) return isRTL ? "יפה מאוד! ממשיכים קדימה" : "Great start! Keep going";
    if (progress < 1) return isRTL ? "כמעט שם! עוד קצת" : "Almost there! Just a bit more";
    return isRTL ? "מדהים! סיימת הכל!" : "Amazing! You did it all!";
  };

  const examples = [
    t("navigator.example1"),
    t("navigator.example2"),
    t("navigator.example3"),
  ];

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.content, { paddingTop: headerHeight + Spacing.xl }]}>
        {!currentPath ? (
          <Animated.View entering={FadeInDown.duration(500)}>
            <GlassCard style={styles.inputCard}>
              <View style={[styles.inputContainer, { backgroundColor: theme.backgroundSecondary }]}>
                <Feather name="compass" size={24} color={theme.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: theme.text, textAlign: isRTL ? "right" : "left" }]}
                  placeholder={t("navigator.placeholder")}
                  placeholderTextColor={theme.textSecondary}
                  value={query}
                  onChangeText={setQuery}
                  multiline
                  testID="goal-input"
                />
              </View>
              <GlassButton
                onPress={handleSubmit}
                disabled={!query.trim() || isLoading}
                icon={isLoading ? null : <Feather name="arrow-right" size={20} color="#FFFFFF" />}
                testID="submit-goal-button"
              >
                {isLoading ? t("common.loading") : t("common.start")}
              </GlassButton>
            </GlassCard>

            <View style={styles.examples}>
              <ThemedText type="small" style={[styles.examplesTitle, { color: theme.textSecondary }]}>
                {t("navigator.examples")}
              </ThemedText>
              {examples.map((example, index) => (
                <Pressable
                  key={index}
                  onPress={() => setQuery(example)}
                  style={({ pressed }) => [
                    styles.exampleChip,
                    { backgroundColor: theme.glassBg, borderColor: theme.glassBorder, opacity: pressed ? 0.7 : 1 },
                  ]}
                >
                  <ThemedText type="small">{example}</ThemedText>
                </Pressable>
              ))}
            </View>
          </Animated.View>
        ) : (
          <Animated.View entering={FadeInUp.duration(500)} style={styles.pathContainer}>
            <ThemedText type="h3" style={[styles.pathTitle, { textAlign: isRTL ? "right" : "left" }]}>
              {currentPath.title}
            </ThemedText>

            <AnimatedProgressRing progress={progressPercentage} theme={theme} />

            <Animated.View entering={FadeIn.delay(300)} style={styles.encouragingContainer}>
              <Feather 
                name={allCompleted ? "award" : "heart"} 
                size={20} 
                color={allCompleted ? theme.warning : theme.primary} 
              />
              <ThemedText 
                type="body" 
                style={[styles.encouragingText, { color: allCompleted ? theme.warning : theme.primary }]}
              >
                {getEncouragingMessage()}
              </ThemedText>
            </Animated.View>

            {showCelebration ? <CelebrationOverlay theme={theme} isRTL={isRTL} /> : null}

            <FlatList
              data={currentPath.steps}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingBottom: insets.bottom + Spacing.xl }}
              renderItem={({ item, index }) => (
                <InteractiveStepCard
                  step={item}
                  index={index}
                  totalSteps={currentPath.steps.length}
                  isCompleted={completedSteps.includes(item.id)}
                  isExpanded={expandedStep === item.id}
                  isRTL={isRTL}
                  subtaskStates={subtaskStates}
                  onPress={() => handleStepPress(item.id)}
                  onComplete={() => handleStepComplete(item.id)}
                  onSubtaskToggle={handleSubtaskToggle}
                  theme={theme}
                />
              )}
              showsVerticalScrollIndicator={false}
            />

            <GlassButton variant="ghost" onPress={() => setCurrentPath(null)} style={styles.backButton}>
              {t("common.back")}
            </GlassButton>
          </Animated.View>
        )}
      </View>
    </ThemedView>
  );
}

function AnimatedProgressRing({ progress, theme }: { progress: number; theme: any }) {
  const animatedProgress = useSharedValue(0);

  useEffect(() => {
    animatedProgress.value = withSpring(progress, { damping: 15, stiffness: 100 });
  }, [progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${animatedProgress.value * 3.6}deg` }],
  }));

  const progressStyle = useAnimatedStyle(() => ({
    width: `${animatedProgress.value}%`,
  }));

  return (
    <View style={styles.progressContainer}>
      <View style={styles.progressRingOuter}>
        <View style={[styles.progressRingInner, { backgroundColor: theme.background }]}>
          <ThemedText type="h2" style={{ color: theme.primary }}>
            {Math.round(progress)}%
          </ThemedText>
        </View>
        <Animated.View 
          style={[styles.progressRingFill, { backgroundColor: theme.primary }, animatedStyle]} 
        />
      </View>
      <View style={[styles.progressBarContainer, { backgroundColor: theme.backgroundSecondary }]}>
        <Animated.View style={[styles.progressBarFill, { backgroundColor: theme.success }, progressStyle]} />
      </View>
    </View>
  );
}

function CelebrationOverlay({ theme, isRTL }: { theme: any; isRTL: boolean }) {
  const particles = Array.from({ length: 20 }, (_, i) => i);

  return (
    <View style={styles.celebrationOverlay} pointerEvents="none">
      {particles.map((i) => (
        <CelebrationParticle key={i} index={i} theme={theme} />
      ))}
      <Animated.View entering={FadeIn.delay(200).duration(500)} style={styles.celebrationBanner}>
        <Feather name="star" size={32} color={theme.warning} />
        <ThemedText type="h2" style={[styles.celebrationText, { color: theme.warning }]}>
          {isRTL ? "כל הכבוד!" : "Well Done!"}
        </ThemedText>
        <Feather name="star" size={32} color={theme.warning} />
      </Animated.View>
    </View>
  );
}

function CelebrationParticle({ index, theme }: { index: number; theme: any }) {
  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);
  const scale = useSharedValue(0);

  useEffect(() => {
    const delay = index * 50;
    const randomX = (Math.random() - 0.5) * SCREEN_WIDTH;
    
    translateY.value = withDelay(delay, withTiming(-300, { duration: 2000 }));
    translateX.value = withDelay(delay, withTiming(randomX, { duration: 2000 }));
    opacity.value = withDelay(delay + 1000, withTiming(0, { duration: 1000 }));
    scale.value = withDelay(delay, withSequence(
      withSpring(1.5, { damping: 5 }),
      withTiming(0.5, { duration: 1500 })
    ));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { translateX: translateX.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  const colors = [theme.primary, theme.success, theme.warning, theme.error];
  const shapes = ["circle", "star", "heart"];
  const shape = shapes[index % shapes.length];
  const color = colors[index % colors.length];

  return (
    <Animated.View 
      style={[
        styles.particle, 
        animatedStyle,
        { left: (index % 5) * (SCREEN_WIDTH / 5) + 20 }
      ]}
    >
      <Feather name={shape as any} size={16} color={color} />
    </Animated.View>
  );
}

interface InteractiveStepCardProps {
  step: ExtendedStep;
  index: number;
  totalSteps: number;
  isCompleted: boolean;
  isExpanded: boolean;
  isRTL: boolean;
  subtaskStates: Record<string, boolean>;
  onPress: () => void;
  onComplete: () => void;
  onSubtaskToggle: (id: string) => void;
  theme: any;
}

function InteractiveStepCard({
  step,
  index,
  totalSteps,
  isCompleted,
  isExpanded,
  isRTL,
  subtaskStates,
  onPress,
  onComplete,
  onSubtaskToggle,
  theme,
}: InteractiveStepCardProps) {
  const checkmarkScale = useSharedValue(isCompleted ? 1 : 0);

  useEffect(() => {
    if (isCompleted) {
      checkmarkScale.value = withSpring(1, { damping: 10, stiffness: 200 });
    }
  }, [isCompleted]);

  const checkmarkAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkmarkScale.value }],
  }));

  const getDifficultyInfo = () => {
    switch (step.difficulty) {
      case "easy": return { color: theme.success, label: isRTL ? "קל" : "Easy", icon: "smile" };
      case "medium": return { color: theme.warning, label: isRTL ? "בינוני" : "Medium", icon: "meh" };
      case "hard": return { color: theme.error, label: isRTL ? "מורכב" : "Complex", icon: "frown" };
      default: return { color: theme.textSecondary, label: "", icon: "circle" };
    }
  };

  const difficultyInfo = getDifficultyInfo();
  const completedSubtasks = step.subtasks?.filter(st => subtaskStates[st.id])?.length || 0;
  const totalSubtasks = step.subtasks?.length || 0;

  return (
    <Animated.View 
      entering={FadeInDown.delay(index * 150).springify()}
      style={styles.stepCardWrapper}
    >
      <View style={[styles.connectionLine, { backgroundColor: theme.glassBorder }]}>
        {index < totalSteps - 1 ? (
          <View style={[styles.connectionDot, { backgroundColor: isCompleted ? theme.success : theme.primary }]} />
        ) : null}
      </View>

      <GlassCard
        onPress={onPress}
        testID={`step-card-${step.id}`}
        style={StyleSheet.flatten([
          styles.stepCard,
          isCompleted && { borderColor: theme.success, borderWidth: 2 },
          isExpanded && { borderColor: theme.primary, borderWidth: 2 },
        ])}
      >
            <View style={[styles.stepHeader, isRTL && { flexDirection: "row-reverse" }]}>
              <View style={[styles.stepNumberContainer, { backgroundColor: isCompleted ? theme.success : theme.primary }]}>
                {isCompleted ? (
                  <Animated.View style={checkmarkAnimStyle}>
                    <Feather name="check" size={20} color="#FFFFFF" />
                  </Animated.View>
                ) : (
                  <ThemedText type="body" style={styles.stepNumber}>{index + 1}</ThemedText>
                )}
              </View>
              
              <View style={[styles.stepTextContainer, { alignItems: isRTL ? "flex-end" : "flex-start" }]}>
                <ThemedText
                  type="body"
                  style={[
                    styles.stepTitle,
                    { textAlign: isRTL ? "right" : "left" },
                    isCompleted && { textDecorationLine: "line-through", color: theme.textSecondary },
                  ]}
                >
                  {step.title}
                </ThemedText>
                
                <View style={[styles.badgesRow, isRTL && { flexDirection: "row-reverse" }]}>
                  <View style={[styles.badge, { backgroundColor: difficultyInfo.color + "20" }]}>
                    <Feather name={difficultyInfo.icon as any} size={12} color={difficultyInfo.color} />
                    <ThemedText type="small" style={[styles.badgeText, { color: difficultyInfo.color }]}>
                      {difficultyInfo.label}
                    </ThemedText>
                  </View>
                  
                  {step.estimatedMinutes ? (
                    <View style={[styles.badge, { backgroundColor: theme.primary + "20" }]}>
                      <Feather name="clock" size={12} color={theme.primary} />
                      <ThemedText type="small" style={[styles.badgeText, { color: theme.primary }]}>
                        {step.estimatedMinutes} {isRTL ? "דק'" : "min"}
                      </ThemedText>
                    </View>
                  ) : null}
                </View>
              </View>

              <Feather
                name={isExpanded ? "chevron-up" : "chevron-down"}
                size={24}
                color={isExpanded ? theme.primary : theme.textSecondary}
              />
            </View>

            {isExpanded ? (
              <Animated.View entering={FadeInDown.duration(300)} style={styles.expandedContent}>
                <ThemedText 
                  type="body" 
                  style={[styles.stepDescription, { color: theme.textSecondary, textAlign: isRTL ? "right" : "left" }]}
                >
                  {step.description}
                </ThemedText>

                {step.subtasks && step.subtasks.length > 0 ? (
                  <View style={styles.subtasksContainer}>
                    <View style={[styles.subtasksHeader, isRTL && { flexDirection: "row-reverse" }]}>
                      <Feather name="list" size={16} color={theme.textSecondary} />
                      <ThemedText type="small" style={[styles.subtasksTitle, { color: theme.textSecondary }]}>
                        {isRTL ? `משימות משנה (${completedSubtasks}/${totalSubtasks})` : `Subtasks (${completedSubtasks}/${totalSubtasks})`}
                      </ThemedText>
                    </View>
                    {step.subtasks.map((subtask) => (
                      <SubtaskItem
                        key={subtask.id}
                        subtask={subtask}
                        isCompleted={subtaskStates[subtask.id] || false}
                        onToggle={() => onSubtaskToggle(subtask.id)}
                        isRTL={isRTL}
                        theme={theme}
                      />
                    ))}
                  </View>
                ) : null}

                <View style={[styles.tipCard, { backgroundColor: theme.primary + "10", borderLeftColor: theme.primary }, isRTL && { borderLeftWidth: 0, borderRightWidth: 4, borderRightColor: theme.primary }]}>
                  <View style={[styles.tipHeader, isRTL && { flexDirection: "row-reverse" }]}>
                    <Feather name="zap" size={20} color={theme.primary} />
                    <ThemedText type="small" style={[styles.tipLabel, { color: theme.primary }, isRTL ? { marginRight: Spacing.sm } : { marginLeft: Spacing.sm }]}>
                      {isRTL ? "טיפ מועיל" : "Helpful Tip"}
                    </ThemedText>
                  </View>
                  <ThemedText type="body" style={[styles.tipText, { textAlign: isRTL ? "right" : "left" }]}>
                    {step.doriAdvice}
                  </ThemedText>
                </View>

                {!isCompleted ? (
                  <GlassButton
                    onPress={onComplete}
                    icon={<Feather name="check" size={18} color="#FFFFFF" />}
                    style={styles.completeButton}
                    testID={`mark-done-${step.id}`}
                  >
                    {isRTL ? "סיימתי שלב זה" : "Mark as Done"}
                  </GlassButton>
                ) : (
                  <View style={[styles.completedBadge, { backgroundColor: theme.success + "20" }]}>
                    <Feather name="check-circle" size={18} color={theme.success} />
                    <ThemedText type="small" style={[{ color: theme.success, fontWeight: "600" }, isRTL ? { marginRight: Spacing.sm } : { marginLeft: Spacing.sm }]}>
                      {isRTL ? "הושלם!" : "Completed!"}
                    </ThemedText>
                  </View>
                )}
              </Animated.View>
            ) : null}
      </GlassCard>
    </Animated.View>
  );
}

function SubtaskItem({ 
  subtask, 
  isCompleted, 
  onToggle, 
  isRTL, 
  theme 
}: { 
  subtask: { id: string; title: string }; 
  isCompleted: boolean; 
  onToggle: () => void; 
  isRTL: boolean; 
  theme: any;
}) {
  const scale = useSharedValue(1);
  const checkScale = useSharedValue(isCompleted ? 1 : 0);

  useEffect(() => {
    checkScale.value = withSpring(isCompleted ? 1 : 0, { damping: 12 });
  }, [isCompleted]);

  const handlePress = () => {
    scale.value = withSequence(withSpring(0.95), withSpring(1));
    onToggle();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const checkAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
  }));

  return (
    <Pressable onPress={handlePress} testID={`subtask-${subtask.id}`}>
      <Animated.View style={[styles.subtaskItem, animatedStyle, isRTL && { flexDirection: "row-reverse" }]}>
        <View style={[styles.subtaskCheckbox, { borderColor: isCompleted ? theme.success : theme.glassBorder, backgroundColor: isCompleted ? theme.success : "transparent" }]}>
          <Animated.View style={checkAnimStyle}>
            <Feather name="check" size={12} color="#FFFFFF" />
          </Animated.View>
        </View>
        <ThemedText 
          type="small" 
          style={[
            styles.subtaskText, 
            { textAlign: isRTL ? "right" : "left" },
            isCompleted && { textDecorationLine: "line-through", color: theme.textSecondary }
          ]}
        >
          {subtask.title}
        </ThemedText>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, paddingHorizontal: Spacing.lg },
  inputCard: { padding: Spacing.xl, gap: Spacing.lg },
  inputContainer: { flexDirection: "row", alignItems: "flex-start", padding: Spacing.lg, borderRadius: BorderRadius.md, minHeight: 100 },
  inputIcon: { marginTop: 4, marginRight: Spacing.md },
  input: { flex: 1, fontSize: 20, lineHeight: 28 },
  examples: { marginTop: Spacing.xl, gap: Spacing.sm },
  examplesTitle: { marginBottom: Spacing.sm },
  exampleChip: { paddingVertical: Spacing.md, paddingHorizontal: Spacing.lg, borderRadius: BorderRadius.md, borderWidth: 1 },
  pathContainer: { flex: 1 },
  pathTitle: { marginBottom: Spacing.md },
  progressContainer: { marginBottom: Spacing.lg, alignItems: "center" },
  progressRingOuter: { width: 70, height: 70, borderRadius: 35, backgroundColor: "rgba(0,0,0,0.05)", alignItems: "center", justifyContent: "center", marginBottom: Spacing.md },
  progressRingInner: { width: 56, height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center", zIndex: 1 },
  progressRingFill: { position: "absolute", width: 70, height: 70, borderRadius: 35, opacity: 0.3 },
  progressBarContainer: { width: "100%", height: 6, borderRadius: 3, overflow: "hidden" },
  progressBarFill: { height: "100%", borderRadius: 3 },
  encouragingContainer: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: Spacing.sm, marginBottom: Spacing.lg, padding: Spacing.md, borderRadius: BorderRadius.md },
  encouragingText: { fontWeight: "600", fontSize: 16 },
  celebrationOverlay: { position: "absolute", top: 0, left: 0, right: 0, height: 200, zIndex: 100, alignItems: "center", justifyContent: "center" },
  celebrationBanner: { flexDirection: "row", alignItems: "center", gap: Spacing.md, backgroundColor: "rgba(255,255,255,0.95)", paddingVertical: Spacing.lg, paddingHorizontal: Spacing.xl, borderRadius: BorderRadius.lg },
  celebrationText: { fontWeight: "700" },
  particle: { position: "absolute", bottom: 0 },
  stepCardWrapper: { marginBottom: Spacing.md, flexDirection: "row" },
  connectionLine: { width: 2, marginRight: Spacing.md, marginLeft: Spacing.sm, alignItems: "center" },
  connectionDot: { width: 8, height: 8, borderRadius: 4, position: "absolute", bottom: -4 },
  stepCard: { flex: 1, padding: Spacing.lg },
  stepHeader: { flexDirection: "row", alignItems: "center" },
  stepNumberContainer: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", marginRight: Spacing.md },
  stepNumber: { color: "#FFFFFF", fontWeight: "700" },
  stepTextContainer: { flex: 1 },
  stepTitle: { fontWeight: "600", marginBottom: 4, fontSize: 17 },
  badgesRow: { flexDirection: "row", gap: Spacing.sm, marginTop: 4 },
  badge: { flexDirection: "row", alignItems: "center", paddingVertical: 2, paddingHorizontal: Spacing.sm, borderRadius: BorderRadius.sm, gap: 4 },
  badgeText: { fontSize: 11, fontWeight: "600" },
  expandedContent: { marginTop: Spacing.lg, gap: Spacing.md },
  stepDescription: { lineHeight: 24 },
  subtasksContainer: { gap: Spacing.sm },
  subtasksHeader: { flexDirection: "row", alignItems: "center", gap: Spacing.sm, marginBottom: Spacing.xs },
  subtasksTitle: { fontWeight: "600" },
  subtaskItem: { flexDirection: "row", alignItems: "center", gap: Spacing.sm, paddingVertical: Spacing.sm },
  subtaskCheckbox: { width: 20, height: 20, borderRadius: 4, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  subtaskText: { flex: 1 },
  tipCard: { padding: Spacing.lg, borderRadius: BorderRadius.md, borderLeftWidth: 4 },
  tipHeader: { flexDirection: "row", alignItems: "center", marginBottom: Spacing.sm },
  tipLabel: { fontWeight: "700" },
  tipText: { lineHeight: 24, fontSize: 15 },
  completeButton: { marginTop: Spacing.sm },
  completedBadge: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: Spacing.md, paddingHorizontal: Spacing.lg, borderRadius: BorderRadius.md },
  backButton: { marginTop: Spacing.md },
});

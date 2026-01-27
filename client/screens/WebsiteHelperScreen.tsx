import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  ScrollView,
  Pressable,
  Platform,
  KeyboardAvoidingView,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import Animated, { 
  FadeIn, 
  FadeInDown, 
  SlideInUp,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  interpolate,
  Easing,
} from "react-native-reanimated";
import { useTranslation } from "react-i18next";
import { Image } from "expo-image";
import Svg, { Circle, Path, Defs, LinearGradient, Stop, G, Rect } from "react-native-svg";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { GlassCard } from "@/components/GlassCard";
import { GlassButton } from "@/components/GlassButton";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { getApiUrl } from "@/lib/query-client";

const BROWSER_BLUE = "#4285F4";
const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Website Analysis Animation Component
const WebsiteAnalysisAnimation = ({ theme }: { theme: any }) => {
  const rotation = useSharedValue(0);
  const pulse = useSharedValue(1);
  const progress = useSharedValue(0);
  const orbit1 = useSharedValue(0);
  const orbit2 = useSharedValue(0);
  const orbit3 = useSharedValue(0);
  const scanLine = useSharedValue(0);
  const dataFlow = useSharedValue(0);
  const sparkle1 = useSharedValue(0);
  const sparkle2 = useSharedValue(0);
  const sparkle3 = useSharedValue(0);

  useEffect(() => {
    // Main globe rotation
    rotation.value = withRepeat(
      withTiming(360, { duration: 8000, easing: Easing.linear }),
      -1
    );

    // Pulse animation
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) })
      ),
      -1
    );

    // Progress bar - 20 seconds
    progress.value = withTiming(1, { duration: 20000, easing: Easing.linear });

    // Orbiting elements
    orbit1.value = withRepeat(
      withTiming(360, { duration: 3000, easing: Easing.linear }),
      -1
    );
    orbit2.value = withDelay(500, withRepeat(
      withTiming(360, { duration: 4000, easing: Easing.linear }),
      -1
    ));
    orbit3.value = withDelay(1000, withRepeat(
      withTiming(360, { duration: 5000, easing: Easing.linear }),
      -1
    ));

    // Scan line
    scanLine.value = withRepeat(
      withTiming(1, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );

    // Data flow animation
    dataFlow.value = withRepeat(
      withTiming(1, { duration: 1500, easing: Easing.linear }),
      -1
    );

    // Sparkle animations
    sparkle1.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 700 }),
        withTiming(0, { duration: 700 })
      ),
      -1
    );
    sparkle2.value = withDelay(300, withRepeat(
      withSequence(
        withTiming(1, { duration: 700 }),
        withTiming(0, { duration: 700 })
      ),
      -1
    ));
    sparkle3.value = withDelay(600, withRepeat(
      withSequence(
        withTiming(1, { duration: 700 }),
        withTiming(0, { duration: 700 })
      ),
      -1
    ));
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  const rotationStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const orbit1Style = useAnimatedStyle(() => ({
    transform: [{ rotate: `${orbit1.value}deg` }],
  }));

  const orbit2Style = useAnimatedStyle(() => ({
    transform: [{ rotate: `${orbit2.value}deg` }],
  }));

  const orbit3Style = useAnimatedStyle(() => ({
    transform: [{ rotate: `${-orbit3.value}deg` }],
  }));

  const scanLineStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(scanLine.value, [0, 1], [-50, 50]) }],
    opacity: interpolate(scanLine.value, [0, 0.5, 1], [0.3, 1, 0.3]),
  }));

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  const sparkleStyle1 = useAnimatedStyle(() => ({
    opacity: sparkle1.value,
    transform: [{ scale: sparkle1.value }],
  }));
  const sparkleStyle2 = useAnimatedStyle(() => ({
    opacity: sparkle2.value,
    transform: [{ scale: sparkle2.value }],
  }));
  const sparkleStyle3 = useAnimatedStyle(() => ({
    opacity: sparkle3.value,
    transform: [{ scale: sparkle3.value }],
  }));

  return (
    <View style={loadingStyles.container}>
      <Animated.View style={[loadingStyles.globeContainer, pulseStyle]}>
        {/* Outer orbit rings */}
        <Animated.View style={[loadingStyles.orbitRing, loadingStyles.orbitRing1, orbit1Style]}>
          <View style={[loadingStyles.orbitDot, { backgroundColor: BROWSER_BLUE }]} />
        </Animated.View>
        <Animated.View style={[loadingStyles.orbitRing, loadingStyles.orbitRing2, orbit2Style]}>
          <View style={[loadingStyles.orbitDot, loadingStyles.orbitDotSmall, { backgroundColor: theme.primary }]} />
        </Animated.View>
        <Animated.View style={[loadingStyles.orbitRing, loadingStyles.orbitRing3, orbit3Style]}>
          <View style={[loadingStyles.orbitDot, loadingStyles.orbitDotTiny, { backgroundColor: "#52C41A" }]} />
        </Animated.View>

        {/* Globe with grid lines */}
        <Animated.View style={rotationStyle}>
          <Svg width={100} height={100} viewBox="0 0 100 100">
            <Defs>
              <LinearGradient id="globeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor={BROWSER_BLUE} stopOpacity="0.3" />
                <Stop offset="50%" stopColor={BROWSER_BLUE} stopOpacity="0.15" />
                <Stop offset="100%" stopColor={BROWSER_BLUE} stopOpacity="0.05" />
              </LinearGradient>
              <LinearGradient id="gridGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <Stop offset="0%" stopColor={BROWSER_BLUE} stopOpacity="0.1" />
                <Stop offset="50%" stopColor={BROWSER_BLUE} stopOpacity="0.4" />
                <Stop offset="100%" stopColor={BROWSER_BLUE} stopOpacity="0.1" />
              </LinearGradient>
            </Defs>
            <Circle cx="50" cy="50" r="45" fill="url(#globeGrad)" stroke={BROWSER_BLUE} strokeWidth="2" strokeOpacity="0.4" />
            {/* Longitude lines */}
            <Path d="M50 5 Q65 50 50 95" fill="none" stroke="url(#gridGrad)" strokeWidth="1.5" />
            <Path d="M50 5 Q35 50 50 95" fill="none" stroke="url(#gridGrad)" strokeWidth="1.5" />
            <Path d="M50 5 Q80 50 50 95" fill="none" stroke="url(#gridGrad)" strokeWidth="1" />
            <Path d="M50 5 Q20 50 50 95" fill="none" stroke="url(#gridGrad)" strokeWidth="1" />
            {/* Latitude lines */}
            <Path d="M10 35 Q50 25 90 35" fill="none" stroke="url(#gridGrad)" strokeWidth="1.5" />
            <Path d="M5 50 Q50 50 95 50" fill="none" stroke="url(#gridGrad)" strokeWidth="1.5" />
            <Path d="M10 65 Q50 75 90 65" fill="none" stroke="url(#gridGrad)" strokeWidth="1.5" />
          </Svg>
        </Animated.View>

        {/* Scan line */}
        <Animated.View style={[loadingStyles.scanLine, scanLineStyle]}>
          <Svg width={100} height={4}>
            <Defs>
              <LinearGradient id="scanGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <Stop offset="0%" stopColor={BROWSER_BLUE} stopOpacity="0" />
                <Stop offset="50%" stopColor={BROWSER_BLUE} stopOpacity="1" />
                <Stop offset="100%" stopColor={BROWSER_BLUE} stopOpacity="0" />
              </LinearGradient>
            </Defs>
            <Rect x="0" y="0" width="100" height="4" rx="2" fill="url(#scanGrad)" />
          </Svg>
        </Animated.View>

        {/* Sparkles */}
        <Animated.View style={[loadingStyles.sparkle, { top: -5, right: 5 }, sparkleStyle1]}>
          <Svg width={18} height={18} viewBox="0 0 20 20">
            <Path d="M10 0 L12 8 L20 10 L12 12 L10 20 L8 12 L0 10 L8 8 Z" fill={BROWSER_BLUE} />
          </Svg>
        </Animated.View>
        <Animated.View style={[loadingStyles.sparkle, { bottom: 0, left: -10 }, sparkleStyle2]}>
          <Svg width={14} height={14} viewBox="0 0 20 20">
            <Path d="M10 0 L12 8 L20 10 L12 12 L10 20 L8 12 L0 10 L8 8 Z" fill={theme.primary} />
          </Svg>
        </Animated.View>
        <Animated.View style={[loadingStyles.sparkle, { top: 30, right: -15 }, sparkleStyle3]}>
          <Svg width={12} height={12} viewBox="0 0 20 20">
            <Path d="M10 0 L12 8 L20 10 L12 12 L10 20 L8 12 L0 10 L8 8 Z" fill="#52C41A" />
          </Svg>
        </Animated.View>
      </Animated.View>

      <View style={loadingStyles.textContainer}>
        <ThemedText type="h4" style={loadingStyles.loadingText}>מנתח את האתר...</ThemedText>
        <ThemedText type="small" style={[loadingStyles.subText, { color: theme.textSecondary }]}>
          קורא ומבין את התוכן
        </ThemedText>
      </View>

      <View style={loadingStyles.progressContainer}>
        <View style={[loadingStyles.progressTrack, { backgroundColor: theme.border }]}>
          <Animated.View style={[loadingStyles.progressBar, { backgroundColor: BROWSER_BLUE }, progressStyle]} />
        </View>
      </View>
    </View>
  );
};

const loadingStyles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  globeContainer: {
    width: 140,
    height: 140,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  orbitRing: {
    position: "absolute",
    borderRadius: 9999,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "rgba(66, 133, 244, 0.3)",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  orbitRing1: {
    width: 120,
    height: 120,
  },
  orbitRing2: {
    width: 100,
    height: 100,
  },
  orbitRing3: {
    width: 80,
    height: 80,
  },
  orbitDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: -5,
  },
  orbitDotSmall: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: -4,
  },
  orbitDotTiny: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: -3,
  },
  scanLine: {
    position: "absolute",
  },
  sparkle: {
    position: "absolute",
  },
  textContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  loadingText: {
    textAlign: "center",
    marginBottom: 4,
  },
  subText: {
    textAlign: "center",
    opacity: 0.8,
  },
  progressContainer: {
    width: "100%",
    maxWidth: 200,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: 3,
  },
});

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  annotatedImage?: string;
}

export default function WebsiteHelperScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const scrollViewRef = useRef<ScrollView>(null);

  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState("");
  const [analyzedUrl, setAnalyzedUrl] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [safetyWarning, setSafetyWarning] = useState<string | null>(null);
  const [safetyLevel, setSafetyLevel] = useState<"safe" | "caution" | "danger">("safe");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAnnotating, setIsAnnotating] = useState(false);
  const [showScreenshotTip, setShowScreenshotTip] = useState(true);

  const handlePasteUrl = useCallback(async () => {
    try {
      const clipboardContent = await Clipboard.getStringAsync();
      if (clipboardContent) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setUrlInput(clipboardContent);
      }
    } catch (error) {
      console.error("Error pasting from clipboard:", error);
    }
  }, []);

  const handleAnalyzeUrl = useCallback(async () => {
    if (!urlInput.trim()) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsLoading(true);
    setAnalysis(null);
    setSafetyWarning(null);
    setMessages([]);
    setUploadedImage(null);
    setAnalyzedUrl(urlInput.trim());

    try {
      const apiUrl = new URL("/api/website-helper/analyze", getApiUrl());
      const response = await fetch(apiUrl.toString(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: urlInput.trim() }),
      });

      if (!response.ok) throw new Error("Analysis failed");

      const data = await response.json();
      setAnalysis(data.analysis);
      if (data.safetyWarning) {
        setSafetyWarning(data.safetyWarning);
        setSafetyLevel(data.safetyLevel || "caution");
      }
    } catch (error) {
      console.error("Error analyzing URL:", error);
      setAnalysis(t("tools.websiteHelper.analysisFailed"));
    } finally {
      setIsLoading(false);
    }
  }, [urlInput, t]);

  const handlePickImage = useCallback(async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: false,
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        const asset = result.assets[0];
        const base64 = `data:image/jpeg;base64,${asset.base64}`;
        setUploadedImage(base64);
        setAnalyzedUrl(null);
        setMessages([]);
        setAnalysis(null);
        setSafetyWarning(null);
        
        await analyzeImage(base64);
      }
    } catch (error) {
      console.error("Error picking image:", error);
    }
  }, []);

  const handleTakePhoto = useCallback(async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      if (!permissionResult.granted) {
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: false,
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        const asset = result.assets[0];
        const base64 = `data:image/jpeg;base64,${asset.base64}`;
        setUploadedImage(base64);
        setMessages([]);
        setAnalysis(null);
        setSafetyWarning(null);
        
        await analyzeImage(base64);
      }
    } catch (error) {
      console.error("Error taking photo:", error);
    }
  }, []);

  const analyzeImage = async (imageBase64: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        new URL("/api/website-helper/analyze", getApiUrl()).toString(),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageBase64 }),
        }
      );

      if (!response.ok) throw new Error("Failed to analyze");

      const data = await response.json();
      setAnalysis(data.analysis);
      setSafetyWarning(data.safetyWarning);
      setSafetyLevel(data.safetyLevel || "safe");
    } catch (error) {
      console.error("Error analyzing:", error);
      setAnalysis(t("tools.websiteHelper.analysisFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = useCallback(async () => {
    if (!inputText.trim() || !uploadedImage) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: inputText.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsLoading(true);

    try {
      const isAnnotationRequest = 
        inputText.includes("איפה") ||
        inputText.includes("היכן") ||
        inputText.includes("ללחוץ") ||
        inputText.includes("לסמן") ||
        inputText.includes("להראות");

      if (isAnnotationRequest) {
        setIsAnnotating(true);
        const annotateResponse = await fetch(
          new URL("/api/website-helper/annotate", getApiUrl()).toString(),
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              imageBase64: uploadedImage,
              instruction: inputText,
            }),
          }
        );

        if (annotateResponse.ok) {
          const annotateData = await annotateResponse.json();
          const assistantMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: annotateData.explanation || t("tools.websiteHelper.markedForYou"),
            annotatedImage: annotateData.annotatedImage,
          };
          setMessages((prev) => [...prev, assistantMessage]);
        }
        setIsAnnotating(false);
      }

      const chatResponse = await fetch(
        new URL("/api/website-helper/chat", getApiUrl()).toString(),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imageBase64: uploadedImage,
            messages: messages.map((m) => ({ role: m.role, content: m.content })),
            currentQuestion: inputText,
          }),
        }
      );

      if (chatResponse.ok) {
        const chatData = await chatResponse.json();
        const existingAssistantMsg = messages.find(
          (m) => m.id === (Date.now() + 1).toString()
        );
        if (!existingAssistantMsg) {
          const assistantMessage: ChatMessage = {
            id: (Date.now() + 2).toString(),
            role: "assistant",
            content: chatData.answer,
          };
          setMessages((prev) => [...prev, assistantMessage]);
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: t("tools.websiteHelper.errorTryAgain"),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsAnnotating(false);
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }
  }, [inputText, uploadedImage, messages, t]);

  const handleReset = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setUploadedImage(null);
    setAnalyzedUrl(null);
    setUrlInput("");
    setAnalysis(null);
    setSafetyWarning(null);
    setSafetyLevel("safe");
    setMessages([]);
    setInputText("");
  }, []);

  const renderUploadSection = () => (
    <Animated.View entering={FadeInDown.duration(400)} style={styles.uploadSection}>
      <View style={[styles.iconCircle, { backgroundColor: BROWSER_BLUE }]}>
        <Feather name="globe" size={32} color="#FFFFFF" />
      </View>
      <ThemedText type="h2" style={styles.title}>
        {t("tools.websiteHelper.title")}
      </ThemedText>
      <ThemedText
        type="body"
        style={[styles.subtitle, { color: theme.textSecondary }]}
      >
        {t("tools.websiteHelper.subtitle")}
      </ThemedText>

      {showScreenshotTip ? (
        <Animated.View entering={FadeIn.delay(300)} style={styles.tipContainer}>
          <GlassCard style={{ ...styles.tipCard, backgroundColor: theme.backgroundSecondary }}>
            <View style={styles.tipHeader}>
              <Feather name="info" size={20} color={BROWSER_BLUE} />
              <ThemedText type="h4" style={styles.tipTitle}>
                {t("tools.websiteHelper.screenshotTip.title")}
              </ThemedText>
              <Pressable
                onPress={() => setShowScreenshotTip(false)}
                hitSlop={12}
                style={styles.tipClose}
              >
                <Feather name="x" size={18} color={theme.textSecondary} />
              </Pressable>
            </View>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              {Platform.OS === "android"
                ? t("tools.websiteHelper.screenshotTip.android")
                : t("tools.websiteHelper.screenshotTip.ios")}
            </ThemedText>
          </GlassCard>
        </Animated.View>
      ) : null}

      <View style={styles.uploadButtons}>
        <GlassButton
          onPress={handlePickImage}
          style={[styles.uploadButton, { backgroundColor: BROWSER_BLUE }]}
          testID="button-upload-screenshot"
        >
          <View style={styles.buttonContent}>
            <Feather name="image" size={24} color="#FFFFFF" />
            <ThemedText style={styles.buttonText}>
              {t("tools.websiteHelper.uploadScreenshot")}
            </ThemedText>
          </View>
        </GlassButton>

        <GlassButton
          onPress={handleTakePhoto}
          variant="secondary"
          style={styles.uploadButton}
          testID="button-take-photo"
        >
          <View style={styles.buttonContent}>
            <Feather name="camera" size={24} color={theme.text} />
            <ThemedText style={[styles.buttonText, { color: theme.text }]}>
              {t("tools.websiteHelper.takePhoto")}
            </ThemedText>
          </View>
        </GlassButton>
      </View>

      <View style={styles.dividerContainer}>
        <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
        <ThemedText type="small" style={[styles.dividerText, { color: theme.textSecondary }]}>
          {t("tools.websiteHelper.orPasteLink")}
        </ThemedText>
        <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
      </View>

      <View style={styles.urlInputContainer}>
        <View style={[styles.urlInputWrapper, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}>
          <Feather name="link" size={20} color={theme.textSecondary} style={styles.urlIcon} />
          <TextInput
            style={[styles.urlInput, { color: theme.text }]}
            placeholder={t("tools.websiteHelper.urlPlaceholder")}
            placeholderTextColor={theme.textSecondary}
            value={urlInput}
            onChangeText={setUrlInput}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            testID="input-url"
          />
          <Pressable
            onPress={handlePasteUrl}
            style={[styles.pasteButton, { backgroundColor: BROWSER_BLUE + "20" }]}
            hitSlop={8}
            testID="button-paste-url"
          >
            <Feather name="clipboard" size={18} color={BROWSER_BLUE} />
            <ThemedText style={[styles.pasteButtonText, { color: BROWSER_BLUE }]}>
              {t("tools.websiteHelper.paste")}
            </ThemedText>
          </Pressable>
        </View>
        <GlassButton
          onPress={handleAnalyzeUrl}
          disabled={!urlInput.trim() || isLoading}
          style={[styles.analyzeUrlButton, { backgroundColor: urlInput.trim() ? BROWSER_BLUE : theme.backgroundSecondary }]}
          testID="button-analyze-url"
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <View style={styles.buttonContent}>
              <Feather name="search" size={20} color={urlInput.trim() ? "#FFFFFF" : theme.textSecondary} />
              <ThemedText style={[styles.buttonText, { color: urlInput.trim() ? "#FFFFFF" : theme.textSecondary }]}>
                {t("tools.websiteHelper.analyzeLink")}
              </ThemedText>
            </View>
          )}
        </GlassButton>
      </View>
    </Animated.View>
  );

  const renderAnalysisView = () => (
    <View style={styles.analysisContainer}>
      <View style={styles.imageHeader}>
        <ThemedText type="h4">
          {uploadedImage ? t("tools.websiteHelper.yourScreenshot") : t("tools.websiteHelper.websiteAnalyzed")}
        </ThemedText>
        <Pressable onPress={handleReset} hitSlop={12} testID="button-reset">
          <Feather name="x" size={24} color={theme.text} />
        </Pressable>
      </View>

      {analyzedUrl && !uploadedImage ? (
        <Animated.View entering={FadeIn} style={[styles.urlHeader, { backgroundColor: BROWSER_BLUE + "15" }]}>
          <Feather name="globe" size={20} color={BROWSER_BLUE} />
          <ThemedText style={[styles.urlText, { color: theme.text }]} numberOfLines={2}>
            {analyzedUrl}
          </ThemedText>
        </Animated.View>
      ) : null}

      {uploadedImage ? (
        <Animated.View entering={FadeIn} style={styles.imagePreview}>
          <Image
            source={{ uri: uploadedImage }}
            style={styles.previewImage}
            contentFit="contain"
          />
        </Animated.View>
      ) : null}

      {safetyWarning ? (
        <Animated.View
          entering={SlideInUp}
          style={[
            styles.safetyBanner,
            {
              backgroundColor:
                safetyLevel === "danger"
                  ? Colors.light.danger
                  : Colors.light.warning,
            },
          ]}
        >
          <Feather
            name={safetyLevel === "danger" ? "alert-triangle" : "alert-circle"}
            size={20}
            color="#FFFFFF"
          />
          <ThemedText style={styles.safetyText}>{safetyWarning}</ThemedText>
        </Animated.View>
      ) : null}

      {isLoading && !analysis ? (
        <GlassCard style={styles.analysisCard}>
          <WebsiteAnalysisAnimation theme={theme} />
        </GlassCard>
      ) : analysis ? (
        <GlassCard style={styles.analysisCard}>
          <View style={styles.analysisHeader}>
            <Feather name="eye" size={20} color={BROWSER_BLUE} />
            <ThemedText type="h4" style={styles.analysisTitle}>
              {t("tools.websiteHelper.whatISee")}
            </ThemedText>
          </View>
          <ThemedText type="body" style={styles.analysisText}>
            {analysis}
          </ThemedText>
        </GlassCard>
      ) : null}

      {messages.length > 0 ? (
        <View style={styles.chatSection}>
          <ThemedText type="h4" style={styles.chatTitle}>
            {t("tools.websiteHelper.conversation")}
          </ThemedText>
          {messages.map((msg) => (
            <Animated.View
              key={msg.id}
              entering={FadeInDown.duration(300)}
              style={[
                styles.messageContainer,
                msg.role === "user" ? styles.userMessage : styles.assistantMessage,
              ]}
            >
              <ThemedText
                style={[
                  styles.messageText,
                  msg.role === "user"
                    ? { color: "#FFFFFF" }
                    : { color: theme.text },
                ]}
              >
                {msg.content}
              </ThemedText>
              {msg.annotatedImage ? (
                <Image
                  source={{ uri: msg.annotatedImage }}
                  style={styles.annotatedImage}
                  contentFit="contain"
                />
              ) : null}
            </Animated.View>
          ))}
          {isAnnotating ? (
            <View style={styles.annotatingIndicator}>
              <ActivityIndicator size="small" color={BROWSER_BLUE} />
              <ThemedText style={{ color: theme.textSecondary, marginLeft: Spacing.sm }}>
                {t("tools.websiteHelper.markingElement")}
              </ThemedText>
            </View>
          ) : null}
        </View>
      ) : null}
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={headerHeight}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingTop: headerHeight + Spacing.xl,
              paddingBottom: (uploadedImage || analyzedUrl) ? 100 : insets.bottom + Spacing["3xl"],
            },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {(uploadedImage || analyzedUrl) ? renderAnalysisView() : renderUploadSection()}
        </ScrollView>

        {uploadedImage ? (
          <Animated.View
            entering={SlideInUp}
            style={[
              styles.inputContainer,
              {
                paddingBottom: insets.bottom + Spacing.md,
                backgroundColor: theme.backgroundDefault,
              },
            ]}
          >
            <View style={styles.inputRow}>
              <Pressable
                onPress={handleSendMessage}
                disabled={!inputText.trim() || isLoading}
                style={[
                  styles.sendButton,
                  {
                    backgroundColor:
                      inputText.trim() && !isLoading ? BROWSER_BLUE : theme.backgroundSecondary,
                  },
                ]}
                testID="button-send"
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Feather
                    name="send"
                    size={20}
                    color={inputText.trim() ? "#FFFFFF" : theme.textSecondary}
                    style={{ transform: [{ scaleX: -1 }] }}
                  />
                )}
              </Pressable>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    backgroundColor: theme.backgroundSecondary,
                    color: theme.text,
                  },
                ]}
                placeholder={t("tools.websiteHelper.askPlaceholder")}
                placeholderTextColor={theme.textSecondary}
                value={inputText}
                onChangeText={setInputText}
                multiline
                maxLength={500}
                testID="input-question"
              />
            </View>
            <ThemedText
              type="small"
              style={[styles.inputHint, { color: theme.textSecondary }]}
            >
              {t("tools.websiteHelper.inputHint")}
            </ThemedText>
          </Animated.View>
        ) : null}
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
  },
  uploadSection: {
    alignItems: "center",
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
  },
  title: {
    textAlign: "center",
    marginBottom: Spacing.xs,
  },
  subtitle: {
    textAlign: "center",
    marginBottom: Spacing["2xl"],
  },
  tipContainer: {
    width: "100%",
    marginBottom: Spacing["2xl"],
  },
  tipCard: {
    padding: Spacing.lg,
  },
  tipHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  tipTitle: {
    flex: 1,
    marginLeft: Spacing.sm,
  },
  tipClose: {
    padding: Spacing.xs,
  },
  uploadButtons: {
    width: "100%",
    gap: Spacing.md,
  },
  uploadButton: {
    width: "100%",
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.md,
  },
  buttonText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  analysisContainer: {
    width: "100%",
  },
  imageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  imagePreview: {
    width: "100%",
    height: 200,
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
    marginBottom: Spacing.lg,
  },
  previewImage: {
    width: "100%",
    height: "100%",
  },
  safetyBanner: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  safetyText: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: Spacing["3xl"],
  },
  analysisCard: {
    marginBottom: Spacing.lg,
  },
  analysisHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  analysisTitle: {
    marginLeft: Spacing.sm,
  },
  analysisText: {
    lineHeight: 28,
  },
  chatSection: {
    marginTop: Spacing.md,
  },
  chatTitle: {
    marginBottom: Spacing.md,
  },
  messageContainer: {
    maxWidth: "85%",
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
  },
  userMessage: {
    alignSelf: "flex-end",
    backgroundColor: BROWSER_BLUE,
  },
  assistantMessage: {
    alignSelf: "flex-start",
    backgroundColor: Colors.light.backgroundSecondary,
  },
  messageText: {
    fontSize: 18,
    lineHeight: 26,
  },
  annotatedImage: {
    width: "100%",
    height: 200,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.md,
  },
  annotatingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
  },
  inputContainer: {
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    paddingTop: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: Spacing.sm,
  },
  textInput: {
    flex: 1,
    minHeight: 48,
    maxHeight: 120,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
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
  inputHint: {
    textAlign: "center",
    marginTop: Spacing.xs,
    fontSize: 14,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginVertical: Spacing.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    paddingHorizontal: Spacing.md,
  },
  urlInputContainer: {
    width: "100%",
    gap: Spacing.md,
  },
  urlInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  urlIcon: {
    marginRight: Spacing.sm,
  },
  urlInput: {
    flex: 1,
    fontSize: 18,
    minHeight: 44,
    textAlign: "right",
  },
  pasteButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginLeft: Spacing.sm,
    gap: Spacing.xs,
  },
  pasteButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  analyzeUrlButton: {
    width: "100%",
  },
  urlHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  urlText: {
    flex: 1,
    fontSize: 14,
  },
});

import React, { useState, useRef, useEffect } from "react";
import { StyleSheet, View, Pressable, Image, Platform, Linking, Modal, TextInput, ScrollView, ActivityIndicator, Dimensions } from "react-native";
import Svg, { Path, Circle, Rect, G, Defs, LinearGradient, Stop } from "react-native-svg";

// Helper to convert blob to base64 (for web)
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import Animated, { 
  FadeInDown, 
  FadeInUp, 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withRepeat, 
  withSequence,
  withDelay,
  Easing,
  interpolate,
  useDerivedValue,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import * as FileSystem from "expo-file-system/legacy";
import * as Speech from "expo-speech";
import { useAudioPlayer, AudioPlayer } from "expo-audio";

import { ThemedText } from "@/components/ThemedText";
import { getApiUrl } from "@/lib/query-client";
import { ThemedView } from "@/components/ThemedView";
import { GlassCard } from "@/components/GlassCard";
import { GlassButton } from "@/components/GlassButton";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

interface AnalysisResult {
  type: string;
  urgency: "high" | "medium" | "low";
  summary: string;
  actions: string[];
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

// Sophisticated Document Scanning Animation
const DocumentScanAnimation = ({ theme }: { theme: any }) => {
  const scanLine = useSharedValue(0);
  const pulse = useSharedValue(1);
  const progress = useSharedValue(0);
  const docFloat = useSharedValue(0);
  const sparkle1 = useSharedValue(0);
  const sparkle2 = useSharedValue(0);
  const sparkle3 = useSharedValue(0);

  useEffect(() => {
    // Scan line animation
    scanLine.value = withRepeat(
      withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
    
    // Pulse animation
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
      ),
      -1
    );
    
    // Progress bar - 15 seconds
    progress.value = withTiming(1, { duration: 15000, easing: Easing.linear });
    
    // Document floating animation
    docFloat.value = withRepeat(
      withSequence(
        withTiming(-8, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1
    );
    
    // Sparkle animations
    sparkle1.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 600 }),
        withTiming(0, { duration: 600 })
      ),
      -1
    );
    sparkle2.value = withDelay(200, withRepeat(
      withSequence(
        withTiming(1, { duration: 600 }),
        withTiming(0, { duration: 600 })
      ),
      -1
    ));
    sparkle3.value = withDelay(400, withRepeat(
      withSequence(
        withTiming(1, { duration: 600 }),
        withTiming(0, { duration: 600 })
      ),
      -1
    ));
  }, []);

  const scanLineStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(scanLine.value, [0, 1], [0, 100]) }],
    opacity: interpolate(scanLine.value, [0, 0.5, 1], [0.3, 1, 0.3]),
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  const docStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: docFloat.value }],
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
      <Animated.View style={[loadingStyles.docContainer, pulseStyle]}>
        <Animated.View style={docStyle}>
          <Svg width={120} height={150} viewBox="0 0 120 150">
            <Defs>
              <LinearGradient id="docGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor={theme.primary} stopOpacity="0.2" />
                <Stop offset="100%" stopColor={theme.primary} stopOpacity="0.05" />
              </LinearGradient>
              <LinearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <Stop offset="0%" stopColor={theme.primary} stopOpacity="0.3" />
                <Stop offset="100%" stopColor={theme.primary} stopOpacity="0.1" />
              </LinearGradient>
            </Defs>
            <Rect x="10" y="10" width="100" height="130" rx="8" fill="url(#docGrad)" stroke={theme.primary} strokeWidth="2" strokeOpacity="0.3" />
            <Path d="M85 10 L85 35 L110 35" fill="none" stroke={theme.primary} strokeWidth="2" strokeOpacity="0.3" />
            <Rect x="25" y="50" width="70" height="6" rx="3" fill="url(#lineGrad)" />
            <Rect x="25" y="65" width="55" height="6" rx="3" fill="url(#lineGrad)" />
            <Rect x="25" y="80" width="65" height="6" rx="3" fill="url(#lineGrad)" />
            <Rect x="25" y="95" width="45" height="6" rx="3" fill="url(#lineGrad)" />
            <Rect x="25" y="110" width="60" height="6" rx="3" fill="url(#lineGrad)" />
          </Svg>
        </Animated.View>
        
        <Animated.View style={[loadingStyles.scanLine, scanLineStyle]}>
          <Svg width={120} height={4}>
            <Defs>
              <LinearGradient id="scanGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <Stop offset="0%" stopColor={theme.primary} stopOpacity="0" />
                <Stop offset="50%" stopColor={theme.primary} stopOpacity="1" />
                <Stop offset="100%" stopColor={theme.primary} stopOpacity="0" />
              </LinearGradient>
            </Defs>
            <Rect x="0" y="0" width="120" height="4" fill="url(#scanGrad)" />
          </Svg>
        </Animated.View>

        <Animated.View style={[loadingStyles.sparkle, { top: 20, right: -10 }, sparkleStyle1]}>
          <Svg width={20} height={20} viewBox="0 0 20 20">
            <Path d="M10 0 L12 8 L20 10 L12 12 L10 20 L8 12 L0 10 L8 8 Z" fill={theme.primary} />
          </Svg>
        </Animated.View>
        <Animated.View style={[loadingStyles.sparkle, { bottom: 30, left: -15 }, sparkleStyle2]}>
          <Svg width={16} height={16} viewBox="0 0 20 20">
            <Path d="M10 0 L12 8 L20 10 L12 12 L10 20 L8 12 L0 10 L8 8 Z" fill={theme.primary} />
          </Svg>
        </Animated.View>
        <Animated.View style={[loadingStyles.sparkle, { top: 60, right: -20 }, sparkleStyle3]}>
          <Svg width={14} height={14} viewBox="0 0 20 20">
            <Path d="M10 0 L12 8 L20 10 L12 12 L10 20 L8 12 L0 10 L8 8 Z" fill={theme.primary} />
          </Svg>
        </Animated.View>
      </Animated.View>

      <View style={loadingStyles.textContainer}>
        <ThemedText type="h4" style={loadingStyles.loadingText}>מנתח את המסמך...</ThemedText>
        <ThemedText type="small" style={loadingStyles.subText}>קורא ומבין את התוכן</ThemedText>
      </View>

      <View style={loadingStyles.progressContainer}>
        <View style={[loadingStyles.progressTrack, { backgroundColor: theme.border }]}>
          <Animated.View style={[loadingStyles.progressBar, { backgroundColor: theme.primary }, progressStyle]} />
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
  docContainer: {
    position: "relative",
    marginBottom: 24,
  },
  scanLine: {
    position: "absolute",
    top: 15,
    left: 0,
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
    opacity: 0.7,
  },
  progressContainer: {
    width: "100%",
    paddingHorizontal: 20,
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

// Hebrew term explanations
const hebrewTerms: { [key: string]: string } = {
  "ארנונה": "מס שמשלמים לעירייה על הבית או הדירה. משמש לשירותים כמו ניקיון רחובות ותאורה.",
  "ביטוח לאומי": "גוף ממשלתי שמשלם קצבאות - כמו קצבת זקנה, נכות, או דמי אבטלה.",
  "קופת חולים": "הארגון שמספק לך שירותי בריאות - כמו רופא משפחה ובדיקות.",
  "משרד הפנים": "המשרד הממשלתי שמטפל בתעודות זהות, דרכונים ורישום אוכלוסין.",
  "רשות המיסים": "הגוף שגובה מיסים מהאזרחים - כמו מס הכנסה ומע\"מ.",
  "חברת החשמל": "החברה שמספקת חשמל לבית ושולחת חשבון כל חודשיים.",
  "מע\"מ": "מס ערך מוסף - מס שמשלמים על קניות ושירותים, כבר כלול במחיר.",
  "הוראת קבע": "הסכמה שנתת לבנק לשלם חשבון מסוים אוטומטית כל חודש.",
};

export default function LetterHelperScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileType, setFileType] = useState<"image" | "pdf" | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [completedActions, setCompletedActions] = useState<Set<number>>(new Set());
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showTooltip, setShowTooltip] = useState<string | null>(null);
  
  // Chat modal state
  const [showChatModal, setShowChatModal] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isSendingChat, setIsSendingChat] = useState(false);
  const [speakingMessageIndex, setSpeakingMessageIndex] = useState<number | null>(null);
  const chatScrollRef = useRef<ScrollView>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const onCompleteRef = useRef<(() => void) | null>(null);
  
  // Use expo-audio player for native audio playback
  const nativePlayer = useAudioPlayer(null);
  
  // Listen for playback completion
  useEffect(() => {
    if (nativePlayer && nativePlayer.playing === false && onCompleteRef.current) {
      onCompleteRef.current();
      onCompleteRef.current = null;
    }
  }, [nativePlayer?.playing]);
  
  // Store image base64 for chat context
  const [documentBase64, setDocumentBase64] = useState<string | null>(null);
  
  // Cached TTS audio (fetched in background after analysis)
  const [cachedAudio, setCachedAudio] = useState<{base64: string, mimeType: string} | null>(null);
  
  // Play audio from base64 on native using expo-audio
  const playNativeAudio = async (base64: string, mimeType: string, onComplete?: () => void) => {
    try {
      // Store onComplete callback
      onCompleteRef.current = onComplete || null;
      
      // Create a data URI
      const uri = `data:${mimeType};base64,${base64}`;
      
      // Replace the audio source and play
      nativePlayer.replace({ uri });
      nativePlayer.play();
    } catch (error) {
      console.error("Native audio playback error:", error);
      if (onComplete) onComplete();
    }
  };
  
  // Fetch TTS audio in background (non-blocking)
  const fetchTTSInBackground = (analysisResult: AnalysisResult) => {
    const textToRead = `${analysisResult.type}. ${analysisResult.summary}. מה לעשות: ${analysisResult.actions.join(". ")}`;
    
    const baseUrl = getApiUrl();
    fetch(new URL("/api/ai/tts", baseUrl).href, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: textToRead }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.audioBase64 && !data.fallback) {
          setCachedAudio({ base64: data.audioBase64, mimeType: data.mimeType });
          console.log("TTS audio ready");
        }
      })
      .catch(() => console.log("TTS fetch failed, will use fallback"));
  };

  const handlePickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      return;
    }

    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!pickerResult.canceled && pickerResult.assets[0]) {
      setSelectedFile(pickerResult.assets[0].uri);
      setFileType("image");
      setFileName(null);
      setResult(null);
      setCompletedActions(new Set());
      setCachedAudio(null);
    }
  };

  const handleTakePhoto = async () => {
    if (Platform.OS === "web") {
      return;
    }

    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (!permissionResult.granted) {
      return;
    }

    const pickerResult = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
    });

    if (!pickerResult.canceled && pickerResult.assets[0]) {
      setSelectedFile(pickerResult.assets[0].uri);
      setFileType("image");
      setFileName(null);
      setResult(null);
      setCompletedActions(new Set());
      setCachedAudio(null);
    }
  };

  const handlePickPDF = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "image/*"],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const isPDF = asset.mimeType === "application/pdf" || asset.name?.toLowerCase().endsWith(".pdf");
        
        setSelectedFile(asset.uri);
        setFileType(isPDF ? "pdf" : "image");
        setFileName(asset.name || null);
        setResult(null);
        setCompletedActions(new Set());
      }
    } catch (error) {
      console.error("Document picker error:", error);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsAnalyzing(true);

    try {
      // Convert file to base64
      let fileBase64: string;
      
      if (selectedFile.startsWith("data:")) {
        fileBase64 = selectedFile.split(",")[1];
      } else if (Platform.OS === "web") {
        const response = await fetch(selectedFile);
        const blob = await response.blob();
        fileBase64 = await blobToBase64(blob);
      } else {
        const base64 = await FileSystem.readAsStringAsync(selectedFile, {
          encoding: "base64",
        });
        fileBase64 = base64;
      }

      // Store for chat context
      setDocumentBase64(fileBase64);

      const baseUrl = getApiUrl();
      const mimeType = fileType === "pdf" ? "application/pdf" : "image/jpeg";
      const response = await fetch(new URL("/api/ai/letter-analyze", baseUrl).href, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          imageBase64: fileBase64,
          mimeType,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        setResult({
          type: "מסמך PDF",
          urgency: "low",
          summary: data.response || "הייתה בעיה בקריאת המסמך. נסה לצלם תמונה במקום.",
          actions: [
            "הדפס את המסמך וצלם תמונה",
            "או צלם צילום מסך של ה-PDF",
            "ואז העלה את התמונה"
          ],
        });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        return;
      }
      
      const analysisResult = {
        type: data.type || "מסמך",
        urgency: data.urgency || "low",
        summary: data.summary || "לא הצלחתי לנתח את המסמך במלואו.",
        actions: data.actions || ["עיין במסמך בזהירות"],
      };
      setResult(analysisResult);

      // Start TTS generation in background (non-blocking)
      fetchTTSInBackground(analysisResult);

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error: any) {
      console.error("Document analysis error:", error?.message || error);
      const errorMessage = error?.message || "Unknown error";
      const isNetworkError = errorMessage.includes("network") || errorMessage.includes("fetch") || errorMessage.includes("Network") || errorMessage === "Unknown error";
      
      setResult({
        type: t("letterHelper.errorType"),
        urgency: "low",
        summary: isNetworkError 
          ? t("letterHelper.errorNetwork")
          : t("letterHelper.errorReading"),
        actions: isNetworkError 
          ? [t("letterHelper.actionCheckInternet"), t("letterHelper.actionTryAgain")]
          : [t("letterHelper.actionAnotherPhoto"), t("letterHelper.actionGoodLighting")],
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const toggleActionComplete = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newCompleted = new Set(completedActions);
    if (newCompleted.has(index)) {
      newCompleted.delete(index);
    } else {
      newCompleted.add(index);
    }
    setCompletedActions(newCompleted);
  };

  const playTTS = async (text: string, onComplete?: () => void) => {
    try {
      // Stop any existing audio
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
        audioPlayerRef.current = null;
      }
      if (nativePlayer) {
        nativePlayer.pause();
      }

      const baseUrl = getApiUrl();
      const response = await fetch(new URL("/api/ai/tts", baseUrl).href, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      const data = await response.json();

      if (data.fallback) {
        Speech.speak(text, {
          language: "he-IL",
          rate: 0.85,
          onDone: onComplete,
          onStopped: onComplete,
          onError: onComplete,
        });
      } else if (data.audioBase64 && Platform.OS === "web") {
        const audioSrc = `data:${data.mimeType};base64,${data.audioBase64}`;
        const audio = new window.Audio(audioSrc);
        audioPlayerRef.current = audio;
        
        audio.onended = () => {
          if (onComplete) onComplete();
        };
        audio.play();
      } else if (data.audioBase64) {
        await playNativeAudio(data.audioBase64, data.mimeType, onComplete);
      }
    } catch (error) {
      console.error("TTS error:", error);
      Speech.speak(text, {
        language: "he-IL",
        rate: 0.85,
        onDone: onComplete,
        onStopped: onComplete,
        onError: onComplete,
      });
    }
  };

  const handleReadAloud = async () => {
    if (!result) return;
    
    if (isSpeaking) {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
        audioPlayerRef.current = null;
      }
      if (nativePlayer) {
        nativePlayer.pause();
      }
      Speech.stop();
      setIsSpeaking(false);
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsSpeaking(true);
    
    // Use pre-cached audio if available (instant playback)
    if (cachedAudio) {
      try {
        if (Platform.OS === "web") {
          const audioSrc = `data:${cachedAudio.mimeType};base64,${cachedAudio.base64}`;
          const audio = new window.Audio(audioSrc);
          audioPlayerRef.current = audio;
          
          audio.onended = () => setIsSpeaking(false);
          audio.play();
        } else {
          await playNativeAudio(cachedAudio.base64, cachedAudio.mimeType, () => setIsSpeaking(false));
        }
        return;
      } catch (error) {
        console.log("Cached audio playback failed, generating fresh");
      }
    }
    
    // Fallback to on-demand generation
    const textToRead = `${result.type}. ${result.summary}. מה לעשות: ${result.actions.join(". ")}`;
    await playTTS(textToRead, () => setIsSpeaking(false));
  };

  const handleReadChatMessage = async (index: number, content: string) => {
    if (speakingMessageIndex === index) {
      // Stop playing
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
        audioPlayerRef.current = null;
      }
      if (nativePlayer) {
        nativePlayer.pause();
      }
      Speech.stop();
      setSpeakingMessageIndex(null);
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSpeakingMessageIndex(index);
    await playTTS(content, () => setSpeakingMessageIndex(null));
  };

  const handleCallFamily = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Linking.openURL("tel:");
  };

  const handleShareWhatsApp = () => {
    if (!result) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const message = `📄 ${result.type}\n\n📝 ${result.summary}\n\n✅ מה לעשות:\n${result.actions.map((a, i) => `${i + 1}. ${a}`).join("\n")}`;
    const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(message)}`;
    Linking.openURL(whatsappUrl);
  };

  const handleOpenChat = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setChatMessages([{
      role: "assistant",
      content: "שלום! אני כאן לעזור לך להבין את המסמך. מה תרצה לדעת?"
    }]);
    setShowChatModal(true);
  };

  const handleSendChatMessage = async () => {
    if (!chatInput.trim() || isSendingChat) return;
    
    const userMessage = chatInput.trim();
    setChatInput("");
    setChatMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setIsSendingChat(true);

    try {
      const baseUrl = getApiUrl();
      const response = await fetch(new URL("/api/ai/letter-chat", baseUrl).href, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          documentContext: result ? `סוג: ${result.type}\nסיכום: ${result.summary}\nפעולות: ${result.actions.join(", ")}` : "",
          imageBase64: documentBase64,
        }),
      });

      const data = await response.json();
      setChatMessages(prev => [...prev, { role: "assistant", content: data.response || "סליחה, לא הצלחתי להבין. נסה שוב." }]);
    } catch (error) {
      setChatMessages(prev => [...prev, { role: "assistant", content: "סליחה, יש בעיה בחיבור. נסה שוב." }]);
    } finally {
      setIsSendingChat(false);
      setTimeout(() => chatScrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  const findHebrewTerms = (text: string): string[] => {
    const foundTerms: string[] = [];
    Object.keys(hebrewTerms).forEach(term => {
      if (text.includes(term)) {
        foundTerms.push(term);
      }
    });
    return foundTerms;
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "high":
        return theme.danger;
      case "medium":
        return theme.warning;
      case "low":
        return theme.success;
      default:
        return theme.textSecondary;
    }
  };

  const getUrgencyLabel = (urgency: string) => {
    switch (urgency) {
      case "high":
        return t("letterHelper.urgencyHigh");
      case "medium":
        return t("letterHelper.urgencyMedium");
      case "low":
        return t("letterHelper.urgencyLow");
      default:
        return "";
    }
  };

  const getUrgencyIcon = (urgency: string): "warning-outline" | "time-outline" | "checkmark-circle-outline" => {
    switch (urgency) {
      case "high":
        return "warning-outline";
      case "medium":
        return "time-outline";
      case "low":
        return "checkmark-circle-outline";
      default:
        return "checkmark-circle-outline";
    }
  };

  const termsInDocument = result ? findHebrewTerms(`${result.type} ${result.summary}`) : [];

  return (
    <ThemedView style={styles.container}>
      <KeyboardAwareScrollViewCompat
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: headerHeight + Spacing.xl,
            paddingBottom: insets.bottom + Spacing.xl,
          },
        ]}
      >
        <Animated.View entering={FadeInDown.duration(500)}>
          <GlassCard style={styles.uploadCard}>
            {selectedFile ? (
              <View style={styles.imageContainer}>
                {fileType === "image" ? (
                  <Image
                    source={{ uri: selectedFile }}
                    style={styles.previewImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={[styles.pdfPreview, { backgroundColor: theme.card }]}>
                    <Ionicons name="document-text-outline" size={64} color={theme.primary} />
                    <ThemedText type="body" style={styles.pdfFileName} numberOfLines={2}>
                      {fileName || "PDF Document"}
                    </ThemedText>
                  </View>
                )}
                <Pressable
                  style={[styles.removeButton, { backgroundColor: theme.danger }]}
                  onPress={() => {
                    setSelectedFile(null);
                    setFileType(null);
                    setFileName(null);
                    setResult(null);
                    setCompletedActions(new Set());
                    setDocumentBase64(null);
                  }}
                >
                  <Ionicons name="close" size={18} color="#FFFFFF" />
                  <ThemedText type="small" style={{ color: "#FFFFFF", marginLeft: 4 }}>הסר</ThemedText>
                </Pressable>
              </View>
            ) : (
              <View style={styles.uploadPlaceholder}>
                <View
                  style={[
                    styles.uploadIcon,
                    { backgroundColor: theme.primary + "20" },
                  ]}
                >
                  <Ionicons name="document-text-outline" size={48} color={theme.primary} />
                </View>
                <ThemedText type="body" style={styles.uploadText}>
                  {t("letterHelper.upload")}
                </ThemedText>
              </View>
            )}

            <View style={styles.buttonRow}>
              <GlassButton
                variant="secondary"
                onPress={handlePickImage}
                icon={<Ionicons name="image-outline" size={20} color={theme.primary} />}
                style={styles.thirdButton}
                testID="pick-image-button"
              >
                גלריה
              </GlassButton>
              {Platform.OS !== "web" ? (
                <GlassButton
                  variant="secondary"
                  onPress={handleTakePhoto}
                  icon={<Ionicons name="camera-outline" size={20} color={theme.primary} />}
                  style={styles.thirdButton}
                  testID="take-photo-button"
                >
                  מצלמה
                </GlassButton>
              ) : null}
              <GlassButton
                variant="secondary"
                onPress={handlePickPDF}
                icon={<Ionicons name="document-outline" size={20} color={theme.primary} />}
                style={styles.thirdButton}
                testID="pick-file-button"
              >
                קבצים
              </GlassButton>
            </View>

            {selectedFile && !result && !isAnalyzing ? (
              <GlassButton
                onPress={handleAnalyze}
                disabled={isAnalyzing}
                icon={<Ionicons name="search" size={20} color="#FFFFFF" />}
                testID="analyze-button"
              >
                נתח מסמך
              </GlassButton>
            ) : null}
          </GlassCard>
        </Animated.View>

        {isAnalyzing ? (
          <Animated.View entering={FadeInUp.duration(400)}>
            <GlassCard style={styles.resultCard}>
              <DocumentScanAnimation theme={theme} />
            </GlassCard>
          </Animated.View>
        ) : null}

        {result ? (
          <Animated.View entering={FadeInUp.delay(200).duration(500)}>
            {/* Document Type Card */}
            <GlassCard style={styles.resultCard}>
              <View style={styles.resultRow}>
                <View
                  style={[
                    styles.resultIcon,
                    { backgroundColor: theme.primary + "20" },
                  ]}
                >
                  <Ionicons name="document-text-outline" size={24} color={theme.primary} />
                </View>
                <View style={styles.resultContent}>
                  <ThemedText
                    type="small"
                    style={{ color: theme.textSecondary }}
                  >
                    {t("letterHelper.whatIsIt")}
                  </ThemedText>
                  <ThemedText type="h4">{result.type}</ThemedText>
                </View>
              </View>
            </GlassCard>

            {/* Enhanced Urgency Badge */}
            <GlassCard style={StyleSheet.flatten([styles.resultCard, styles.urgencyCard, { borderLeftColor: getUrgencyColor(result.urgency), borderLeftWidth: 4 }])}>
              <View style={styles.urgencyBadgeContainer}>
                <View
                  style={[
                    styles.urgencyBadge,
                    { backgroundColor: getUrgencyColor(result.urgency) },
                  ]}
                >
                  <Ionicons
                    name={getUrgencyIcon(result.urgency)}
                    size={28}
                    color="#FFFFFF"
                  />
                </View>
                <View style={styles.urgencyTextContainer}>
                  <ThemedText
                    type="small"
                    style={{ color: theme.textSecondary }}
                  >
                    {t("letterHelper.urgency")}
                  </ThemedText>
                  <ThemedText
                    type="h3"
                    style={{ color: getUrgencyColor(result.urgency), fontWeight: "700" }}
                  >
                    {getUrgencyLabel(result.urgency)}
                  </ThemedText>
                </View>
              </View>
            </GlassCard>

            {/* Enhanced Summary with larger text */}
            <GlassCard style={styles.resultCard}>
              <View style={styles.summaryHeader}>
                <ThemedText
                  type="small"
                  style={[styles.resultLabel, { color: theme.textSecondary }]}
                >
                  {t("letterHelper.summary")}
                </ThemedText>
                <Pressable
                  onPress={handleReadAloud}
                  style={[styles.speakButton, { backgroundColor: isSpeaking ? theme.primary : theme.primary + "20" }]}
                >
                  <Ionicons name={isSpeaking ? "volume-mute-outline" : "volume-high-outline"} size={18} color={isSpeaking ? "#FFFFFF" : theme.primary} />
                  <ThemedText type="small" style={{ color: isSpeaking ? "#FFFFFF" : theme.primary, marginLeft: 6 }}>
                    {isSpeaking ? "עצור" : "הקרא"}
                  </ThemedText>
                </Pressable>
              </View>
              <ThemedText type="body" style={styles.summaryTextLarge}>
                {result.summary}
              </ThemedText>
            </GlassCard>

            {/* Hebrew Terms Tooltips */}
            {termsInDocument.length > 0 ? (
              <GlassCard style={styles.resultCard}>
                <ThemedText
                  type="small"
                  style={[styles.resultLabel, { color: theme.textSecondary }]}
                >
                  מה זה אומר?
                </ThemedText>
                <View style={styles.termsContainer}>
                  {termsInDocument.map((term, index) => (
                    <Pressable
                      key={index}
                      style={[styles.termChip, { backgroundColor: theme.primary + "15", borderColor: theme.primary + "40" }]}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setShowTooltip(showTooltip === term ? null : term);
                      }}
                    >
                      <Ionicons name="help-circle-outline" size={16} color={theme.primary} />
                      <ThemedText type="body" style={{ color: theme.primary, marginLeft: 6 }}>
                        {term}
                      </ThemedText>
                    </Pressable>
                  ))}
                </View>
                {showTooltip ? (
                  <View style={[styles.tooltipBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <ThemedText type="body" style={styles.tooltipText}>
                      {hebrewTerms[showTooltip]}
                    </ThemedText>
                  </View>
                ) : null}
              </GlassCard>
            ) : null}

            {/* Actions with Checkboxes */}
            <GlassCard style={styles.resultCard}>
              <ThemedText
                type="small"
                style={[styles.resultLabel, { color: theme.textSecondary }]}
              >
                {t("letterHelper.actions")}
              </ThemedText>
              {result.actions.map((action, index) => (
                <Pressable 
                  key={index} 
                  style={styles.actionRow}
                  onPress={() => toggleActionComplete(index)}
                >
                  <View
                    style={[
                      styles.checkbox,
                      { 
                        backgroundColor: completedActions.has(index) ? theme.success : "transparent",
                        borderColor: completedActions.has(index) ? theme.success : theme.border,
                      },
                    ]}
                  >
                    {completedActions.has(index) ? (
                      <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                    ) : null}
                  </View>
                  <ThemedText 
                    type="body" 
                    style={[
                      styles.actionText,
                      completedActions.has(index) && styles.actionTextCompleted,
                    ]}
                  >
                    {action}
                  </ThemedText>
                </Pressable>
              ))}
            </GlassCard>

            {/* Action Buttons */}
            <View style={styles.actionButtonsRow}>
              <GlassButton
                variant="secondary"
                onPress={handleOpenChat}
                icon={<Ionicons name="chatbubble-outline" size={20} color={theme.primary} />}
                style={styles.actionButton}
              >
                שאל שאלה
              </GlassButton>
              <GlassButton
                variant="secondary"
                onPress={handleShareWhatsApp}
                icon={<Ionicons name="share-outline" size={20} color={theme.primary} />}
                style={styles.actionButton}
              >
                שתף
              </GlassButton>
            </View>
            
            <GlassButton
              variant="secondary"
              onPress={handleCallFamily}
              icon={<Ionicons name="call-outline" size={20} color={theme.primary} />}
              style={styles.callButton}
            >
              התקשר למשפחה לעזרה
            </GlassButton>
          </Animated.View>
        ) : null}
      </KeyboardAwareScrollViewCompat>

      {/* Chat Modal */}
      <Modal
        visible={showChatModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowChatModal(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: theme.backgroundDefault }]}>
          <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
            <ThemedText type="h4">שאל על המסמך</ThemedText>
            <Pressable onPress={() => setShowChatModal(false)} style={styles.closeButton}>
              <Ionicons name="close" size={20} color={theme.text} />
              <ThemedText type="small" style={{ color: theme.text, marginLeft: 4 }}>סגור</ThemedText>
            </Pressable>
          </View>
          
          <ScrollView 
            ref={chatScrollRef}
            style={styles.chatMessages}
            contentContainerStyle={styles.chatMessagesContent}
          >
            {chatMessages.map((msg, index) => (
              <View 
                key={index} 
                style={[
                  styles.chatBubble,
                  msg.role === "user" ? styles.userBubble : styles.assistantBubble,
                  { backgroundColor: msg.role === "user" ? theme.primary : theme.card }
                ]}
              >
                <ThemedText 
                  type="body" 
                  style={{ color: msg.role === "user" ? "#FFFFFF" : theme.text }}
                >
                  {msg.content}
                </ThemedText>
                {msg.role === "assistant" ? (
                  <Pressable
                    onPress={() => handleReadChatMessage(index, msg.content)}
                    style={[styles.chatSpeakButton, { backgroundColor: speakingMessageIndex === index ? theme.primary : theme.primary + "20" }]}
                  >
                    <Ionicons 
                      name={speakingMessageIndex === index ? "volume-mute-outline" : "volume-high-outline"} 
                      size={14} 
                      color={speakingMessageIndex === index ? "#FFFFFF" : theme.primary} 
                    />
                    <ThemedText type="small" style={{ color: speakingMessageIndex === index ? "#FFFFFF" : theme.primary, marginLeft: 4, fontSize: 12 }}>
                      {speakingMessageIndex === index ? "עצור" : "הקרא"}
                    </ThemedText>
                  </Pressable>
                ) : null}
              </View>
            ))}
            {isSendingChat ? (
              <View style={[styles.chatBubble, styles.assistantBubble, { backgroundColor: theme.card }]}>
                <ActivityIndicator size="small" color={theme.primary} />
              </View>
            ) : null}
          </ScrollView>
          
          <View style={[styles.chatInputContainer, { backgroundColor: theme.card, paddingBottom: insets.bottom + Spacing.md }]}>
            <TextInput
              style={[styles.chatInput, { backgroundColor: theme.backgroundDefault, color: theme.text, borderColor: theme.border }]}
              value={chatInput}
              onChangeText={setChatInput}
              placeholder="כתוב שאלה..."
              placeholderTextColor={theme.textSecondary}
              multiline
              textAlign="right"
            />
            <Pressable 
              onPress={handleSendChatMessage}
              style={[styles.sendButton, { backgroundColor: theme.primary }]}
              disabled={isSendingChat || !chatInput.trim()}
            >
              <Ionicons name="send" size={16} color="#FFFFFF" />
              <ThemedText type="small" style={{ color: "#FFFFFF", marginLeft: 4 }}>שלח</ThemedText>
            </Pressable>
          </View>
        </View>
      </Modal>
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
    gap: Spacing.lg,
  },
  uploadCard: {
    padding: Spacing.xl,
    gap: Spacing.lg,
  },
  uploadPlaceholder: {
    alignItems: "center",
    paddingVertical: Spacing["3xl"],
  },
  uploadIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
  },
  uploadText: {
    textAlign: "center",
  },
  imageContainer: {
    position: "relative",
    borderRadius: BorderRadius.md,
    overflow: "hidden",
  },
  previewImage: {
    width: "100%",
    height: 200,
    borderRadius: BorderRadius.md,
  },
  removeButton: {
    position: "absolute",
    top: Spacing.sm,
    right: Spacing.sm,
    flexDirection: "row",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonRow: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  thirdButton: {
    flex: 1,
  },
  pdfPreview: {
    width: "100%",
    height: 200,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.md,
  },
  pdfFileName: {
    textAlign: "center",
    paddingHorizontal: Spacing.lg,
  },
  resultCard: {
    padding: Spacing.xl,
  },
  resultRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  resultIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.lg,
  },
  resultContent: {
    flex: 1,
  },
  resultLabel: {
    marginBottom: Spacing.sm,
  },
  urgencyCard: {
    borderRadius: BorderRadius.md,
  },
  urgencyBadgeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  urgencyBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.lg,
  },
  urgencyTextContainer: {
    flex: 1,
  },
  summaryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  speakButton: {
    flexDirection: "row",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  chatSpeakButton: {
    flexDirection: "row",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.sm,
    alignSelf: "flex-start",
  },
  summaryTextLarge: {
    fontSize: 20,
    lineHeight: 32,
    fontWeight: "500",
  },
  termsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  termChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  tooltipBox: {
    marginTop: Spacing.md,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  tooltipText: {
    lineHeight: 26,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: Spacing.md,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  actionText: {
    flex: 1,
    paddingTop: 4,
    fontSize: 18,
    lineHeight: 26,
  },
  actionTextCompleted: {
    textDecorationLine: "line-through",
    opacity: 0.6,
  },
  actionButtonsRow: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  actionButton: {
    flex: 1,
  },
  callButton: {
    marginTop: Spacing.sm,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacing.lg,
    borderBottomWidth: 1,
  },
  closeButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.sm,
  },
  chatMessages: {
    flex: 1,
  },
  chatMessagesContent: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  chatBubble: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    maxWidth: "85%",
  },
  userBubble: {
    alignSelf: "flex-end",
  },
  assistantBubble: {
    alignSelf: "flex-start",
  },
  chatInputContainer: {
    flexDirection: "row",
    padding: Spacing.md,
    gap: Spacing.md,
    alignItems: "flex-end",
  },
  chatInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    maxHeight: 100,
    fontSize: 16,
  },
  sendButton: {
    flexDirection: "row",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
  },
});

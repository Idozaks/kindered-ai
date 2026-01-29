import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from "react";
import { AppState, AppStateStatus, Platform } from "react-native";
import * as Speech from "expo-speech";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AudioPlayer, useAudioPlayer } from "expo-audio";

import { getApiUrl } from "@/lib/query-client";

import { AuraVoiceState } from "@/components/aura/AuraPulseOrb";
import { CircleContact } from "@/components/aura/AuraCircleContacts";
import { Medication } from "@/components/aura/AuraMedicationReminder";
import { predictGenderFromName, isAmbiguousName, getGenderedGreeting } from "@/utils/hebrewNames";

type DayContext = "morning" | "daytime" | "evening" | "night";
type AuraMode = "normal" | "crisis" | "idle_engagement" | "handshake";
type Gender = "male" | "female" | null;
type HandshakeStep = "idle" | "asking_name" | "predicting_gender" | "asking_gender" | "complete";

interface PinnedAnswer {
  id: string;
  question: string;
  answer: string;
  repeatCount: number;
}

interface AuraState {
  voiceState: AuraVoiceState;
  mode: AuraMode;
  dayContext: DayContext;
  transcript: string;
  lastInteraction: Date;
  isVisible: boolean;
  speechRate: number;
  contacts: CircleContact[];
  medications: Medication[];
  hydrationGlasses: number;
  hydrationGoal: number;
  lastMoodCheck: Date | null;
  userName: string | null;
  userGender: Gender;
  handshakeCompleted: boolean;
  handshakeStep: HandshakeStep;
  lastSpokenMessage: string;
  pinnedAnswers: PinnedAnswer[];
  screenIdleTime: number;
  currentScreen: string;
  patienceTimerActive: boolean;
}

interface AuraContextValue extends AuraState {
  setVoiceState: (state: AuraVoiceState) => void;
  setMode: (mode: AuraMode) => void;
  setTranscript: (text: string) => void;
  speak: (text: string, confirmationWord?: string) => Promise<void>;
  stopSpeaking: () => void;
  repeatLastMessage: () => void;
  slowDownSpeech: () => void;
  simplifyMessage: (message: string) => string;
  toggleVisibility: () => void;
  recordInteraction: () => void;
  checkForCrisisKeywords: (text: string) => boolean;
  getGreeting: () => string;
  setContacts: (contacts: CircleContact[]) => void;
  setMedications: (medications: Medication[]) => void;
  addHydrationGlass: () => void;
  removeHydrationGlass: () => void;
  markMoodCheckComplete: () => void;
  startHandshake: () => void;
  setUserName: (name: string) => void;
  setUserGender: (gender: Gender) => void;
  completeHandshake: () => void;
  resetHandshake: () => void;
  getGenderedText: (text: string) => string;
  setCurrentScreen: (screen: string) => void;
  addPinnedAnswer: (question: string, answer: string) => void;
  removePinnedAnswer: (id: string) => void;
  getContextualSuggestion: () => string | null;
  triggerHapticConfirmation: () => void;
  checkPatienceRule: () => void;
}

const defaultState: AuraState = {
  voiceState: "idle",
  mode: "normal",
  dayContext: "daytime",
  transcript: "",
  lastInteraction: new Date(),
  isVisible: true,
  speechRate: 0.8,
  contacts: [],
  medications: [],
  hydrationGlasses: 0,
  hydrationGoal: 8,
  lastMoodCheck: null,
  userName: null,
  userGender: null,
  handshakeCompleted: false,
  handshakeStep: "idle",
  lastSpokenMessage: "",
  pinnedAnswers: [],
  screenIdleTime: 0,
  currentScreen: "home",
  patienceTimerActive: false,
};

const AuraContext = createContext<AuraContextValue | undefined>(undefined);

const CRISIS_KEYWORDS_HE = ["נפלתי", "כואב", "עזרה", "חירום", "סחרחורת", "לב", "נשימה", "אבוד", "פחד"];
const CRISIS_KEYWORDS_EN = ["fall", "fell", "hurt", "pain", "lost", "help", "emergency", "dizzy", "chest", "breath"];
const IDLE_TIMEOUT_MS = 4 * 60 * 60 * 1000;
const SCREEN_IDLE_SUGGESTION_MS = 10 * 1000;
const PATIENCE_RULE_MS = 5 * 1000;

const STORAGE_KEYS = {
  USER_NAME: "@aura_user_name",
  USER_GENDER: "@aura_user_gender",
  HANDSHAKE_COMPLETED: "@aura_handshake_completed",
  PINNED_ANSWERS: "@aura_pinned_answers",
  GREETING_AUDIO: "@aura_greeting_audio",
};

const GREETING_MESSAGE = "שלום אני דורי, מה שמכם?";

function getDayContext(): DayContext {
  const hour = new Date().getHours();
  if (hour >= 7 && hour < 10) return "morning";
  if (hour >= 10 && hour < 18) return "daytime";
  if (hour >= 18 && hour < 21) return "evening";
  return "night";
}

const SCREEN_SUGGESTIONS: Record<string, { he: string; en: string }> = {
  contacts: { 
    he: "צריך עזרה להתקשר לבת שלך?",
    en: "Need help calling your daughter?" 
  },
  whatsapp: { 
    he: "רוצה ללמוד לשלוח הודעה בוואטסאפ?",
    en: "Want to learn how to send a WhatsApp message?" 
  },
  gmail: { 
    he: "אפשר לעזור לך לקרוא מייל?",
    en: "Can I help you read an email?" 
  },
  photos: { 
    he: "רוצה לשתף תמונה עם המשפחה?",
    en: "Want to share a photo with family?" 
  },
  home: { 
    he: "יש לי כמה דברים שאפשר לעזור לך איתם. מה תרצה לעשות?",
    en: "I have some things I can help you with. What would you like to do?" 
  },
  settings: { 
    he: "צריך עזרה עם ההגדרות?",
    en: "Need help with settings?" 
  },
};

export function AuraProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuraState>({
    ...defaultState,
    dayContext: getDayContext(),
  });

  const screenIdleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const patienceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const onAudioCompleteRef = useRef<(() => void) | null>(null);
  
  const nativePlayer = useAudioPlayer(null);
  
  useEffect(() => {
    if (nativePlayer) {
      const subscription = nativePlayer.addListener("playbackStatusUpdate", (status) => {
        if ((status as any).didJustFinish && onAudioCompleteRef.current) {
          onAudioCompleteRef.current();
          onAudioCompleteRef.current = null;
        }
      });
      return () => subscription.remove();
    }
  }, [nativePlayer]);

  const cachedGreetingRef = useRef<{ audioBase64: string; mimeType: string } | null>(null);

  const preCacheGreeting = useCallback(async () => {
    try {
      const cached = await AsyncStorage.getItem(STORAGE_KEYS.GREETING_AUDIO);
      if (cached) {
        cachedGreetingRef.current = JSON.parse(cached);
        return;
      }
      
      const baseUrl = getApiUrl();
      const response = await fetch(new URL("/api/ai/tts", baseUrl).href, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: GREETING_MESSAGE }),
      });
      
      const data = await response.json();
      
      if (data.audioBase64 && !data.fallback) {
        const audioData = { audioBase64: data.audioBase64, mimeType: data.mimeType };
        await AsyncStorage.setItem(STORAGE_KEYS.GREETING_AUDIO, JSON.stringify(audioData));
        cachedGreetingRef.current = audioData;
      }
    } catch (error) {
      console.log("Failed to pre-cache greeting:", error);
    }
  }, []);

  useEffect(() => {
    const loadStoredData = async () => {
      try {
        const [userName, userGender, handshakeCompleted, pinnedAnswers] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.USER_NAME),
          AsyncStorage.getItem(STORAGE_KEYS.USER_GENDER),
          AsyncStorage.getItem(STORAGE_KEYS.HANDSHAKE_COMPLETED),
          AsyncStorage.getItem(STORAGE_KEYS.PINNED_ANSWERS),
        ]);

        setState(prev => ({
          ...prev,
          userName: userName || null,
          userGender: (userGender as Gender) || null,
          handshakeCompleted: handshakeCompleted === "true",
          handshakeStep: handshakeCompleted === "true" ? "complete" : "idle",
          pinnedAnswers: pinnedAnswers ? JSON.parse(pinnedAnswers) : [],
        }));

        preCacheGreeting();
      } catch (error) {
        console.error("Error loading Aura stored data:", error);
      }
    };

    loadStoredData();
  }, [preCacheGreeting]);

  useEffect(() => {
    const interval = setInterval(() => {
      const newContext = getDayContext();
      if (newContext !== state.dayContext) {
        setState((prev) => ({ ...prev, dayContext: newContext }));
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [state.dayContext]);

  useEffect(() => {
    const checkIdleTimeout = () => {
      const now = new Date();
      const timeSinceLastInteraction = now.getTime() - state.lastInteraction.getTime();

      if (timeSinceLastInteraction >= IDLE_TIMEOUT_MS && state.mode !== "idle_engagement") {
        setState((prev) => ({ ...prev, mode: "idle_engagement" }));
      }
    };

    const interval = setInterval(checkIdleTimeout, 60000);
    return () => clearInterval(interval);
  }, [state.lastInteraction, state.mode]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState: AppStateStatus) => {
      if (nextState === "active") {
        setState((prev) => ({
          ...prev,
          dayContext: getDayContext(),
          lastInteraction: new Date(),
        }));
      }
    });

    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (screenIdleTimerRef.current) {
      clearTimeout(screenIdleTimerRef.current);
    }

    screenIdleTimerRef.current = setTimeout(() => {
      setState(prev => ({ ...prev, screenIdleTime: SCREEN_IDLE_SUGGESTION_MS }));
    }, SCREEN_IDLE_SUGGESTION_MS);

    return () => {
      if (screenIdleTimerRef.current) {
        clearTimeout(screenIdleTimerRef.current);
      }
    };
  }, [state.currentScreen, state.lastInteraction]);

  const triggerHapticConfirmation = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, []);

  const setVoiceState = useCallback((voiceState: AuraVoiceState) => {
    setState((prev) => ({ ...prev, voiceState }));
  }, []);

  const setMode = useCallback((mode: AuraMode) => {
    if (mode === "crisis") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
    setState((prev) => ({ ...prev, mode }));
  }, []);

  const setTranscript = useCallback((transcript: string) => {
    setState((prev) => ({ ...prev, transcript }));
  }, []);

  const playNativeAudio = useCallback(async (base64: string, mimeType: string, onComplete?: () => void) => {
    try {
      onAudioCompleteRef.current = onComplete || null;
      const uri = `data:${mimeType};base64,${base64}`;
      nativePlayer.replace({ uri });
      nativePlayer.play();
    } catch (error) {
      console.error("Native audio playback error:", error);
      if (onComplete) onComplete();
    }
  }, [nativePlayer]);

  const playCachedGreeting = useCallback(async (onComplete?: () => void) => {
    const cached = cachedGreetingRef.current;
    if (!cached) {
      return false;
    }

    try {
      setState((prev) => ({ 
        ...prev, 
        voiceState: "speaking", 
        transcript: GREETING_MESSAGE,
        lastSpokenMessage: GREETING_MESSAGE,
      }));

      if (Platform.OS === "web") {
        const audioSrc = `data:${cached.mimeType};base64,${cached.audioBase64}`;
        const audio = new window.Audio(audioSrc);
        audioPlayerRef.current = audio;
        
        audio.onended = () => {
          setState((prev) => ({ ...prev, voiceState: "idle" }));
          if (onComplete) onComplete();
        };
        audio.onerror = () => {
          setState((prev) => ({ ...prev, voiceState: "idle" }));
          if (onComplete) onComplete();
        };
        audio.play();
      } else {
        await playNativeAudio(cached.audioBase64, cached.mimeType, () => {
          setState((prev) => ({ ...prev, voiceState: "idle" }));
          if (onComplete) onComplete();
        });
      }
      return true;
    } catch (error) {
      console.error("Failed to play cached greeting:", error);
      setState((prev) => ({ ...prev, voiceState: "idle" }));
      return false;
    }
  }, [playNativeAudio]);

  const speakWithGeminiTTS = useCallback(async (text: string, onComplete?: () => void) => {
    try {
      const baseUrl = getApiUrl();
      const response = await fetch(new URL("/api/ai/tts", baseUrl).href, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      
      const data = await response.json();
      
      if (data.audioBase64 && !data.fallback) {
        if (Platform.OS === "web") {
          const audioSrc = `data:${data.mimeType};base64,${data.audioBase64}`;
          const audio = new window.Audio(audioSrc);
          audioPlayerRef.current = audio;
          
          audio.onended = () => {
            if (onComplete) onComplete();
          };
          audio.onerror = () => {
            if (onComplete) onComplete();
          };
          audio.play();
        } else {
          await playNativeAudio(data.audioBase64, data.mimeType, onComplete);
        }
        return true;
      }
    } catch (error) {
      console.log("Gemini TTS failed, falling back to expo-speech:", error);
    }
    return false;
  }, [playNativeAudio]);

  const speak = useCallback(async (text: string, confirmationWord?: string) => {
    setState((prev) => ({ 
      ...prev, 
      voiceState: "speaking", 
      transcript: text,
      lastSpokenMessage: text,
    }));

    triggerHapticConfirmation();

    return new Promise<void>(async (resolve) => {
      const onComplete = () => {
        setState((prev) => ({ ...prev, voiceState: "idle" }));
        if (confirmationWord) {
          Speech.speak(confirmationWord, { 
            rate: state.speechRate,
            language: "he-IL",
          });
        }
        resolve();
      };

      const usedGemini = await speakWithGeminiTTS(text, onComplete);
      
      if (!usedGemini) {
        Speech.speak(text, {
          rate: state.speechRate,
          language: "he-IL",
          onDone: onComplete,
          onError: () => {
            setState((prev) => ({ ...prev, voiceState: "idle" }));
            resolve();
          },
        });
      }
    });
  }, [state.speechRate, triggerHapticConfirmation, speakWithGeminiTTS]);

  const stopSpeaking = useCallback(() => {
    Speech.stop();
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current = null;
    }
    if (nativePlayer) {
      nativePlayer.pause();
    }
    setState((prev) => ({ ...prev, voiceState: "idle" }));
  }, [nativePlayer]);

  const repeatLastMessage = useCallback(() => {
    if (state.lastSpokenMessage) {
      speak(state.lastSpokenMessage);
      triggerHapticConfirmation();
    }
  }, [state.lastSpokenMessage, speak, triggerHapticConfirmation]);

  const slowDownSpeech = useCallback(() => {
    setState((prev) => ({
      ...prev,
      speechRate: Math.max(0.5, prev.speechRate - 0.1),
    }));
    triggerHapticConfirmation();
  }, [triggerHapticConfirmation]);

  const simplifyMessage = useCallback((message: string): string => {
    return message;
  }, []);

  const toggleVisibility = useCallback(() => {
    setState((prev) => ({ ...prev, isVisible: !prev.isVisible }));
  }, []);

  const recordInteraction = useCallback(() => {
    setState((prev) => ({
      ...prev,
      lastInteraction: new Date(),
      mode: prev.mode === "idle_engagement" ? "normal" : prev.mode,
      screenIdleTime: 0,
    }));
    
    if (patienceTimerRef.current) {
      clearTimeout(patienceTimerRef.current);
      patienceTimerRef.current = null;
    }
    setState(prev => ({ ...prev, patienceTimerActive: false }));
  }, []);

  const checkForCrisisKeywords = useCallback((text: string): boolean => {
    const lowerText = text.toLowerCase();
    const allCrisisKeywords = [...CRISIS_KEYWORDS_HE, ...CRISIS_KEYWORDS_EN];
    const hasCrisisKeyword = allCrisisKeywords.some((keyword) =>
      lowerText.includes(keyword.toLowerCase())
    );

    if (hasCrisisKeyword) {
      setMode("crisis");
      return true;
    }

    return false;
  }, [setMode]);

  const getGreeting = useCallback((): string => {
    const name = state.userName ? `, ${state.userName}` : "";
    
    switch (state.dayContext) {
      case "morning":
        return state.userGender === "female" 
          ? `בוקר טוב${name}! הנה מה שמחכה לך היום.`
          : `בוקר טוב${name}! הנה מה שמחכה לך היום.`;
      case "daytime":
        return `שלום${name}! איך אפשר לעזור?`;
      case "evening":
        return `ערב טוב${name}. ספרי לי אם צריך משהו.`;
      case "night":
        return `שלום${name}. זכרי לנוח היטב הלילה.`;
      default:
        return `שלום${name}! אני כאן לעזור.`;
    }
  }, [state.dayContext, state.userName, state.userGender]);

  const getGenderedText = useCallback((text: string): string => {
    return getGenderedGreeting(state.userGender, text);
  }, [state.userGender]);

  const setContacts = useCallback((contacts: CircleContact[]) => {
    setState((prev) => ({ ...prev, contacts }));
  }, []);

  const setMedications = useCallback((medications: Medication[]) => {
    setState((prev) => ({ ...prev, medications }));
  }, []);

  const addHydrationGlass = useCallback(() => {
    triggerHapticConfirmation();
    setState((prev) => ({
      ...prev,
      hydrationGlasses: Math.min(prev.hydrationGlasses + 1, 20),
    }));
    speak("נרשם", undefined);
  }, [triggerHapticConfirmation, speak]);

  const removeHydrationGlass = useCallback(() => {
    setState((prev) => ({
      ...prev,
      hydrationGlasses: Math.max(prev.hydrationGlasses - 1, 0),
    }));
  }, []);

  const markMoodCheckComplete = useCallback(() => {
    triggerHapticConfirmation();
    setState((prev) => ({ ...prev, lastMoodCheck: new Date() }));
  }, [triggerHapticConfirmation]);

  const startHandshake = useCallback(async () => {
    setState(prev => ({ 
      ...prev, 
      mode: "handshake",
      handshakeStep: "asking_name",
    }));
    
    triggerHapticConfirmation();
    
    setTimeout(async () => {
      const usedCached = await playCachedGreeting();
      if (!usedCached) {
        speak(GREETING_MESSAGE);
      }
    }, 300);
  }, [speak, playCachedGreeting, triggerHapticConfirmation]);

  const setUserName = useCallback(async (name: string) => {
    await AsyncStorage.setItem(STORAGE_KEYS.USER_NAME, name);
    
    const predictedGender = predictGenderFromName(name);
    
    if (isAmbiguousName(name)) {
      setState(prev => ({ 
        ...prev, 
        userName: name,
        handshakeStep: "asking_gender",
      }));
      speak(`נעים מאוד, ${name}! רק כדי שאדע לפנות אליך בצורה הכי מכבדת, האם אני פונה לגבר או לאישה?`);
    } else {
      const gender = predictedGender === "male" ? "male" : "female";
      await AsyncStorage.setItem(STORAGE_KEYS.USER_GENDER, gender);
      setState(prev => ({ 
        ...prev, 
        userName: name,
        userGender: gender,
        handshakeStep: "complete",
        handshakeCompleted: true,
        mode: "normal",
      }));
      await AsyncStorage.setItem(STORAGE_KEYS.HANDSHAKE_COMPLETED, "true");
      
      const welcomeMessage = gender === "female" 
        ? `נעים מאוד ${name}! ברוכה הבאה. אני אורה, ואני כאן לעזור לך בכל מה שצריך.`
        : `נעים מאוד ${name}! ברוך הבא. אני אורה, ואני כאן לעזור לך בכל מה שצריך.`;
      speak(welcomeMessage, "בוצע");
    }
    
    triggerHapticConfirmation();
  }, [speak, triggerHapticConfirmation]);

  const setUserGender = useCallback(async (gender: Gender) => {
    if (gender) {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_GENDER, gender);
    }
    
    await AsyncStorage.setItem(STORAGE_KEYS.HANDSHAKE_COMPLETED, "true");
    
    setState(prev => ({ 
      ...prev, 
      userGender: gender,
      handshakeStep: "complete",
      handshakeCompleted: true,
      mode: "normal",
    }));
    
    const name = state.userName || "";
    const welcomeMessage = gender === "female" 
      ? `תודה ${name}! ברוכה הבאה. אני אורה, ואני כאן לעזור לך.`
      : `תודה ${name}! ברוך הבא. אני אורה, ואני כאן לעזור לך.`;
    speak(welcomeMessage, "בוצע");
    triggerHapticConfirmation();
  }, [state.userName, speak, triggerHapticConfirmation]);

  const completeHandshake = useCallback(async () => {
    await AsyncStorage.setItem(STORAGE_KEYS.HANDSHAKE_COMPLETED, "true");
    setState(prev => ({ 
      ...prev, 
      handshakeCompleted: true,
      handshakeStep: "complete",
      mode: "normal",
    }));
  }, []);

  const resetHandshake = useCallback(async () => {
    setState(prev => ({ 
      ...prev, 
      userName: null,
      userGender: null,
      handshakeCompleted: false,
      handshakeStep: "idle",
      mode: "normal",
      pinnedAnswers: [],
    }));
    cachedGreetingRef.current = null;
    await AsyncStorage.removeItem(STORAGE_KEYS.GREETING_AUDIO);
  }, []);

  const setCurrentScreen = useCallback((screen: string) => {
    setState(prev => ({ 
      ...prev, 
      currentScreen: screen,
      screenIdleTime: 0,
    }));
  }, []);

  const addPinnedAnswer = useCallback(async (question: string, answer: string) => {
    const existingIndex = state.pinnedAnswers.findIndex(
      p => p.question.toLowerCase() === question.toLowerCase()
    );
    
    let newPinnedAnswers: PinnedAnswer[];
    
    if (existingIndex >= 0) {
      newPinnedAnswers = [...state.pinnedAnswers];
      newPinnedAnswers[existingIndex].repeatCount += 1;
      
      if (newPinnedAnswers[existingIndex].repeatCount >= 3) {
        speak("שמתי לב ששאלת את זה כמה פעמים. הצמדתי את התשובה למסך שלך.");
      }
    } else {
      newPinnedAnswers = [
        ...state.pinnedAnswers,
        { 
          id: Date.now().toString(), 
          question, 
          answer, 
          repeatCount: 1 
        }
      ];
    }
    
    await AsyncStorage.setItem(STORAGE_KEYS.PINNED_ANSWERS, JSON.stringify(newPinnedAnswers));
    setState(prev => ({ ...prev, pinnedAnswers: newPinnedAnswers }));
  }, [state.pinnedAnswers, speak]);

  const removePinnedAnswer = useCallback(async (id: string) => {
    const newPinnedAnswers = state.pinnedAnswers.filter(p => p.id !== id);
    await AsyncStorage.setItem(STORAGE_KEYS.PINNED_ANSWERS, JSON.stringify(newPinnedAnswers));
    setState(prev => ({ ...prev, pinnedAnswers: newPinnedAnswers }));
  }, [state.pinnedAnswers]);

  const getContextualSuggestion = useCallback((): string | null => {
    if (state.screenIdleTime < SCREEN_IDLE_SUGGESTION_MS) {
      return null;
    }
    
    const suggestion = SCREEN_SUGGESTIONS[state.currentScreen];
    if (suggestion) {
      return suggestion.he;
    }
    
    return null;
  }, [state.screenIdleTime, state.currentScreen]);

  const checkPatienceRule = useCallback(() => {
    if (patienceTimerRef.current) {
      clearTimeout(patienceTimerRef.current);
    }
    
    setState(prev => ({ ...prev, patienceTimerActive: true }));
    
    patienceTimerRef.current = setTimeout(() => {
      const patienceMessage = state.userGender === "female"
        ? "אני כאן, קחי את הזמן שלך."
        : "אני כאן, קח את הזמן שלך.";
      speak(patienceMessage);
      setState(prev => ({ ...prev, patienceTimerActive: false }));
    }, PATIENCE_RULE_MS);
  }, [state.userGender, speak]);

  const contextValue: AuraContextValue = {
    ...state,
    setVoiceState,
    setMode,
    setTranscript,
    speak,
    stopSpeaking,
    repeatLastMessage,
    slowDownSpeech,
    simplifyMessage,
    toggleVisibility,
    recordInteraction,
    checkForCrisisKeywords,
    getGreeting,
    setContacts,
    setMedications,
    addHydrationGlass,
    removeHydrationGlass,
    markMoodCheckComplete,
    startHandshake,
    setUserName,
    setUserGender,
    completeHandshake,
    resetHandshake,
    getGenderedText,
    setCurrentScreen,
    addPinnedAnswer,
    removePinnedAnswer,
    getContextualSuggestion,
    triggerHapticConfirmation,
    checkPatienceRule,
  };

  return (
    <AuraContext.Provider value={contextValue}>{children}</AuraContext.Provider>
  );
}

export function useAura() {
  const context = useContext(AuraContext);
  if (!context) {
    throw new Error("useAura must be used within an AuraProvider");
  }
  return context;
}

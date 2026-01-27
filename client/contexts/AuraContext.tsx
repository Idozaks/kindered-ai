import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { AppState, AppStateStatus } from "react-native";
import * as Speech from "expo-speech";
import * as Haptics from "expo-haptics";

import { AuraVoiceState } from "@/components/aura/AuraPulseOrb";
import { CircleContact } from "@/components/aura/AuraCircleContacts";
import { Medication } from "@/components/aura/AuraMedicationReminder";

type DayContext = "morning" | "daytime" | "evening" | "night";
type AuraMode = "normal" | "crisis" | "idle_engagement";

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
}

interface AuraContextValue extends AuraState {
  setVoiceState: (state: AuraVoiceState) => void;
  setMode: (mode: AuraMode) => void;
  setTranscript: (text: string) => void;
  speak: (text: string) => Promise<void>;
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
};

const AuraContext = createContext<AuraContextValue | undefined>(undefined);

const CRISIS_KEYWORDS = ["fall", "fell", "hurt", "pain", "lost", "help", "emergency", "dizzy", "chest", "breath"];
const IDLE_TIMEOUT_MS = 4 * 60 * 60 * 1000;

function getDayContext(): DayContext {
  const hour = new Date().getHours();
  if (hour >= 7 && hour < 10) return "morning";
  if (hour >= 10 && hour < 18) return "daytime";
  if (hour >= 18 && hour < 21) return "evening";
  return "night";
}

export function AuraProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuraState>({
    ...defaultState,
    dayContext: getDayContext(),
  });

  const [lastSpokenMessage, setLastSpokenMessage] = useState<string>("");

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

  const speak = useCallback(async (text: string) => {
    setLastSpokenMessage(text);
    setState((prev) => ({ ...prev, voiceState: "speaking", transcript: text }));

    return new Promise<void>((resolve) => {
      Speech.speak(text, {
        rate: state.speechRate,
        onStart: () => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        },
        onDone: () => {
          setState((prev) => ({ ...prev, voiceState: "idle" }));
          resolve();
        },
        onError: () => {
          setState((prev) => ({ ...prev, voiceState: "idle" }));
          resolve();
        },
      });
    });
  }, [state.speechRate]);

  const stopSpeaking = useCallback(() => {
    Speech.stop();
    setState((prev) => ({ ...prev, voiceState: "idle" }));
  }, []);

  const repeatLastMessage = useCallback(() => {
    if (lastSpokenMessage) {
      speak(lastSpokenMessage);
    }
  }, [lastSpokenMessage, speak]);

  const slowDownSpeech = useCallback(() => {
    setState((prev) => ({
      ...prev,
      speechRate: Math.max(0.5, prev.speechRate - 0.1),
    }));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

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
    }));
  }, []);

  const checkForCrisisKeywords = useCallback((text: string): boolean => {
    const lowerText = text.toLowerCase();
    const hasCrisisKeyword = CRISIS_KEYWORDS.some((keyword) =>
      lowerText.includes(keyword)
    );

    if (hasCrisisKeyword) {
      setMode("crisis");
      return true;
    }

    return false;
  }, [setMode]);

  const getGreeting = useCallback((): string => {
    switch (state.dayContext) {
      case "morning":
        return "Rise and Shine! Good morning. Here's what's ahead today.";
      case "daytime":
        return "Hello! How can I help you today?";
      case "evening":
        return "Good evening. Let me know if you need anything.";
      case "night":
        return "Hi there. Remember to rest well tonight.";
      default:
        return "Hello! I'm here to help.";
    }
  }, [state.dayContext]);

  const setContacts = useCallback((contacts: CircleContact[]) => {
    setState((prev) => ({ ...prev, contacts }));
  }, []);

  const setMedications = useCallback((medications: Medication[]) => {
    setState((prev) => ({ ...prev, medications }));
  }, []);

  const addHydrationGlass = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setState((prev) => ({
      ...prev,
      hydrationGlasses: Math.min(prev.hydrationGlasses + 1, 20),
    }));
  }, []);

  const removeHydrationGlass = useCallback(() => {
    setState((prev) => ({
      ...prev,
      hydrationGlasses: Math.max(prev.hydrationGlasses - 1, 0),
    }));
  }, []);

  const markMoodCheckComplete = useCallback(() => {
    setState((prev) => ({ ...prev, lastMoodCheck: new Date() }));
  }, []);

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

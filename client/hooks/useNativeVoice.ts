import { useState, useCallback, useRef, useEffect } from "react";
import { Audio, AVPlaybackStatus } from "expo-av";
import { Platform } from "react-native";
import * as FileSystem from "expo-file-system";
import { getApiUrl } from "@/lib/query-client";

export type VoiceState = "idle" | "listening" | "processing" | "speaking";

interface UseNativeVoiceOptions {
  userName?: string;
  userGender?: string;
  context?: string;
  onStateChange?: (state: VoiceState) => void;
  onTranscript?: (text: string) => void;
  onError?: (error: string) => void;
  autoListen?: boolean;
}

export function useNativeVoice(options: UseNativeVoiceOptions = {}) {
  const { userName, userGender, context, onStateChange, onTranscript, onError, autoListen = true } = options;
  
  const [state, setState] = useState<VoiceState>("idle");
  const [transcript, setTranscript] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);
  
  const recordingRef = useRef<Audio.Recording | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      stopRecording();
      stopPlayback();
    };
  }, []);

  useEffect(() => {
    onStateChange?.(state);
  }, [state, onStateChange]);

  const updateState = useCallback((newState: VoiceState) => {
    if (isMountedRef.current) {
      setState(newState);
    }
  }, []);

  const handleError = useCallback((message: string) => {
    if (isMountedRef.current) {
      setError(message);
      onError?.(message);
      updateState("idle");
    }
  }, [onError, updateState]);

  const stopPlayback = useCallback(async () => {
    if (soundRef.current) {
      try {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
      } catch (e) {
        console.log("Error stopping playback:", e);
      }
      soundRef.current = null;
    }
  }, []);

  const stopRecording = useCallback(async () => {
    if (recordingRef.current) {
      try {
        await recordingRef.current.stopAndUnloadAsync();
      } catch (e) {
        console.log("Error stopping recording:", e);
      }
      recordingRef.current = null;
    }
  }, []);

  const requestPermissions = useCallback(async (): Promise<boolean> => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== "granted") {
        handleError("צריך לאשר גישה למיקרופון");
        return false;
      }
      return true;
    } catch (e) {
      handleError("שגיאה בבקשת הרשאות");
      return false;
    }
  }, [handleError]);

  const playAudioResponse = useCallback(async (audioBase64: string, mimeType: string) => {
    try {
      updateState("speaking");
      
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });

      const audioUri = `data:${mimeType};base64,${audioBase64}`;
      
      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUri },
        { shouldPlay: true },
        (status) => {
          if (status.isLoaded && status.didJustFinish) {
            soundRef.current = null;
            if (isMountedRef.current) {
              updateState("idle");
              if (autoListen) {
                setTimeout(() => {
                  if (isMountedRef.current) {
                    startListening();
                  }
                }, 500);
              }
            }
          }
        }
      );
      
      soundRef.current = sound;
    } catch (e: any) {
      console.error("Audio playback error:", e);
      updateState("idle");
      if (autoListen) {
        setTimeout(() => startListening(), 500);
      }
    }
  }, [updateState, autoListen]);

  const processAudioWithLiveAPI = useCallback(async (audioUri: string) => {
    try {
      updateState("processing");
      
      const audioBase64 = await FileSystem.readAsStringAsync(audioUri, {
        encoding: "base64",
      });
      
      const apiUrl = getApiUrl();
      const response = await fetch(new URL("/api/live/voice-turn", apiUrl).toString(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          audioBase64,
          userName,
          userGender,
          context,
        }),
      });
      
      const data = await response.json();
      
      if (data.text) {
        setTranscript(data.text);
        onTranscript?.(data.text);
      }
      
      if (data.audioBase64 && data.mimeType) {
        await playAudioResponse(data.audioBase64, data.mimeType);
      } else if (data.fallback) {
        handleError(data.text || "לא הצלחתי לעבד את ההקלטה");
      }
    } catch (e: any) {
      console.error("Live API error:", e);
      handleError("שגיאה בחיבור לשרת");
    }
  }, [userName, userGender, context, updateState, onTranscript, playAudioResponse, handleError]);

  const startListening = useCallback(async () => {
    if (state !== "idle") return;
    
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;
    
    try {
      setError(null);
      updateState("listening");
      
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });
      
      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync({
        isMeteringEnabled: true,
        android: {
          extension: ".wav",
          outputFormat: Audio.AndroidOutputFormat.DEFAULT,
          audioEncoder: Audio.AndroidAudioEncoder.DEFAULT,
          sampleRate: 16000,
          numberOfChannels: 1,
          bitRate: 256000,
        },
        ios: {
          extension: ".wav",
          outputFormat: Audio.IOSOutputFormat.LINEARPCM,
          audioQuality: Audio.IOSAudioQuality.HIGH,
          sampleRate: 16000,
          numberOfChannels: 1,
          bitRate: 256000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {
          mimeType: "audio/webm",
          bitsPerSecond: 128000,
        },
      });
      
      await recording.startAsync();
      recordingRef.current = recording;
    } catch (e: any) {
      console.error("Recording start error:", e);
      handleError("לא הצלחתי להתחיל הקלטה");
    }
  }, [state, requestPermissions, updateState, handleError]);

  const stopListening = useCallback(async () => {
    if (!recordingRef.current || state !== "listening") return;
    
    try {
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      recordingRef.current = null;
      
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });
      
      if (uri) {
        await processAudioWithLiveAPI(uri);
      } else {
        handleError("לא נמצאה הקלטה");
      }
    } catch (e: any) {
      console.error("Recording stop error:", e);
      handleError("שגיאה בעיבוד ההקלטה");
    }
  }, [state, processAudioWithLiveAPI, handleError]);

  const sendTextMessage = useCallback(async (text: string) => {
    if (state !== "idle") return;
    
    try {
      setError(null);
      updateState("processing");
      
      const apiUrl = getApiUrl();
      const response = await fetch(new URL("/api/live/voice-text", apiUrl).toString(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          userName,
          userGender,
          context,
        }),
      });
      
      const data = await response.json();
      
      if (data.text) {
        setTranscript(data.text);
        onTranscript?.(data.text);
      }
      
      if (data.audioBase64 && data.mimeType) {
        await playAudioResponse(data.audioBase64, data.mimeType);
      } else if (data.fallback) {
        updateState("idle");
      }
    } catch (e: any) {
      console.error("Voice text error:", e);
      handleError("שגיאה בחיבור לשרת");
    }
  }, [state, userName, userGender, context, updateState, onTranscript, playAudioResponse, handleError]);

  const cancel = useCallback(async () => {
    await stopRecording();
    await stopPlayback();
    updateState("idle");
  }, [stopRecording, stopPlayback, updateState]);

  return {
    state,
    transcript,
    error,
    isSupported,
    startListening,
    stopListening,
    sendTextMessage,
    cancel,
    isListening: state === "listening",
    isProcessing: state === "processing",
    isSpeaking: state === "speaking",
  };
}

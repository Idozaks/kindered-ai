import { useState, useCallback, useRef, useEffect } from "react";
import { useAudioRecorder, RecordingPresets, AudioModule } from "expo-audio";
import { useAudioPlayer } from "expo-audio";
import { Platform } from "react-native";
import { File, Paths } from "expo-file-system";
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
  const [audioSource, setAudioSource] = useState<string | null>(null);
  
  const isMountedRef = useRef(true);
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const audioPlayer = useAudioPlayer(audioSource);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    onStateChange?.(state);
  }, [state, onStateChange]);

  useEffect(() => {
    if (audioPlayer && state === "speaking") {
      const checkStatus = () => {
        if (!audioPlayer.playing && isMountedRef.current) {
          updateState("idle");
          if (autoListen) {
            setTimeout(() => {
              if (isMountedRef.current) {
                startListening();
              }
            }, 500);
          }
        }
      };
      
      const interval = setInterval(checkStatus, 200);
      return () => clearInterval(interval);
    }
  }, [audioPlayer, state, autoListen]);

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

  const requestPermissions = useCallback(async (): Promise<boolean> => {
    try {
      const status = await AudioModule.requestRecordingPermissionsAsync();
      if (!status.granted) {
        handleError("צריך לאשר גישה למיקרופון");
        return false;
      }
      return true;
    } catch (e) {
      console.error("Permission error:", e);
      handleError("שגיאה בבקשת הרשאות");
      return false;
    }
  }, [handleError]);

  const playAudioResponse = useCallback(async (audioBase64: string, mimeType: string) => {
    try {
      updateState("speaking");
      
      const fileExt = mimeType.includes("wav") ? "wav" : "mp3";
      const tempFile = new File(Paths.cache, `response_${Date.now()}.${fileExt}`);
      
      const binaryString = atob(audioBase64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      await tempFile.write(bytes);
      
      setAudioSource(tempFile.uri);
      
      setTimeout(() => {
        if (audioPlayer) {
          audioPlayer.play();
        }
      }, 100);
      
    } catch (e: any) {
      console.error("Audio playback error:", e);
      updateState("idle");
      if (autoListen) {
        setTimeout(() => startListening(), 500);
      }
    }
  }, [updateState, autoListen, audioPlayer]);

  const processAudioWithLiveAPI = useCallback(async (recordingUri: string) => {
    try {
      updateState("processing");
      
      const recordingFile = new File(recordingUri);
      const arrayBuffer = await recordingFile.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      let binary = "";
      bytes.forEach((b) => (binary += String.fromCharCode(b)));
      const audioBase64 = btoa(binary);
      
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
      
      if (audioRecorder.isRecording) {
        await audioRecorder.stop();
      }
      
      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();
      console.log("Recording started successfully");
    } catch (e: any) {
      console.error("Recording start error:", e?.message || e);
      updateState("idle");
      handleError("לא הצלחתי להתחיל הקלטה. נסה שוב.");
    }
  }, [state, requestPermissions, updateState, handleError, audioRecorder]);

  const stopListening = useCallback(async () => {
    if (state !== "listening") return;
    
    try {
      await audioRecorder.stop();
      console.log("Recording stopped, URI:", audioRecorder.uri);
      
      if (audioRecorder.uri) {
        await processAudioWithLiveAPI(audioRecorder.uri);
      } else {
        handleError("לא נמצאה הקלטה");
      }
    } catch (e: any) {
      console.error("Recording stop error:", e);
      handleError("שגיאה בעיבוד ההקלטה");
    }
  }, [state, audioRecorder, processAudioWithLiveAPI, handleError]);

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
    try {
      if (audioRecorder.isRecording) {
        await audioRecorder.stop();
      }
      if (audioPlayer && audioPlayer.playing) {
        audioPlayer.pause();
      }
    } catch (e) {
      console.log("Cancel error:", e);
    }
    updateState("idle");
  }, [audioRecorder, audioPlayer, updateState]);

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

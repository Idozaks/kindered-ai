import { useState, useCallback, useRef, useEffect } from "react";
import { useAudioRecorder, RecordingPresets, AudioModule } from "expo-audio";
import { useAudioPlayer } from "expo-audio";
import { Platform } from "react-native";
import { File, Paths } from "expo-file-system";
import { getApiUrl } from "@/lib/query-client";

export type VoiceState = "idle" | "listening" | "processing" | "speaking";

const AUTO_STOP_DELAY_MS = 5000;

interface UseNativeVoiceOptions {
  userName?: string;
  userGender?: string;
  context?: string;
  onStateChange?: (state: VoiceState) => void;
  onTranscript?: (text: string) => void;
  onError?: (error: string) => void;
  autoListen?: boolean;
  autoStopDelay?: number;
}

export function useNativeVoice(options: UseNativeVoiceOptions = {}) {
  const { userName, userGender, context, onStateChange, onTranscript, onError, autoListen = true, autoStopDelay = AUTO_STOP_DELAY_MS } = options;
  
  const [state, setState] = useState<VoiceState>("idle");
  const [transcript, setTranscript] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);
  const [audioSource, setAudioSource] = useState<string | null>(null);
  
  const isMountedRef = useRef(true);
  const isPlayingRef = useRef(false);
  const playbackCompleteRef = useRef(false);
  const autoStopTimerRef = useRef<NodeJS.Timeout | null>(null);
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
    if (audioPlayer && state === "speaking" && isPlayingRef.current) {
      const checkStatus = () => {
        if (!audioPlayer.playing && isMountedRef.current && !playbackCompleteRef.current) {
          playbackCompleteRef.current = true;
          isPlayingRef.current = false;
          setAudioSource(null);
          updateState("idle");
          if (autoListen) {
            setTimeout(() => {
              if (isMountedRef.current && !isPlayingRef.current) {
                startListening();
              }
            }, 800);
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
      if (isPlayingRef.current && audioPlayer) {
        try {
          audioPlayer.pause();
        } catch (e) {}
      }
      
      isPlayingRef.current = true;
      playbackCompleteRef.current = false;
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
        if (audioPlayer && isMountedRef.current) {
          audioPlayer.play();
        }
      }, 150);
      
    } catch (e: any) {
      console.error("Audio playback error:", e);
      isPlayingRef.current = false;
      updateState("idle");
      if (autoListen) {
        setTimeout(() => startListening(), 500);
      }
    }
  }, [updateState, autoListen, audioPlayer]);

  const processAudioWithLiveAPI = useCallback(async (recordingUri: string) => {
    try {
      console.log("processAudioWithLiveAPI called with URI:", recordingUri);
      updateState("processing");
      
      const recordingFile = new File(recordingUri);
      console.log("Reading audio file...");
      const arrayBuffer = await recordingFile.arrayBuffer();
      console.log("Audio file size:", arrayBuffer.byteLength, "bytes");
      
      if (arrayBuffer.byteLength < 1000) {
        console.error("Audio too short, likely empty recording");
        handleError("ההקלטה קצרה מדי. נסה לדבר יותר זמן.");
        return;
      }
      
      const bytes = new Uint8Array(arrayBuffer);
      let binary = "";
      bytes.forEach((b) => (binary += String.fromCharCode(b)));
      const audioBase64 = btoa(binary);
      console.log("Audio encoded to base64, length:", audioBase64.length);
      
      const apiUrl = getApiUrl();
      console.log("Sending to API:", apiUrl);
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
      
      console.log("API response status:", response.status);
      const data = await response.json();
      console.log("API response data:", data);
      
      if (data.text) {
        setTranscript(data.text);
        onTranscript?.(data.text);
      }
      
      if (data.audioBase64 && data.mimeType) {
        console.log("Playing audio response...");
        await playAudioResponse(data.audioBase64, data.mimeType);
      } else if (data.fallback) {
        console.log("Fallback response:", data.text);
        handleError(data.text || "לא הצלחתי לעבד את ההקלטה");
      } else if (data.error) {
        console.error("API error:", data.error);
        handleError(data.text || "שגיאה בעיבוד השמע");
      }
    } catch (e: any) {
      console.error("Live API error:", e?.message || e);
      handleError("שגיאה בחיבור לשרת");
    }
  }, [userName, userGender, context, updateState, onTranscript, playAudioResponse, handleError]);

  const startListening = useCallback(async () => {
    console.log("startListening called, state:", state, "isPlaying:", isPlayingRef.current);
    if (state !== "idle" || isPlayingRef.current) {
      console.log("Blocked: state not idle or playing");
      return;
    }
    
    const hasPermission = await requestPermissions();
    if (!hasPermission) {
      console.log("No permission granted");
      return;
    }
    
    try {
      setError(null);
      updateState("listening");
      
      if (audioRecorder.isRecording) {
        console.log("Stopping existing recording first");
        await audioRecorder.stop();
      }
      
      console.log("Preparing to record...");
      await audioRecorder.prepareToRecordAsync();
      console.log("Starting recording...");
      audioRecorder.record();
      console.log("Recording started successfully");
      
      if (autoStopTimerRef.current) {
        clearTimeout(autoStopTimerRef.current);
      }
      autoStopTimerRef.current = setTimeout(() => {
        console.log("Auto-stopping after", autoStopDelay, "ms");
        stopListening();
      }, autoStopDelay);
    } catch (e: any) {
      console.error("Recording start error:", e?.message || e);
      updateState("idle");
      handleError("לא הצלחתי להתחיל הקלטה. נסה שוב.");
    }
  }, [state, requestPermissions, updateState, handleError, audioRecorder, autoStopDelay]);

  const stopListening = useCallback(async () => {
    console.log("stopListening called, state:", state, "isRecording:", audioRecorder.isRecording);
    
    if (autoStopTimerRef.current) {
      clearTimeout(autoStopTimerRef.current);
      autoStopTimerRef.current = null;
    }
    
    if (state !== "listening") {
      console.log("Not in listening state, ignoring stop");
      return;
    }
    
    try {
      console.log("Stopping recording...");
      await audioRecorder.stop();
      console.log("Recording stopped, URI:", audioRecorder.uri, "duration:", audioRecorder.currentTime);
      
      if (audioRecorder.uri) {
        console.log("Processing audio with Live API...");
        await processAudioWithLiveAPI(audioRecorder.uri);
      } else {
        console.error("No recording URI found");
        handleError("לא נמצאה הקלטה");
      }
    } catch (e: any) {
      console.error("Recording stop error:", e?.message || e);
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
    isPlayingRef.current = false;
    playbackCompleteRef.current = true;
    setAudioSource(null);
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

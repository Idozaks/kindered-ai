import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getApiUrl, apiRequest } from "@/lib/query-client";

const TOKEN_KEY = "kindred_auth_token";
const GUEST_PROGRESS_KEY = "kindred_guest_progress";

interface JourneyProgress {
  journeyId: string;
  currentStep: number;
  completed: boolean;
  lastAccessedAt?: string;
}

interface StepCompletion {
  stepIndex: number;
  completedAt: string;
}

interface ProgressData {
  progress: JourneyProgress;
  stepCompletions: StepCompletion[];
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function isGuestMode(): Promise<boolean> {
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  return !token;
}

async function getGuestProgress(): Promise<Record<string, JourneyProgress>> {
  try {
    const data = await AsyncStorage.getItem(GUEST_PROGRESS_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

async function saveGuestProgress(progress: Record<string, JourneyProgress>): Promise<void> {
  try {
    await AsyncStorage.setItem(GUEST_PROGRESS_KEY, JSON.stringify(progress));
  } catch {
    // Ignore storage errors
  }
}

export function useJourneyProgress(journeyId: string | null) {
  const queryClient = useQueryClient();
  const [localProgress, setLocalProgress] = useState<JourneyProgress | null>(null);

  // Load local progress for guests on mount
  useEffect(() => {
    if (journeyId) {
      getGuestProgress().then(allProgress => {
        if (allProgress[journeyId]) {
          setLocalProgress(allProgress[journeyId]);
        }
      });
    }
  }, [journeyId]);

  const { data, isLoading, error } = useQuery<ProgressData>({
    queryKey: ["/api/progress", journeyId],
    enabled: !!journeyId,
    queryFn: async () => {
      if (!journeyId) return { progress: { journeyId: "", currentStep: 0, completed: false }, stepCompletions: [] };
      
      // Check if guest mode first
      const guest = await isGuestMode();
      if (guest) {
        const allProgress = await getGuestProgress();
        const progress = allProgress[journeyId] || { journeyId, currentStep: 0, completed: false };
        return { progress, stepCompletions: [] };
      }
      
      const headers = await getAuthHeaders();
      const response = await fetch(
        new URL(`/api/progress/${journeyId}`, getApiUrl()).toString(),
        { headers }
      );
      
      if (!response.ok) {
        if (response.status === 401) {
          return { 
            progress: { journeyId, currentStep: 0, completed: false }, 
            stepCompletions: [] 
          };
        }
        throw new Error("Failed to fetch progress");
      }
      
      return response.json();
    },
    staleTime: 30000,
  });

  const updateProgressMutation = useMutation({
    mutationFn: async ({ 
      currentStep, 
      completed 
    }: { 
      currentStep: number; 
      completed: boolean;
    }) => {
      if (!journeyId) throw new Error("No journey selected");
      
      // Check if guest mode - use local storage
      const guest = await isGuestMode();
      if (guest) {
        const allProgress = await getGuestProgress();
        const newProgress: JourneyProgress = {
          journeyId,
          currentStep,
          completed,
          lastAccessedAt: new Date().toISOString(),
        };
        allProgress[journeyId] = newProgress;
        await saveGuestProgress(allProgress);
        setLocalProgress(newProgress);
        return newProgress;
      }
      
      const headers = await getAuthHeaders();
      const baseUrl = getApiUrl();
      const url = new URL(`/api/progress/${journeyId}`, baseUrl);
      
      const response = await fetch(url.toString(), {
        method: "PUT",
        headers: {
          ...headers,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ currentStep, completed }),
      });
      
      if (!response.ok) throw new Error("Failed to update progress");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/progress", journeyId] });
      queryClient.invalidateQueries({ queryKey: ["/api/progress"] });
    },
  });

  const recordStepMutation = useMutation({
    mutationFn: async ({ 
      stepIndex, 
      timeSpentSeconds 
    }: { 
      stepIndex: number; 
      timeSpentSeconds?: number;
    }) => {
      if (!journeyId) throw new Error("No journey selected");
      
      // Check if guest mode - skip API call for step recording
      const guest = await isGuestMode();
      if (guest) {
        // For guests, we just track overall progress, not individual step timings
        return { success: true };
      }
      
      const headers = await getAuthHeaders();
      const baseUrl = getApiUrl();
      const url = new URL(`/api/progress/${journeyId}/steps/${stepIndex}`, baseUrl);
      
      const response = await fetch(url.toString(), {
        method: "POST",
        headers: {
          ...headers,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ timeSpentSeconds }),
      });
      
      if (!response.ok) throw new Error("Failed to record step");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/progress", journeyId] });
    },
  });

  const updateProgress = useCallback(
    (currentStep: number, completed: boolean = false) => {
      return updateProgressMutation.mutateAsync({ currentStep, completed });
    },
    [updateProgressMutation]
  );

  const recordStepCompletion = useCallback(
    (stepIndex: number, timeSpentSeconds?: number) => {
      return recordStepMutation.mutateAsync({ stepIndex, timeSpentSeconds });
    },
    [recordStepMutation]
  );

  // Merge API data with local progress for guests
  const effectiveProgress = localProgress || data?.progress || { journeyId: journeyId || "", currentStep: 0, completed: false };

  return {
    progress: effectiveProgress,
    stepCompletions: data?.stepCompletions || [],
    isLoading,
    error,
    updateProgress,
    recordStepCompletion,
    isUpdating: updateProgressMutation.isPending || recordStepMutation.isPending,
  };
}

export function useAllProgress() {
  const [localProgress, setLocalProgress] = useState<JourneyProgress[]>([]);

  // Load local guest progress
  useEffect(() => {
    getGuestProgress().then(allProgress => {
      setLocalProgress(Object.values(allProgress));
    });
  }, []);

  const { data, isLoading, error, refetch } = useQuery<{ progress: JourneyProgress[] }>({
    queryKey: ["/api/progress"],
    queryFn: async () => {
      // Check if guest mode first
      const guest = await isGuestMode();
      if (guest) {
        const allProgress = await getGuestProgress();
        return { progress: Object.values(allProgress) };
      }
      
      const headers = await getAuthHeaders();
      const response = await fetch(
        new URL("/api/progress", getApiUrl()).toString(),
        { headers }
      );
      
      if (!response.ok) {
        if (response.status === 401) {
          // Fall back to guest progress
          const allProgress = await getGuestProgress();
          return { progress: Object.values(allProgress) };
        }
        throw new Error("Failed to fetch all progress");
      }
      
      return response.json();
    },
    staleTime: 30000,
  });

  // Combine API and local progress, preferring API data
  const effectiveProgress = data?.progress || localProgress;

  return {
    allProgress: effectiveProgress,
    isLoading,
    error,
    refetch,
  };
}

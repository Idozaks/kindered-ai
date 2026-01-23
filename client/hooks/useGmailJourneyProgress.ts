import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getApiUrl, apiRequest } from "@/lib/query-client";

const TOKEN_KEY = "kindred_auth_token";

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

export function useGmailJourneyProgress(journeyId: string | null) {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery<ProgressData>({
    queryKey: ["/api/gmail-progress", journeyId],
    enabled: !!journeyId,
    queryFn: async () => {
      if (!journeyId) return { progress: { journeyId: "", currentStep: 0, completed: false }, stepCompletions: [] };
      
      const headers = await getAuthHeaders();
      const response = await fetch(
        new URL(`/api/gmail-progress/${journeyId}`, getApiUrl()).toString(),
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
      
      const headers = await getAuthHeaders();
      const baseUrl = getApiUrl();
      const url = new URL(`/api/gmail-progress/${journeyId}`, baseUrl);
      
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
      queryClient.invalidateQueries({ queryKey: ["/api/gmail-progress", journeyId] });
      queryClient.invalidateQueries({ queryKey: ["/api/gmail-progress"] });
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
      
      const headers = await getAuthHeaders();
      const baseUrl = getApiUrl();
      const url = new URL(`/api/gmail-progress/${journeyId}/steps/${stepIndex}`, baseUrl);
      
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
      queryClient.invalidateQueries({ queryKey: ["/api/gmail-progress", journeyId] });
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

  return {
    progress: data?.progress || { journeyId: journeyId || "", currentStep: 0, completed: false },
    stepCompletions: data?.stepCompletions || [],
    isLoading,
    error,
    updateProgress,
    recordStepCompletion,
    isUpdating: updateProgressMutation.isPending || recordStepMutation.isPending,
  };
}

export function useAllGmailProgress() {
  const { data, isLoading, error } = useQuery<{ progress: JourneyProgress[] }>({
    queryKey: ["/api/gmail-progress"],
    queryFn: async () => {
      const headers = await getAuthHeaders();
      const response = await fetch(
        new URL("/api/gmail-progress", getApiUrl()).toString(),
        { headers }
      );
      
      if (!response.ok) {
        if (response.status === 401) {
          return { progress: [] };
        }
        throw new Error("Failed to fetch all progress");
      }
      
      return response.json();
    },
    staleTime: 30000,
  });

  return {
    allProgress: data?.progress || [],
    isLoading,
    error,
  };
}

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getApiUrl } from "@/lib/query-client";

interface User {
  id: number;
  email: string;
  displayName: string | null;
  phoneNumber: string | null;
  preferredLanguage: string | null;
  textSizePreference: string | null;
  highContrastMode: boolean | null;
  voiceGuidanceEnabled: boolean | null;
  emergencyContact: string | null;
  onboardingCompleted: boolean | null;
  createdAt: string;
  updatedAt: string;
}

interface Subscription {
  plan: string;
  status: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  subscription: Subscription | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
  completeOnboarding: () => Promise<void>;
}

interface RegisterData {
  email: string;
  password: string;
  displayName?: string;
  phoneNumber?: string;
  preferredLanguage?: string;
}

const AuthContext = createContext<AuthContextType | null>(null);

const TOKEN_KEY = "kindred_auth_token";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    subscription: null,
    isLoading: true,
    isAuthenticated: false,
  });

  useEffect(() => {
    loadStoredAuth();
  }, []);

  async function loadStoredAuth() {
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      if (token) {
        const response = await fetch(new URL("/api/auth/me", getApiUrl()).toString(), {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          setState({
            user: data.user,
            token,
            subscription: data.subscription,
            isLoading: false,
            isAuthenticated: true,
          });
          return;
        }
        await AsyncStorage.removeItem(TOKEN_KEY);
      }
    } catch (error) {
      console.error("Auth load error:", error);
    }
    setState((prev) => ({ ...prev, isLoading: false }));
  }

  async function login(email: string, password: string) {
    const response = await fetch(new URL("/api/auth/login", getApiUrl()).toString(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Login failed");
    }

    const data = await response.json();
    await AsyncStorage.setItem(TOKEN_KEY, data.token);
    setState({
      user: data.user,
      token: data.token,
      subscription: { plan: "free", status: "active" },
      isLoading: false,
      isAuthenticated: true,
    });
  }

  async function register(registerData: RegisterData) {
    const response = await fetch(new URL("/api/auth/register", getApiUrl()).toString(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(registerData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Registration failed");
    }

    const data = await response.json();
    await AsyncStorage.setItem(TOKEN_KEY, data.token);
    setState({
      user: data.user,
      token: data.token,
      subscription: { plan: "free", status: "active" },
      isLoading: false,
      isAuthenticated: true,
    });
  }

  async function logout() {
    try {
      if (state.token) {
        await fetch(new URL("/api/auth/logout", getApiUrl()).toString(), {
          method: "POST",
          headers: { Authorization: `Bearer ${state.token}` },
        });
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
    await AsyncStorage.removeItem(TOKEN_KEY);
    setState({
      user: null,
      token: null,
      subscription: null,
      isLoading: false,
      isAuthenticated: false,
    });
  }

  async function updateUser(updates: Partial<User>) {
    if (!state.token) throw new Error("Not authenticated");

    const response = await fetch(new URL("/api/auth/me", getApiUrl()).toString(), {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${state.token}`,
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Update failed");
    }

    const data = await response.json();
    setState((prev) => ({ ...prev, user: data.user }));
  }

  async function completeOnboarding() {
    if (!state.token) throw new Error("Not authenticated");

    const response = await fetch(new URL("/api/auth/complete-onboarding", getApiUrl()).toString(), {
      method: "POST",
      headers: { Authorization: `Bearer ${state.token}` },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to complete onboarding");
    }

    const data = await response.json();
    setState((prev) => ({ ...prev, user: data.user }));
  }

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        updateUser,
        completeOnboarding,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

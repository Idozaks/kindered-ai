import AsyncStorage from "@react-native-async-storage/async-storage";

const KEYS = {
  SETTINGS: "@kindred_settings",
  COMPLETED_STEPS: "@kindred_completed_steps",
  SAVED_PATHS: "@kindred_saved_paths",
  LANGUAGE: "@kindred_language",
};

export interface UserSettings {
  language: "en" | "he";
  highContrast: boolean;
  fontSize: "normal" | "large" | "xlarge";
  narratorMode: boolean;
  privacyShield: boolean;
}

export interface SavedPath {
  id: string;
  title: string;
  steps: PathStep[];
  completedSteps: string[];
  createdAt: string;
}

export interface PathStep {
  id: string;
  title: string;
  description: string;
  doriAdvice: string;
  hasSandbox: boolean;
}

const defaultSettings: UserSettings = {
  language: "he",
  highContrast: false,
  fontSize: "normal",
  narratorMode: false,
  privacyShield: true,
};

export const storage = {
  async getSettings(): Promise<UserSettings> {
    try {
      const data = await AsyncStorage.getItem(KEYS.SETTINGS);
      return data ? { ...defaultSettings, ...JSON.parse(data) } : defaultSettings;
    } catch {
      return defaultSettings;
    }
  },

  async saveSettings(settings: Partial<UserSettings>): Promise<void> {
    try {
      const current = await this.getSettings();
      const updated = { ...current, ...settings };
      await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify(updated));
    } catch (error) {
      console.error("Failed to save settings:", error);
    }
  },

  async getSavedPaths(): Promise<SavedPath[]> {
    try {
      const data = await AsyncStorage.getItem(KEYS.SAVED_PATHS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  async savePath(path: SavedPath): Promise<void> {
    try {
      const paths = await this.getSavedPaths();
      const existingIndex = paths.findIndex((p) => p.id === path.id);
      if (existingIndex >= 0) {
        paths[existingIndex] = path;
      } else {
        paths.unshift(path);
      }
      await AsyncStorage.setItem(KEYS.SAVED_PATHS, JSON.stringify(paths));
    } catch (error) {
      console.error("Failed to save path:", error);
    }
  },

  async deletePath(pathId: string): Promise<void> {
    try {
      const paths = await this.getSavedPaths();
      const filtered = paths.filter((p) => p.id !== pathId);
      await AsyncStorage.setItem(KEYS.SAVED_PATHS, JSON.stringify(filtered));
    } catch (error) {
      console.error("Failed to delete path:", error);
    }
  },

  async markStepCompleted(pathId: string, stepId: string): Promise<void> {
    try {
      const paths = await this.getSavedPaths();
      const path = paths.find((p) => p.id === pathId);
      if (path && !path.completedSteps.includes(stepId)) {
        path.completedSteps.push(stepId);
        await this.savePath(path);
      }
    } catch (error) {
      console.error("Failed to mark step completed:", error);
    }
  },

  async getLanguage(): Promise<"en" | "he"> {
    try {
      const data = await AsyncStorage.getItem(KEYS.LANGUAGE);
      return (data as "en" | "he") || "he";
    } catch {
      return "he";
    }
  },

  async setLanguage(language: "en" | "he"): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.LANGUAGE, language);
    } catch (error) {
      console.error("Failed to save language:", error);
    }
  },
};

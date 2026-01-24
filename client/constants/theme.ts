import { Platform } from "react-native";

export type ThemeMode = "classic" | "dori";

const ClassicColors = {
  light: {
    text: "#1A1A1A",
    textSecondary: "#666666",
    buttonText: "#FFFFFF",
    tabIconDefault: "#687076",
    tabIconSelected: "#5B9BD5",
    link: "#5B9BD5",
    primary: "#5B9BD5",
    secondary: "#F4B942",
    success: "#52C41A",
    warning: "#F4B942",
    danger: "#FF4D4F",
    backgroundRoot: "#F8F9FA",
    backgroundDefault: "#FFFFFF",
    backgroundSecondary: "#F0F4F8",
    backgroundTertiary: "#E8EDF2",
    glassBg: "rgba(255, 255, 255, 0.75)",
    glassBorder: "rgba(255, 255, 255, 0.5)",
    glassOverlay: "rgba(91, 155, 213, 0.1)",
    border: "#E0E0E0",
    card: "#FFFFFF",
  },
  dark: {
    text: "#ECEDEE",
    textSecondary: "#9BA1A6",
    buttonText: "#FFFFFF",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: "#5B9BD5",
    link: "#5B9BD5",
    primary: "#5B9BD5",
    secondary: "#F4B942",
    success: "#52C41A",
    warning: "#F4B942",
    danger: "#FF4D4F",
    backgroundRoot: "#1A1A2E",
    backgroundDefault: "#252542",
    backgroundSecondary: "#2D2D4A",
    backgroundTertiary: "#353552",
    glassBg: "rgba(37, 37, 66, 0.85)",
    glassBorder: "rgba(91, 155, 213, 0.3)",
    glassOverlay: "rgba(91, 155, 213, 0.15)",
    border: "#3A3A5A",
    card: "#2D2D4A",
  },
};

const DoriColors = {
  light: {
    text: "#2D1B4E",
    textSecondary: "#5C4A7A",
    buttonText: "#FFFFFF",
    tabIconDefault: "#8B7BA8",
    tabIconSelected: "#6B2D8B",
    link: "#7B3FA0",
    primary: "#6B2D8B",
    secondary: "#E040FB",
    success: "#52C41A",
    warning: "#FFB74D",
    danger: "#FF7043",
    backgroundRoot: "#F5F0FA",
    backgroundDefault: "#FFFFFF",
    backgroundSecondary: "#EDE7F6",
    backgroundTertiary: "#E1D5F0",
    glassBg: "rgba(255, 255, 255, 0.8)",
    glassBorder: "rgba(107, 45, 139, 0.2)",
    glassOverlay: "rgba(107, 45, 139, 0.08)",
    border: "#D4C4E8",
    card: "#FFFFFF",
  },
  dark: {
    text: "#F3E5F5",
    textSecondary: "#CE93D8",
    buttonText: "#FFFFFF",
    tabIconDefault: "#9575CD",
    tabIconSelected: "#BA68C8",
    link: "#CE93D8",
    primary: "#9C4DCC",
    secondary: "#E040FB",
    success: "#52C41A",
    warning: "#FFB74D",
    danger: "#FF7043",
    backgroundRoot: "#1A0A2E",
    backgroundDefault: "#2D1B4E",
    backgroundSecondary: "#3D2B5E",
    backgroundTertiary: "#4D3B6E",
    glassBg: "rgba(45, 27, 78, 0.9)",
    glassBorder: "rgba(186, 104, 200, 0.3)",
    glassOverlay: "rgba(156, 77, 204, 0.15)",
    border: "#5D4B7E",
    card: "#3D2B5E",
  },
};

export const ThemePresets = {
  classic: ClassicColors,
  dori: DoriColors,
};

export const ThemeNames: Record<ThemeMode, string> = {
  classic: "קלאסי",
  dori: "דורי סגול",
};

export const Colors = DoriColors;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  "4xl": 40,
  "5xl": 48,
  inputHeight: 56,
  buttonHeight: 56,
};

export const BorderRadius = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  "2xl": 32,
  "3xl": 40,
  full: 9999,
};

export const Typography = {
  h1: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: "700" as const,
  },
  h2: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: "700" as const,
  },
  h3: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: "600" as const,
  },
  h4: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: "600" as const,
  },
  body: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: "400" as const,
  },
  small: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "400" as const,
  },
  button: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "600" as const,
  },
  link: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: "400" as const,
  },
};

export const getShadows = (primary: string) => ({
  glass: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 8,
  },
  glassSmall: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  floating: {
    shadowColor: primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
});

export const Shadows = getShadows("#6B2D8B");

export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'Varela Round', 'SF Pro Rounded', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  },
});

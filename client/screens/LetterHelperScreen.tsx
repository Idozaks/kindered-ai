import React, { useState } from "react";
import { StyleSheet, View, Pressable, Image, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useTranslation } from "react-i18next";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import * as FileSystem from "expo-file-system";

import { ThemedText } from "@/components/ThemedText";
import { getApiUrl } from "@/lib/query-client";
import { ThemedView } from "@/components/ThemedView";
import { GlassCard } from "@/components/GlassCard";
import { GlassButton } from "@/components/GlassButton";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";

interface AnalysisResult {
  type: string;
  urgency: "high" | "medium" | "low";
  summary: string;
  actions: string[];
}

export default function LetterHelperScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const handlePickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      return;
    }

    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!pickerResult.canceled && pickerResult.assets[0]) {
      setSelectedImage(pickerResult.assets[0].uri);
      setResult(null);
    }
  };

  const handleTakePhoto = async () => {
    if (Platform.OS === "web") {
      return;
    }

    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (!permissionResult.granted) {
      return;
    }

    const pickerResult = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
    });

    if (!pickerResult.canceled && pickerResult.assets[0]) {
      setSelectedImage(pickerResult.assets[0].uri);
      setResult(null);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsAnalyzing(true);

    try {
      // Convert image to base64
      let imageBase64: string;
      
      if (selectedImage.startsWith("data:")) {
        // Already base64 (web)
        imageBase64 = selectedImage.split(",")[1];
      } else {
        // File URI (native) - read as base64
        const base64 = await FileSystem.readAsStringAsync(selectedImage, {
          encoding: "base64",
        });
        imageBase64 = base64;
      }

      // Call the AI API
      const baseUrl = getApiUrl();
      const response = await fetch(new URL("/api/ai/letter-analyze", baseUrl).href, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64 }),
      });

      if (!response.ok) {
        throw new Error("Failed to analyze document");
      }

      const data = await response.json();
      
      setResult({
        type: data.type || "Document",
        urgency: data.urgency || "low",
        summary: data.summary || "I couldn't fully analyze this document.",
        actions: data.actions || ["Review the document carefully"],
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error("Document analysis error:", error);
      setResult({
        type: "Error",
        urgency: "low",
        summary: "I'm having trouble reading this document. Please try taking a clearer photo with good lighting.",
        actions: ["Try taking another photo", "Make sure the document is flat and well-lit"],
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "high":
        return theme.danger;
      case "medium":
        return theme.warning;
      case "low":
        return theme.success;
      default:
        return theme.textSecondary;
    }
  };

  const getUrgencyLabel = (urgency: string) => {
    switch (urgency) {
      case "high":
        return t("letterHelper.urgencyHigh");
      case "medium":
        return t("letterHelper.urgencyMedium");
      case "low":
        return t("letterHelper.urgencyLow");
      default:
        return "";
    }
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAwareScrollViewCompat
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: headerHeight + Spacing.xl,
            paddingBottom: insets.bottom + Spacing.xl,
          },
        ]}
      >
        <Animated.View entering={FadeInDown.duration(500)}>
          <GlassCard style={styles.uploadCard}>
            {selectedImage ? (
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: selectedImage }}
                  style={styles.previewImage}
                  resizeMode="cover"
                />
                <Pressable
                  style={[styles.removeButton, { backgroundColor: theme.danger }]}
                  onPress={() => {
                    setSelectedImage(null);
                    setResult(null);
                  }}
                >
                  <Feather name="x" size={20} color="#FFFFFF" />
                </Pressable>
              </View>
            ) : (
              <View style={styles.uploadPlaceholder}>
                <View
                  style={[
                    styles.uploadIcon,
                    { backgroundColor: theme.primary + "20" },
                  ]}
                >
                  <Feather name="file-text" size={48} color={theme.primary} />
                </View>
                <ThemedText type="body" style={styles.uploadText}>
                  {t("letterHelper.upload")}
                </ThemedText>
              </View>
            )}

            <View style={styles.buttonRow}>
              <GlassButton
                variant="secondary"
                onPress={handlePickImage}
                icon={<Feather name="image" size={20} color={theme.primary} />}
                style={styles.halfButton}
                testID="pick-image-button"
              >
                Gallery
              </GlassButton>
              {Platform.OS !== "web" ? (
                <GlassButton
                  variant="secondary"
                  onPress={handleTakePhoto}
                  icon={<Feather name="camera" size={20} color={theme.primary} />}
                  style={styles.halfButton}
                  testID="take-photo-button"
                >
                  Camera
                </GlassButton>
              ) : null}
            </View>

            {selectedImage && !result ? (
              <GlassButton
                onPress={handleAnalyze}
                disabled={isAnalyzing}
                icon={
                  isAnalyzing ? null : (
                    <Feather name="search" size={20} color="#FFFFFF" />
                  )
                }
                testID="analyze-button"
              >
                {isAnalyzing ? t("letterHelper.analyzing") : "Analyze Document"}
              </GlassButton>
            ) : null}
          </GlassCard>
        </Animated.View>

        {result ? (
          <Animated.View entering={FadeInUp.delay(200).duration(500)}>
            <GlassCard style={styles.resultCard}>
              <View style={styles.resultRow}>
                <View
                  style={[
                    styles.resultIcon,
                    { backgroundColor: theme.primary + "20" },
                  ]}
                >
                  <Feather name="file-text" size={24} color={theme.primary} />
                </View>
                <View style={styles.resultContent}>
                  <ThemedText
                    type="small"
                    style={{ color: theme.textSecondary }}
                  >
                    {t("letterHelper.whatIsIt")}
                  </ThemedText>
                  <ThemedText type="h4">{result.type}</ThemedText>
                </View>
              </View>
            </GlassCard>

            <GlassCard style={styles.resultCard}>
              <View style={styles.resultRow}>
                <View
                  style={[
                    styles.resultIcon,
                    { backgroundColor: getUrgencyColor(result.urgency) + "20" },
                  ]}
                >
                  <Feather
                    name="alert-circle"
                    size={24}
                    color={getUrgencyColor(result.urgency)}
                  />
                </View>
                <View style={styles.resultContent}>
                  <ThemedText
                    type="small"
                    style={{ color: theme.textSecondary }}
                  >
                    {t("letterHelper.urgency")}
                  </ThemedText>
                  <ThemedText
                    type="h4"
                    style={{ color: getUrgencyColor(result.urgency) }}
                  >
                    {getUrgencyLabel(result.urgency)}
                  </ThemedText>
                </View>
              </View>
            </GlassCard>

            <GlassCard style={styles.resultCard}>
              <ThemedText
                type="small"
                style={[styles.resultLabel, { color: theme.textSecondary }]}
              >
                {t("letterHelper.summary")}
              </ThemedText>
              <ThemedText type="body" style={styles.summaryText}>
                {result.summary}
              </ThemedText>
            </GlassCard>

            <GlassCard style={styles.resultCard}>
              <ThemedText
                type="small"
                style={[styles.resultLabel, { color: theme.textSecondary }]}
              >
                {t("letterHelper.actions")}
              </ThemedText>
              {result.actions.map((action, index) => (
                <View key={index} style={styles.actionRow}>
                  <View
                    style={[
                      styles.actionNumber,
                      { backgroundColor: theme.primary + "20" },
                    ]}
                  >
                    <ThemedText
                      type="small"
                      style={{ color: theme.primary, fontWeight: "700" }}
                    >
                      {index + 1}
                    </ThemedText>
                  </View>
                  <ThemedText type="body" style={styles.actionText}>
                    {action}
                  </ThemedText>
                </View>
              ))}
            </GlassCard>
          </Animated.View>
        ) : null}
      </KeyboardAwareScrollViewCompat>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.lg,
  },
  uploadCard: {
    padding: Spacing.xl,
    gap: Spacing.lg,
  },
  uploadPlaceholder: {
    alignItems: "center",
    paddingVertical: Spacing["3xl"],
  },
  uploadIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
  },
  uploadText: {
    textAlign: "center",
  },
  imageContainer: {
    position: "relative",
    borderRadius: BorderRadius.md,
    overflow: "hidden",
  },
  previewImage: {
    width: "100%",
    height: 200,
    borderRadius: BorderRadius.md,
  },
  removeButton: {
    position: "absolute",
    top: Spacing.sm,
    right: Spacing.sm,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonRow: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  halfButton: {
    flex: 1,
  },
  resultCard: {
    padding: Spacing.xl,
  },
  resultRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  resultIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.lg,
  },
  resultContent: {
    flex: 1,
  },
  resultLabel: {
    marginBottom: Spacing.sm,
  },
  summaryText: {
    lineHeight: 28,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: Spacing.md,
  },
  actionNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  actionText: {
    flex: 1,
    paddingTop: 2,
  },
});

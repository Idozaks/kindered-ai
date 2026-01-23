import React, { useState } from "react";
import { StyleSheet, View, Pressable, Image, Platform } from "react-native";

// Helper to convert blob to base64 (for web)
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useTranslation } from "react-i18next";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import * as FileSystem from "expo-file-system/legacy";

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
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileType, setFileType] = useState<"image" | "pdf" | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
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
      setSelectedFile(pickerResult.assets[0].uri);
      setFileType("image");
      setFileName(null);
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
      setSelectedFile(pickerResult.assets[0].uri);
      setFileType("image");
      setFileName(null);
      setResult(null);
    }
  };

  const handlePickPDF = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "image/*"],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const isPDF = asset.mimeType === "application/pdf" || asset.name?.toLowerCase().endsWith(".pdf");
        
        setSelectedFile(asset.uri);
        setFileType(isPDF ? "pdf" : "image");
        setFileName(asset.name || null);
        setResult(null);
      }
    } catch (error) {
      console.error("Document picker error:", error);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsAnalyzing(true);

    try {
      // Convert file to base64
      let fileBase64: string;
      
      if (selectedFile.startsWith("data:")) {
        // Already base64 (web data URL)
        fileBase64 = selectedFile.split(",")[1];
      } else if (Platform.OS === "web") {
        // Web platform with blob URL - fetch and convert
        const response = await fetch(selectedFile);
        const blob = await response.blob();
        fileBase64 = await blobToBase64(blob);
      } else {
        // Native platform - use FileSystem
        const base64 = await FileSystem.readAsStringAsync(selectedFile, {
          encoding: "base64",
        });
        fileBase64 = base64;
      }

      // Call the AI API with appropriate mime type
      const baseUrl = getApiUrl();
      const mimeType = fileType === "pdf" ? "application/pdf" : "image/jpeg";
      const response = await fetch(new URL("/api/ai/letter-analyze", baseUrl).href, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          imageBase64: fileBase64,
          mimeType,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        // Server returned an error - show the helpful message
        setResult({
          type: "PDF Document",
          urgency: "low",
          summary: data.response || "I had trouble reading this document. Please try taking a photo instead.",
          actions: [
            "Print the document and take a photo",
            "Or take a screenshot of the PDF",
            "Then upload the image using Gallery"
          ],
        });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        return;
      }
      
      setResult({
        type: data.type || "Document",
        urgency: data.urgency || "low",
        summary: data.summary || "I couldn't fully analyze this document.",
        actions: data.actions || ["Review the document carefully"],
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error: any) {
      console.error("Document analysis error:", error?.message || error);
      const errorMessage = error?.message || "Unknown error";
      const isNetworkError = errorMessage.includes("network") || errorMessage.includes("fetch") || errorMessage.includes("Network") || errorMessage === "Unknown error";
      
      setResult({
        type: t("letterHelper.errorType"),
        urgency: "low",
        summary: isNetworkError 
          ? t("letterHelper.errorNetwork")
          : t("letterHelper.errorReading"),
        actions: isNetworkError 
          ? [t("letterHelper.actionCheckInternet"), t("letterHelper.actionTryAgain")]
          : [t("letterHelper.actionAnotherPhoto"), t("letterHelper.actionGoodLighting")],
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
            {selectedFile ? (
              <View style={styles.imageContainer}>
                {fileType === "image" ? (
                  <Image
                    source={{ uri: selectedFile }}
                    style={styles.previewImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={[styles.pdfPreview, { backgroundColor: theme.card }]}>
                    <Feather name="file-text" size={64} color={theme.primary} />
                    <ThemedText type="body" style={styles.pdfFileName} numberOfLines={2}>
                      {fileName || "PDF Document"}
                    </ThemedText>
                  </View>
                )}
                <Pressable
                  style={[styles.removeButton, { backgroundColor: theme.danger }]}
                  onPress={() => {
                    setSelectedFile(null);
                    setFileType(null);
                    setFileName(null);
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
                style={styles.thirdButton}
                testID="pick-image-button"
              >
                Gallery
              </GlassButton>
              {Platform.OS !== "web" ? (
                <GlassButton
                  variant="secondary"
                  onPress={handleTakePhoto}
                  icon={<Feather name="camera" size={20} color={theme.primary} />}
                  style={styles.thirdButton}
                  testID="take-photo-button"
                >
                  Camera
                </GlassButton>
              ) : null}
              <GlassButton
                variant="secondary"
                onPress={handlePickPDF}
                icon={<Feather name="file" size={20} color={theme.primary} />}
                style={styles.thirdButton}
                testID="pick-file-button"
              >
                Files
              </GlassButton>
            </View>

            {selectedFile && !result ? (
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
  thirdButton: {
    flex: 1,
  },
  pdfPreview: {
    width: "100%",
    height: 200,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.md,
  },
  pdfFileName: {
    textAlign: "center",
    paddingHorizontal: Spacing.lg,
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

import React, { useState } from "react";
import { StyleSheet, View, Modal, TextInput, Pressable } from "react-native";
import Animated, { FadeIn, FadeOut, SlideInUp } from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { useAura } from "@/contexts/AuraContext";
import { Spacing, BorderRadius } from "@/constants/theme";
import { AuraPulseOrb } from "./AuraPulseOrb";

interface AuraHandshakeModalProps {
  visible: boolean;
  onClose: () => void;
}

export function AuraHandshakeModal({ visible, onClose }: AuraHandshakeModalProps) {
  const { theme } = useTheme();
  const { 
    handshakeStep, 
    setUserName, 
    setUserGender,
    voiceState,
    userName,
  } = useAura();

  const [nameInput, setNameInput] = useState("");

  const handleNameSubmit = () => {
    if (nameInput.trim()) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setUserName(nameInput.trim());
      setNameInput("");
    }
  };

  const handleGenderSelect = (gender: "male" | "female") => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setUserGender(gender);
  };

  const renderContent = () => {
    if (handshakeStep === "asking_name") {
      return (
        <Animated.View 
          entering={FadeIn.duration(400)}
          style={styles.contentContainer}
        >
          <View style={styles.orbContainer}>
            <AuraPulseOrb state={voiceState} size={80} />
          </View>
          
          <ThemedText style={[styles.title, { color: theme.text }]}>
            שלום! נעים להכיר
          </ThemedText>
          
          <ThemedText style={[styles.subtitle, { color: theme.textSecondary }]}>
            איך קוראים לך?
          </ThemedText>
          
          <View style={[styles.inputContainer, { borderColor: theme.glassBorder }]}>
            <TextInput
              style={[styles.input, { color: theme.text }]}
              value={nameInput}
              onChangeText={setNameInput}
              placeholder="הקלד את השם שלך..."
              placeholderTextColor={theme.textSecondary}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleNameSubmit}
              textAlign="right"
            />
          </View>
          
          <Pressable
            style={({ pressed }) => [
              styles.submitButton,
              { backgroundColor: theme.primary, opacity: pressed ? 0.8 : 1 },
            ]}
            onPress={handleNameSubmit}
            testID="handshake-submit-name"
          >
            <Feather name="check" size={24} color="#FFFFFF" />
            <ThemedText style={styles.submitButtonText}>המשך</ThemedText>
          </Pressable>
        </Animated.View>
      );
    }

    if (handshakeStep === "asking_gender") {
      return (
        <Animated.View 
          entering={FadeIn.duration(400)}
          style={styles.contentContainer}
        >
          <View style={styles.orbContainer}>
            <AuraPulseOrb state={voiceState} size={80} />
          </View>
          
          <ThemedText style={[styles.title, { color: theme.text }]}>
            נעים מאוד, {userName}!
          </ThemedText>
          
          <ThemedText style={[styles.subtitle, { color: theme.textSecondary }]}>
            רק כדי שאדע לפנות אליך בצורה הכי מכבדת,
          </ThemedText>
          <ThemedText style={[styles.subtitle, { color: theme.textSecondary }]}>
            האם אני פונה לגבר או לאישה?
          </ThemedText>
          
          <View style={styles.genderButtons}>
            <Pressable
              style={({ pressed }) => [
                styles.genderButton,
                { 
                  backgroundColor: theme.glassBg, 
                  borderColor: theme.glassBorder,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
              onPress={() => handleGenderSelect("male")}
              testID="handshake-select-male"
            >
              <Feather name="user" size={32} color={theme.primary} />
              <ThemedText style={[styles.genderButtonText, { color: theme.text }]}>
                גבר
              </ThemedText>
            </Pressable>
            
            <Pressable
              style={({ pressed }) => [
                styles.genderButton,
                { 
                  backgroundColor: theme.glassBg, 
                  borderColor: theme.glassBorder,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
              onPress={() => handleGenderSelect("female")}
              testID="handshake-select-female"
            >
              <Feather name="user" size={32} color="#FF69B4" />
              <ThemedText style={[styles.genderButtonText, { color: theme.text }]}>
                אישה
              </ThemedText>
            </Pressable>
          </View>
        </Animated.View>
      );
    }

    return null;
  };

  if (handshakeStep === "complete" || handshakeStep === "idle") {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <BlurView intensity={80} tint="dark" style={styles.overlay}>
        <Animated.View
          entering={SlideInUp.duration(400).springify()}
          style={[
            styles.modal,
            { 
              backgroundColor: theme.glassBg,
              borderColor: theme.glassBorder,
            },
          ]}
        >
          {renderContent()}
        </Animated.View>
      </BlurView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
  },
  modal: {
    width: "100%",
    maxWidth: 400,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: Spacing.xl,
    alignItems: "center",
  },
  contentContainer: {
    width: "100%",
    alignItems: "center",
  },
  orbContainer: {
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: Spacing.md,
    lineHeight: 28,
  },
  inputContainer: {
    width: "100%",
    borderWidth: 2,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
    marginTop: Spacing.md,
  },
  input: {
    fontSize: 18,
    padding: Spacing.md,
    minHeight: 56,
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
    minWidth: 160,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
  genderButtons: {
    flexDirection: "row",
    gap: Spacing.lg,
    marginTop: Spacing.lg,
  },
  genderButton: {
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    minWidth: 120,
    gap: Spacing.sm,
  },
  genderButtonText: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: Spacing.xs,
  },
});

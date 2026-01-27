import React, { useState } from "react";
import { StyleSheet, View, Pressable, Linking, Platform, Vibration } from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Location from "expo-location";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  cancelAnimation,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, AuraColors } from "@/constants/theme";
import { CircleContact } from "./AuraCircleContacts";

interface AuraSOSButtonProps {
  primaryContact?: CircleContact;
  onSOSActivated?: (location: { latitude: number; longitude: number } | null) => void;
  expanded?: boolean;
}

export function AuraSOSButton({ primaryContact, onSOSActivated, expanded = false }: AuraSOSButtonProps) {
  const { theme } = useTheme();
  const [isActivating, setIsActivating] = useState(false);
  const scale = useSharedValue(1);
  const pulseScale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: 0.5,
  }));

  const startPulse = () => {
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.3, { duration: 500 }),
        withTiming(1, { duration: 500 })
      ),
      -1,
      true
    );
  };

  const stopPulse = () => {
    cancelAnimation(pulseScale);
    pulseScale.value = withSpring(1);
  };

  const handlePressIn = () => {
    scale.value = withSpring(0.95);
    startPulse();
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
    stopPulse();
  };

  const handleSOSPress = async () => {
    setIsActivating(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Vibration.vibrate([0, 200, 100, 200, 100, 200]);

    let location: { latitude: number; longitude: number } | null = null;

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        location = {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        };
      }
    } catch (error) {
      console.error("Failed to get location", error);
    }

    if (onSOSActivated) {
      onSOSActivated(location);
    }

    if (primaryContact) {
      const phoneNumber = primaryContact.phone.replace(/[^0-9+]/g, "");
      const url = Platform.OS === "ios" ? `tel:${phoneNumber}` : `tel:${phoneNumber}`;

      try {
        const canOpen = await Linking.canOpenURL(url);
        if (canOpen) {
          await Linking.openURL(url);
        }
      } catch (error) {
        console.error("Failed to initiate call", error);
      }
    }

    setIsActivating(false);
  };

  const buttonSize = expanded ? { minWidth: 200, height: 80 } : { width: 80, height: 80 };

  return (
    <View style={[styles.container, expanded && styles.expandedContainer]}>
      <Animated.View
        style={[
          styles.pulseRing,
          { backgroundColor: AuraColors.emergency },
          pulseStyle,
          expanded ? { width: 220, height: 100, borderRadius: 50 } : null,
        ]}
      />
      <Animated.View style={animatedStyle}>
        <Pressable
          onPress={handleSOSPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={[
            styles.button,
            buttonSize,
            { backgroundColor: AuraColors.emergency },
            expanded && styles.expandedButton,
          ]}
          testID="sos-button"
          disabled={isActivating}
        >
          <Feather
            name="alert-triangle"
            size={expanded ? 36 : 32}
            color="#FFFFFF"
          />
          {expanded ? (
            <View style={styles.expandedContent}>
              <ThemedText style={styles.sosText}>Emergency Help</ThemedText>
              <ThemedText style={styles.sosSubtext}>Tap to call for help</ThemedText>
            </View>
          ) : null}
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  expandedContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  pulseRing: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  button: {
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: AuraColors.emergency,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  expandedButton: {
    flexDirection: "row",
    borderRadius: 40,
    paddingHorizontal: Spacing.xl,
    gap: Spacing.md,
  },
  expandedContent: {
    alignItems: "flex-start",
  },
  sosText: {
    fontSize: 22,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  sosSubtext: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
  },
});
